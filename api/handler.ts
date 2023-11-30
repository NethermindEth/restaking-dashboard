import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { z } from "zod";

import {
  getContractAddresses,
  startingEpochTimestamps,
  supportedChains,
  supportedTimelines,
  timelineToDays,
} from "./utils";
import spiceClient from "./spice";

const getDepositsSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
    timeline: z.enum(supportedTimelines),
  }),
});

export const getDeposits = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain, timeline },
  } = getDepositsSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);
  
  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const days = timelineToDays[timeline];

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
                  ${startingEpochTimestamps[chain]} + 32 * 12 * activation_eligibility_epoch,
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
      TimelineDeposits AS (
        SELECT * FROM CumulativeDeposits as cd
        ${(days !== Infinity)? `WHERE cd."date" >= DATE_ADD(CURRENT_DATE, -${days})` : ""}
      )
      SELECT
          td."date",
          td.token,
          td.total_amount,
          td.total_shares,
          td.cumulative_amount,
          td.cumulative_shares
      FROM TimelineDeposits td
      ORDER BY
          td."date",
          td.token;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push({
      totalAmount: el.total_amount,
      totalShares: el.total_shares,
      cumulativeAmount: el.cumulative_amount,
      cumulativeShares: el.cumulative_shares,
    });

    return acc;
  }, {});

  return {
    statusCode: 200,
    headers: process.env.CORS_ORIGIN_WHITELIST ? {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN_WHITELIST,
      "Access-Control-Allow-Credentials": false,
    } : {},
    body: JSON.stringify({
      timestamps: Array.from(new Set(response.map(el => el.date.toLocaleDateString("fr-CA", { timeZone: "UTC" })))),
      deposits: {
        stEth: stEthAddress ? groupedResponse[stEthAddress] : null,
        cbEth: cbEthAddress ? groupedResponse[cbEthAddress] : null,
        rEth: rEthAddress ? groupedResponse[rEthAddress] : null,
        beacon: groupedResponse["null"],
      },
    }),
  };
};

const getLeaderboardSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
  }),
});

export const getLeaderboard = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain },
  } = getLeaderboardSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);
  
  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const response = (
    await spiceClient.query(`
      WITH token_deposits AS (
          SELECT
              depositor,
              token,
              SUM(shares) / POWER(10, 18) AS total_shares
          FROM ${chain}.eigenlayer.strategy_manager_deposits
          WHERE token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
          GROUP BY depositor, token
      ),
      token_withdrawals AS (
          SELECT
              depositor,
              token,
              SUM(shares) / POWER(10, 18) AS total_shares
          FROM ${chain}.eigenlayer.strategy_manager_withdrawal_completed
          WHERE token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
          GROUP BY depositor, token
      ),
      token_depositors AS (
          SELECT
              d.depositor,
              d.token,
              COALESCE(d.total_shares, 0) - COALESCE(w.total_shares, 0) as total_shares
          FROM token_deposits d
          LEFT JOIN token_withdrawals w ON d.depositor = w.depositor AND d.token = w.token
      ),
      ranked_token_depositors AS (
          SELECT
              depositor,
              token,
              total_shares
          FROM (
            SELECT
                depositor,
                token,
                total_shares,
                ROW_NUMBER() OVER (PARTITION BY token ORDER BY total_shares DESC) AS rn
            FROM token_depositors
          )
          WHERE rn <= 50
      ),
      ranked_beacon_depositors AS (
          SELECT pod_owner AS depositor, NULL AS token, total_effective_balance AS total_shares
          FROM (
              SELECT 
                  pod_owner,
                  SUM(effective_balance) / POWER(10,9) AS total_effective_balance,
                  ROW_NUMBER() OVER (ORDER BY total_effective_balance DESC) AS rn
              FROM ${chain}.beacon.validators v
              JOIN 
                  ${chain}.eigenlayer.eigenpods e
                  ON v.withdrawal_credentials = e.withdrawal_credential AND v.effective_balance != '0'
              GROUP BY 
                  e.pod_owner
          )
          WHERE rn <= 50
      ),
      ranked_deposits AS (
          SELECT * FROM ranked_token_depositors
          UNION ALL
          SELECT * FROM ranked_beacon_depositors
      )
      SELECT depositor, token, total_shares
      FROM ranked_deposits;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push({
      depositor: el.depositor,
      totalShares: el.total_shares,
    });

    return acc;
  }, {});

  return {
    statusCode: 200,
    headers: process.env.CORS_ORIGIN_WHITELIST ? {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN_WHITELIST,
      "Access-Control-Allow-Credentials": false,
    } : {},
    body: JSON.stringify({
      leaderboard: {
        stEth: stEthAddress ? groupedResponse[stEthAddress] : null,
        cbEth: cbEthAddress ? groupedResponse[cbEthAddress] : null,
        rEth: rEthAddress ? groupedResponse[rEthAddress] : null,
        beacon: groupedResponse["null"],
      },
    }),
  };
};

const getWithdrawalsSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
    timeline: z.enum(supportedTimelines),
  }),
});

export const getWithdrawals = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    queryStringParameters: { chain, timeline },
  } = getWithdrawalsSchema.parse(event);

  const tokenAddresses = getContractAddresses(chain);
  
  const { stEthAddress, cbEthAddress, rEthAddress } = tokenAddresses;
  const tokenAddressList = Object.values(tokenAddresses).filter((el) => el);

  const days = timelineToDays[timeline];

  const response = (
    await spiceClient.query(`
      WITH NonCoalescedDailyTokenWithdrawals AS (
        SELECT
            TO_DATE(block_timestamp) AS "date",
            token,
            SUM(token_amount) / POWER(10, 18) AS total_amount,
            SUM(shares) / POWER(10, 18) AS total_shares
        FROM ${chain}.eigenlayer.strategy_manager_withdrawal_completed
        WHERE
          token IN (${tokenAddressList.map((addr) => `'${addr}'`).join(",")})
          AND receive_as_tokens
        GROUP BY "date", token
      ),
      NonCoalescedDailyValidatorWithdrawals AS (
        SELECT
            TO_DATE(${startingEpochTimestamps[chain]} + 32 * 12 * exit_epoch) as "date",
            NULL as token,
            count(*) * 32 AS total_amount,
            count(*) * 32 AS total_shares
        FROM
            ${chain}.beacon.validators vl
        INNER JOIN
            ${chain}.eigenlayer.eigenpods ep
        ON
            vl.withdrawal_credentials = ep.withdrawal_credential
        GROUP BY "date"
      ),
      NonCoalescedDailyWithdrawals AS (
          SELECT * FROM NonCoalescedDailyTokenWithdrawals UNION ALL SELECT * FROM NonCoalescedDailyValidatorWithdrawals
      ),
      MinDate AS (
          SELECT MIN("date") AS min_date FROM NonCoalescedDailyWithdrawals
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
      CoalescedDailyWithdrawals AS (
          SELECT
              tdcs."date",
              tdcs.token,
              COALESCE(ncdw.total_amount, 0) AS total_amount,
              COALESCE(ncdw.total_shares, 0) AS total_shares
          FROM TokenDateCoalesceSeries tdcs
          LEFT JOIN NonCoalescedDailyWithdrawals ncdw
              ON tdcs."date" = ncdw."date" AND (tdcs.token = ncdw.token OR (tdcs.token IS NULL AND ncdw.token IS NULL))
      ),
      CumulativeWithdrawals AS (
          SELECT
              cdw."date",
              cdw.token,
              cdw.total_amount,
              cdw.total_shares,
              SUM(COALESCE(cdw.total_amount, 0)) OVER (PARTITION BY cdw.token ORDER BY cdw."date") AS cumulative_amount,
              SUM(COALESCE(cdw.total_shares, 0)) OVER (PARTITION BY cdw.token ORDER BY cdw."date") AS cumulative_shares
          FROM CoalescedDailyWithdrawals cdw
      ),
      TimelineWithdrawals AS (
        SELECT * FROM CumulativeWithdrawals as cw
        ${(days !== Infinity)? `WHERE cw."date" >= DATE_ADD(CURRENT_DATE, -${days})` : ""}
      )
      SELECT
          tw."date",
          tw.token,
          tw.total_amount,
          tw.total_shares,
          tw.cumulative_amount,
          tw.cumulative_shares
      FROM TimelineWithdrawals tw
      ORDER BY
          tw."date",
          tw.token;
    `)
  ).toArray();

  const groupedResponse = response.reduce((acc, el) => {
    if (!acc[el.token]) acc[el.token] = [];

    acc[el.token].push({
      totalAmount: el.total_amount,
      totalShares: el.total_shares,
      cumulativeAmount: el.cumulative_amount,
      cumulativeShares: el.cumulative_shares,
    });

    return acc;
  }, {});

  return {
    statusCode: 200,
    headers: process.env.CORS_ORIGIN_WHITELIST ? {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN_WHITELIST,
      "Access-Control-Allow-Credentials": false,
    } : {},
    body: JSON.stringify({
      timestamps: Array.from(new Set(response.map(el => el.date.toLocaleDateString("fr-CA", { timeZone: "UTC" })))),
      withdrawals: {
        stEth: stEthAddress ? groupedResponse[stEthAddress] : null,
        cbEth: cbEthAddress ? groupedResponse[cbEthAddress] : null,
        rEth: rEthAddress ? groupedResponse[rEthAddress] : null,
        beacon: groupedResponse["null"],
      },
    }),
  };
};

const getTotalStakedBeaconSchema = z.object({
  queryStringParameters: z.object({
    chain: z.enum(supportedChains),
    timeline: z.enum(supportedTimelines),
  }),
});

export async function getTotalStakedBeacon(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const {
    queryStringParameters: { chain, timeline },
  } = getTotalStakedBeaconSchema.parse(event);

  const result = (await spiceClient.query(`
      SELECT SUM(effective_balance) / POW(10,9) as total_staked
      FROM ${chain}.beacon.validators
      JOIN ${chain}.eigenlayer.eigenpods
      ON
          ${chain}.beacon.validators.withdrawal_credentials = ${chain}.eigenlayer.eigenpods.withdrawal_credential
          AND effective_balance != '0';
  `)).toArray();

  if (!result) {
    throw new Error("Unexpected empty result");
  }

  return {
    statusCode: 200,
    headers: process.env.CORS_ORIGIN_WHITELIST ? {
      "Access-Control-Allow-Origin": process.env.CORS_ORIGIN_WHITELIST,
      "Access-Control-Allow-Credentials": false,
    } : {},
    body: JSON.stringify({
      totalStakedBeacon: result[0].total_staked,
    }),
  };
}
