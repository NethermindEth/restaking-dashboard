import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import SpiceClient from "./spice";
import {
  DailyTokenData,
  DailyTokenWithdrawals,
  LeaderboardUserData,
} from "@/lib/utils";

const STETH_ADDRESS =
  "0xae7ab96520de3a18e5e111b5eaab095312d7fe84".toLowerCase();
const CBETH_ADDRESS =
  "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704".toLowerCase();
const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393".toLowerCase();

export const getDeposits = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = await SpiceClient.query(`
  WITH DailyTokenDeposits AS (
    SELECT
        TO_DATE(block_timestamp) AS "date",
        token,
        SUM(token_amount) / POWER(10, 18) AS total_amount,
        SUM(shares) / POWER(10, 18) AS total_shares
    FROM eth.eigenlayer.strategy_manager_deposits
    WHERE token IN (
        '${STETH_ADDRESS}',
        '${CBETH_ADDRESS}',
        '${RETH_ADDRESS}'
    )
    GROUP BY "date", token
),
DailyValidatorDeposits AS (
    SELECT
        GREATEST(
            TO_DATE(ep.block_timestamp),
            TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),
            TO_DATE(COALESCE(bte.block_timestamp, 0))
        ) as "date",
        NULL as token,
        count(*) * 32 AS total_amount,
        count(*) * 32 AS total_shares
    FROM
        eth.beacon.validators vl
    INNER JOIN
        eth.eigenlayer.eigenpods ep
    ON
        LEFT(vl.withdrawal_credentials, 4) = '0x01' AND vl.withdrawal_credentials = ep.withdrawal_credential
    LEFT JOIN
        eth.beacon.bls_to_execution_changes bte
    ON
        bte.validator_index = vl.validator_index
    GROUP BY "date"
),
DailyDeposits AS (
    SELECT * FROM DailyTokenDeposits UNION ALL SELECT * FROM DailyValidatorDeposits
),
MinDate AS (
    SELECT MIN("date") AS min_date FROM DailyDeposits
),
DateSeries AS (
    SELECT DISTINCT DATE_ADD((SELECT min_date FROM MinDate), number) AS "date"
    FROM eth.blocks
    WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))
),
TokenSeries AS (
    SELECT '${STETH_ADDRESS}' AS token
    UNION ALL
        SELECT '${CBETH_ADDRESS}'
    UNION ALL
        SELECT '${RETH_ADDRESS}'
    UNION ALL
        SELECT NULL
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
CumulativeDeposits AS (
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
        DailyDeposits td
    ON
        ac."date" = td."date"
    AND
        (ac.token = td.token OR (ac.token IS NULL AND td.token IS NULL))
  )
  SELECT
    cd."date",
    cd.token,
    cd.total_amount,
    cd.total_shares,
    cd.cumulative_amount,
    cd.cumulative_shares
  FROM
    CumulativeDeposits cd
  ORDER BY
    cd."date",
    cd.token;
  `);

  const rEthDeposits: DailyTokenData[] = [];
  const cbEthDeposits: DailyTokenData[] = [];
  const stEthDeposits: DailyTokenData[] = [];
  const beaconChainDeposits: DailyTokenData[] = [];

  const array = response.toArray();

  // @ts-ignore
  array.forEach((ele) => {
    switch (ele.token) {
      case RETH_ADDRESS:
        rEthDeposits.push(ele);
        break;
      case CBETH_ADDRESS:
        cbEthDeposits.push(ele);
        break;
      case STETH_ADDRESS:
        stEthDeposits.push(ele);
        break;
      default:
        beaconChainDeposits.push(ele);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      stEthDeposits,
      cbEthDeposits,
      rEthDeposits,
      beaconChainDeposits,
    }),
  };
};

export const getStrategyDepositLeaderBoard = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("here");
  const response = await SpiceClient.query(`
  WITH ranked_deposits AS (
    SELECT
        depositor,
        token,
        SUM(token_amount) / POWER(10, 18) AS total_amount,
        SUM(shares) / POWER(10, 18) AS total_shares,
        ROW_NUMBER() OVER (PARTITION BY token ORDER BY total_shares DESC) AS rn
    FROM eth.eigenlayer.strategy_manager_deposits
    WHERE token IN (
        '${STETH_ADDRESS}',
        '${CBETH_ADDRESS}',
        '${RETH_ADDRESS}'
    )
    GROUP BY depositor, token
)
    SELECT *
    FROM ranked_deposits
    WHERE rn <= 50;
`);

  const rEthDeposits: DailyTokenData[] = [];
  const cbEthDeposits: DailyTokenData[] = [];
  const stEthDeposits: DailyTokenData[] = [];

  const deposits = response.toArray();

  deposits.forEach((ele) => {
    ele = {
      total_amount: ele.total_amount,
      total_staked_shares: ele.total_shares,
      depositor: ele.depositor,
      token: ele.token,
    };

    switch (ele.token) {
      case RETH_ADDRESS:
        rEthDeposits.push(ele);
        break;
      case CBETH_ADDRESS:
        cbEthDeposits.push(ele);
        break;
      case STETH_ADDRESS:
        stEthDeposits.push(ele);
        break;
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ stEthDeposits, cbEthDeposits, rEthDeposits }),
  };
};

export const getWithdrawals = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const response = await SpiceClient.query(`
  WITH DailyTokenWithdrawals AS (
    SELECT
        TO_DATE(block_timestamp) AS "date",
        token,
        SUM(token_amount) / POWER(10, 18) AS total_amount,
        SUM(shares) / POWER(10, 18) AS total_shares
    FROM eth.eigenlayer.strategy_manager_withdrawal_completed
    WHERE token IN (
        '${STETH_ADDRESS}',
        '${CBETH_ADDRESS}',
        '${RETH_ADDRESS}'
    )
    AND receive_as_tokens
    GROUP BY "date", token
),
DailyValidatorWithdrawals AS (
    SELECT
        TO_DATE(1606845623 + 32 * 12 * exit_epoch) as "date",
        NULL as token,
        count(*) * 32 AS total_amount,
        count(*) * 32 AS total_shares
        FROM
            eth.beacon.validators vl
        INNER JOIN
            eth.eigenlayer.eigenpods ep
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
        FROM eth.blocks
        WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))
    ),
    TokenSeries AS (
        SELECT '${STETH_ADDRESS}' AS token
        UNION ALL
            SELECT '${RETH_ADDRESS}'
        UNION ALL
            SELECT '${CBETH_ADDRESS}'
        UNION ALL
            SELECT NULL
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
  CumulativeWithdrawls AS (
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
    )
  SELECT
    cd."date",
    cd.token,
    cd.total_amount,
    cd.total_shares,
    cd.cumulative_amount,
    cd.cumulative_shares
  FROM
    CumulativeWithdrawls cd
  ORDER BY
    cd."date",
    cd.token;
  `);

  const rEthWithdrawls: DailyTokenWithdrawals[] = [];
  const cbEthWithdrawls: DailyTokenWithdrawals[] = [];
  const stEthWithdrawls: DailyTokenWithdrawals[] = [];
  const beaconChainWithdrawls: DailyTokenWithdrawals[] = [];

  const array = response.toArray();

  // @ts-ignore
  array.forEach((ele) => {
    switch (ele.token) {
      case RETH_ADDRESS:
        rEthWithdrawls.push(ele);
        break;
      case CBETH_ADDRESS:
        cbEthWithdrawls.push(ele);
        break;
      case STETH_ADDRESS:
        stEthWithdrawls.push(ele);
        break;
      default:
        beaconChainWithdrawls.push(ele);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      stEthWithdrawls,
      cbEthWithdrawls,
      rEthWithdrawls,
      beaconChainWithdrawls,
    }),
  };
};

export async function totalStakedBeaconChainEth() {
  try {
    const result =
      await SpiceClient.query(`SELECT SUM(effective_balance)/POW(10,9) as final_balance
                FROM eth.beacon.validators
                JOIN eth.eigenlayer.eigenpods
                ON eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential AND effective_balance!='0'
            `);
    return { statusCode: 200, body: JSON.stringify(result.toString()) };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export async function stakersBeaconChainEth() {
  try {
    const result = await SpiceClient.query(`
    SELECT 
    eth.eigenlayer.eigenpods.pod_owner,
    SUM(eth.beacon.validators.effective_balance) / POWER(10,9) AS total_effective_balance
FROM 
    eth.beacon.validators
JOIN 
    eth.eigenlayer.eigenpods
ON 
    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential 
    AND eth.beacon.validators.effective_balance != '0'
GROUP BY 
    eth.eigenlayer.eigenpods.pod_owner
ORDER BY total_effective_balance DESC;`);

    return {
      statusCode: 200,
      body: JSON.stringify(result.toArray()),
    };
  } catch (err: any) {
    console.log(err);
    throw err;
  }
}

export async function dailyBeaconChainETHDeposit() {
  try {
    const result = await SpiceClient.query(`
    WITH Daily_Deposits AS (
        SELECT 
            GREATEST(
                TO_DATE(ep.block_timestamp),
                TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),
                TO_DATE(COALESCE(bte.block_timestamp, 0))
            ) as "date",
            CAST(count(*) * 32 AS FLOAT) AS daily_added_effective_balance
        FROM 
            eth.beacon.validators vl
        JOIN 
            eth.eigenlayer.eigenpods ep
        ON 
            vl.withdrawal_credentials = ep.withdrawal_credential
        LEFT JOIN
            eth.beacon.bls_to_execution_changes bte
        ON
            bte.validator_index = vl.validator_index
        GROUP BY 
            "date"
    ),
    Date_Series AS (
        SELECT DISTINCT DATE_ADD((SELECT MIN("date") FROM Daily_Deposits), number) AS "date"
        FROM eth.blocks
        WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT MIN("date") FROM Daily_Deposits))
    )
    SELECT 
        Date_Series."date",
        COALESCE(Daily_Deposits.daily_added_effective_balance, 0) AS daily_added_effective_balance,
        SUM(COALESCE(Daily_Deposits.daily_added_effective_balance, 0)) OVER (ORDER BY Date_Series."date" ASC) AS cumulative_daily_effective_balance
    FROM 
        Date_Series
    LEFT JOIN
        Daily_Deposits
    ON 
        Date_Series."date" = Daily_Deposits."date"
    ORDER BY 
        Date_Series."date";
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
