import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";
import spiceClient from "./spice";
import { getContractAddresses, supportedChains } from "./utils";

const getDepositsSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export const getDeposits = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain },
  } = getDepositsSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);

  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const response = (
    await spiceClient.query(`
      WITH NonCoalescedDailyTokenDeposits AS (
        SELECT
            TO_DATE(block_timestamp) AS "date",
            token,
            SUM(token_amount) / POWER(10, 18) AS total_amount,
            SUM(shares) / POWER(10, 18) AS total_shares
        FROM ${chain}.eigenlayer.strategy_manager_deposits
        WHERE token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
        GROUP BY "date", token
      ),
      NonCoalescedDailyValidatorDeposits AS (
          SELECT
              TO_DATE(GREATEST(
                  COALESCE(ep.block_timestamp, 0),
                  1606824023 + 32 * 12 * activation_eligibility_epoch,
                  COALESCE(bte.block_timestamp, 0)
              )) as "date",
              NULL as token,
              count(*) * 32 AS total_amount,
              count(*) * 32 AS total_shares
          FROM ${chain}.beacon.validators vl
          INNER JOIN ${chain}.eigenlayer.eigenpods ep
              ON vl.withdrawal_credentials = ep.withdrawal_credential
          LEFT JOIN ${chain}.beacon.bls_to_execution_changes bte
              ON bte.validator_index = vl.validator_index
          GROUP BY "date"
      ),
      NonCoalescedDailyDeposits AS (
          SELECT * FROM NonCoalescedDailyTokenDeposits UNION ALL SELECT * FROM NonCoalescedDailyValidatorDeposits
      ),
      MinDate AS (
          SELECT MIN("date") AS min_date FROM NonCoalescedDailyDeposits
      ),
      Series AS (
          SELECT ROW_NUMBER() OVER () as number FROM ${chain}.recent_transactions
      ),
      DateSeries AS (
          SELECT DATE_ADD((SELECT min_date FROM MinDate), number) AS "date"
          FROM Series
          WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))
      ),
      TokenSeries AS (
          SELECT NULL AS token
          ${tokenAddressList.map((addr) => `UNION ALL SELECT '${addr}'`).join("\n")}
      ),
      TokenDateCoalesceSeries AS (
          SELECT
              ds."date",
              ts.token
          FROM DateSeries ds
          CROSS JOIN TokenSeries ts
      ),
      CoalescedDailyDeposits AS (
          SELECT
              tdcs."date",
              tdcs.token,
              COALESCE(ncdd.total_amount, 0) AS total_amount,
              COALESCE(ncdd.total_shares, 0) AS total_shares
          FROM TokenDateCoalesceSeries tdcs
          LEFT JOIN NonCoalescedDailyDeposits ncdd
              ON tdcs."date" = ncdd."date" AND (tdcs.token = ncdd.token OR (tdcs.token IS NULL AND ncdd.token IS NULL))
      ),
      CumulativeDeposits AS (
          SELECT
              cdd."date",
              cdd.token,
              cdd.total_amount,
              cdd.total_shares,
              SUM(COALESCE(cdd.total_amount, 0)) OVER (PARTITION BY cdd.token ORDER BY cdd."date") AS cumulative_amount,
              SUM(COALESCE(cdd.total_shares, 0)) OVER (PARTITION BY cdd.token ORDER BY cdd."date") AS cumulative_shares
          FROM CoalescedDailyDeposits cdd
      ),
      Last30DaysData AS (
        SELECT * FROM CumulativeDeposits as ldd
        WHERE ldd."date" >= DATE_ADD(CURRENT_DATE, -30)
      )
      SELECT
          ldd."date",
          ldd.token,
          ldd.total_amount,
          ldd.total_shares,
          ldd.cumulative_amount,
          ldd.cumulative_shares
      FROM Last30DaysData ldd
      ORDER BY
          ldd."date",
          ldd.token;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push(el);

    return acc;
  }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({
      stEthDeposits: stEthAddress ? groupedResponse[stEthAddress] : null,
      cbEthDeposits: cbEthAddress ? groupedResponse[cbEthAddress] : null,
      rEthDeposits: rEthAddress ? groupedResponse[rEthAddress] : null,
      beaconChainDeposits: groupedResponse["null"],
    }),
  };
};

const getStrategyDepositLeaderBoardSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export const getStrategyDepositLeaderBoard = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain },
  } = getStrategyDepositLeaderBoardSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);

  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const response = (
    await spiceClient.query(`
      WITH ranked_deposits AS (
        SELECT
            depositor,
            token,
            SUM(token_amount) / POWER(10, 18) AS total_amount,
            SUM(shares) / POWER(10, 18) AS total_shares,
            ROW_NUMBER() OVER (PARTITION BY token ORDER BY total_shares DESC) AS rn
        FROM ${chain}.eigenlayer.strategy_manager_deposits
        WHERE token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
        GROUP BY depositor, token
      )
        SELECT depositor, token, total_amount, total_shares
        FROM ranked_deposits
        WHERE rn <= 50;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push(el);

    return acc;
  }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({
      stEthDeposits: stEthAddress ? groupedResponse[stEthAddress] : null,
      cbEthDeposits: cbEthAddress ? groupedResponse[cbEthAddress] : null,
      rEthDeposits: rEthAddress ? groupedResponse[rEthAddress] : null,
    }),
  };
};

const getWithdrawalsSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export const getWithdrawals = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain },
  } = getWithdrawalsSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);

  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const response = (
    await spiceClient.query(`
      WITH DailyTokenWithdrawals AS (
        SELECT
            TO_DATE(block_timestamp) AS "date",
            token,
            SUM(token_amount) / POWER(10, 18) AS total_amount,
            SUM(shares) / POWER(10, 18) AS total_shares
        FROM ${chain}.eigenlayer.strategy_manager_withdrawal_completed
        WHERE token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
        AND receive_as_tokens
        GROUP BY "date", token
      ),
      DailyValidatorWithdrawals AS (
        SELECT
            TO_DATE(1606824023 + 32 * 12 * exit_epoch) as "date",
            NULL as token,
            count(*) * 32 AS total_amount,
            count(*) * 32 AS total_shares
        FROM
            ${chain}.beacon.validators vl
        INNER JOIN
            ${chain}.eigenlayer.eigenpods ep
        ON
            LEFT(vl.withdrawal_credentials, 4) = '0x01' AND vl.withdrawal_credentials = ep.withdrawal_credential
        GROUP BY "date"
      ),
      DailyWithdrawals AS (
          SELECT * FROM DailyTokenWithdrawals UNION ALL SELECT * FROM DailyValidatorWithdrawals
      ),
      MinDate AS (
          SELECT MIN("date") AS min_date FROM DailyTokenWithdrawals
      ),
      DateSeries AS (
          SELECT DISTINCT DATE_ADD((SELECT min_date FROM MinDate), number) AS "date"
          FROM ${chain}.blocks
          WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))
      ),
      TokenSeries AS (
          SELECT NULL AS token
          ${tokenAddressList.map((addr) => `UNION ALL SELECT '${addr}'`).join("\n")}
      ),
      AllCombinations AS (
        SELECT 
            ds."date", 
            ts.token
        FROM 
            DateSeries ds
        CROSS JOIN 
            TokenSeries ts
      ),
      CumulativeWithdrawals AS (
          SELECT
              ac."date",
              ac.token,
              COALESCE(td.total_amount, 0) AS total_amount,
              COALESCE(td.total_shares, 0) AS total_shares,
              SUM(COALESCE(td.total_amount, 0)) OVER (PARTITION BY ac.token ORDER BY ac."date") AS cumulative_amount,
              SUM(COALESCE(td.total_shares, 0)) OVER (PARTITION BY ac.token ORDER BY ac."date") AS cumulative_shares
          FROM
              AllCombinations ac
          LEFT JOIN
            DailyWithdrawals td
          ON
              ac."date" = td."date"
          AND
              (ac.token = td.token OR (ac.token IS NULL AND td.token IS NULL))
      ),
      Last30DaysData AS (
          SELECT * FROM CumulativeWithdrawals as cd
          WHERE cd."date" >= DATE_ADD(CURRENT_DATE, -30)
      )
      SELECT
        ldd."date",
        ldd.token,
        ldd.total_amount,
        ldd.total_shares,
        ldd.cumulative_amount,
        ldd.cumulative_shares
      FROM
        Last30DaysData ldd
      ORDER BY
        ldd."date",
        ldd.token;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push(el);

    return acc;
  }, {});

  return {
    statusCode: 200,
    body: JSON.stringify({
      stEthWithdrawals: stEthAddress ? groupedResponse[stEthAddress] : null,
      cbEthWithdrawals: cbEthAddress ? groupedResponse[cbEthAddress] : null,
      rEthWithdrawals: rEthAddress ? groupedResponse[rEthAddress] : null,
      beaconChainWithdrawals: groupedResponse["null"],
    }),
  };
};

const totalStakedBeaconChainEthSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export async function totalStakedBeaconChainEth(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    queryStringParameters: { chain },
  } = totalStakedBeaconChainEthSchema.parse(event);

  try {
    const result = await spiceClient.query(`
      SELECT SUM(effective_balance) / POW(10,9) as final_balance
      FROM ${chain}.beacon.validators
      JOIN ${chain}.eigenlayer.eigenpods
      ON
        ${chain}.beacon.validators.withdrawal_credentials = ${chain}.eigenlayer.eigenpods.withdrawal_credential
        AND effective_balance != '0';
    `);
    return { statusCode: 200, body: result.toString() };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

const stakersBeaconChainEthSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export async function stakersBeaconChainEth(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    queryStringParameters: { chain },
  } = stakersBeaconChainEthSchema.parse(event);

  try {
    const result = await spiceClient.query(`
      SELECT 
          ${chain}.eigenlayer.eigenpods.pod_owner,
          SUM(${chain}.beacon.validators.effective_balance) / POWER(10,9) AS total_effective_balance
      FROM 
          ${chain}.beacon.validators
      JOIN 
          ${chain}.eigenlayer.eigenpods
      ON 
          ${chain}.beacon.validators.withdrawal_credentials = ${chain}.eigenlayer.eigenpods.withdrawal_credential 
          AND ${chain}.beacon.validators.effective_balance != '0'
      GROUP BY 
          ${chain}.eigenlayer.eigenpods.pod_owner
      ORDER BY total_effective_balance DESC;
    `);

    return {
      statusCode: 200,
      body: JSON.stringify(result.toArray()),
    };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}
