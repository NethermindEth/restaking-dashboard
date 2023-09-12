import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import SpiceClient from "./spice";
import { DailyTokenData } from "@/lib/utils";

const STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
const CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";

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
        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
        '0xae78736cd615f374d3085123a210448e74fc6393'
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
    SELECT '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' AS token
    UNION ALL
        SELECT '0xbe9895146f7af43049ca1c1ae358b0541ea49704'
    UNION ALL
        SELECT '0xae78736cd615f374d3085123a210448e74fc6393'
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
)
SELECT
    ac."date",
    ac.token,
    COALESCE(td.total_amount, 0) AS total_amount,
    COALESCE(td.total_shares, 0) AS total_shares
FROM
    AllCombinations ac
LEFT JOIN
    DailyDeposits td
ON
    ac."date" = td."date"
AND
    (ac.token = td.token OR (ac.token IS NULL AND td.token IS NULL))
ORDER BY
    ac."date",
    ac.token;
    `);

  const rEthDeposits: DailyTokenData[] = [];
  const cbEthDeposits: DailyTokenData[] = [];
  const stEthDeposits: DailyTokenData[] = [];

  const array = response.toArray();

  // @ts-ignore
  array.forEach((ele) => {
    if (ele.token === RETH_ADDRESS.toLowerCase()) {
      rEthDeposits.push(ele);
    } else if (ele.token === CBETH_ADDRESS.toLowerCase()) {
      cbEthDeposits.push(ele);
    } else if (ele.token === STETH_ADDRESS.toLowerCase()) {
      stEthDeposits.push(ele);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify([stEthDeposits, cbEthDeposits, rEthDeposits]),
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
        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
        '0xae78736cd615f374d3085123a210448e74fc6393'
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
        SELECT '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' AS token
        UNION ALL
            SELECT '0xbe9895146f7af43049ca1c1ae358b0541ea49704'
        UNION ALL
            SELECT '0xae78736cd615f374d3085123a210448e74fc6393'
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
    )
    SELECT 
        ac."date", 
        ac.token, 
        COALESCE(tw.total_amount, 0) AS total_amount,
        COALESCE(tw.total_shares, 0) AS total_shares
    FROM 
        AllCombinations ac
    LEFT JOIN 
        DailyWithdrawals tw
    ON 
        ac."date" = tw."date" 
    AND 
        (ac.token = tw.token OR (ac.token IS NULL and tw.token IS NULL))
    ORDER BY 
    ac."date", 
    ac.token;
      `);

  const rEthWithdrawls: DailyTokenData[] = [];
  const cbEthWithdrawls: DailyTokenData[] = [];
  const stEthWithdrawls: DailyTokenData[] = [];

  const array = response.toArray();

  // @ts-ignore
  array.forEach((ele) => {
    if (ele.token === RETH_ADDRESS.toLowerCase()) {
      rEthWithdrawls.push(ele);
    } else if (ele.token === CBETH_ADDRESS.toLowerCase()) {
      cbEthWithdrawls.push(ele);
    } else if (ele.token === STETH_ADDRESS.toLowerCase()) {
      stEthWithdrawls.push(ele);
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify([stEthWithdrawls, cbEthWithdrawls, rEthWithdrawls]),
  };
};
