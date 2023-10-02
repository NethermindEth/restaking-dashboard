"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyBeaconChainETHDeposit = exports.stakersBeaconChainEth = exports.totalStakedBeaconChainEth = exports.getWithdrawals = exports.getStrategyDepositLeaderBoard = exports.getDeposits = void 0;
var spice_1 = require("./spice");
var STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
var CBETH_ADDRESS = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
var RETH_ADDRESS = "0xae78736Cd615f374D3085123A210448E74Fc6393";
var getDeposits = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var response, rEthDeposits, cbEthDeposits, stEthDeposits, array;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, spice_1.default.query("\n  WITH DailyTokenDeposits AS (\n    SELECT\n        TO_DATE(block_timestamp) AS \"date\",\n        token,\n        SUM(token_amount) / POWER(10, 18) AS total_amount,\n        SUM(shares) / POWER(10, 18) AS total_shares\n    FROM eth.eigenlayer.strategy_manager_deposits\n    WHERE token IN (\n        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',\n        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',\n        '0xae78736cd615f374d3085123a210448e74fc6393'\n    )\n    GROUP BY \"date\", token\n),\nDailyValidatorDeposits AS (\n    SELECT\n        GREATEST(\n            TO_DATE(ep.block_timestamp),\n            TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),\n            TO_DATE(COALESCE(bte.block_timestamp, 0))\n        ) as \"date\",\n        NULL as token,\n        count(*) * 32 AS total_amount,\n        count(*) * 32 AS total_shares\n    FROM\n        eth.beacon.validators vl\n    INNER JOIN\n        eth.eigenlayer.eigenpods ep\n    ON\n        LEFT(vl.withdrawal_credentials, 4) = '0x01' AND vl.withdrawal_credentials = ep.withdrawal_credential\n    LEFT JOIN\n        eth.beacon.bls_to_execution_changes bte\n    ON\n        bte.validator_index = vl.validator_index\n    GROUP BY \"date\"\n),\nDailyDeposits AS (\n    SELECT * FROM DailyTokenDeposits UNION ALL SELECT * FROM DailyValidatorDeposits\n),\nMinDate AS (\n    SELECT MIN(\"date\") AS min_date FROM DailyDeposits\n),\nDateSeries AS (\n    SELECT DISTINCT DATE_ADD((SELECT min_date FROM MinDate), number) AS \"date\"\n    FROM eth.blocks\n    WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))\n),\nTokenSeries AS (\n    SELECT '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' AS token\n    UNION ALL\n        SELECT '0xbe9895146f7af43049ca1c1ae358b0541ea49704'\n    UNION ALL\n        SELECT '0xae78736cd615f374d3085123a210448e74fc6393'\n    UNION ALL\n        SELECT NULL\n),\nAllCombinations AS (\n    SELECT\n        ds.\"date\",\n        ts.token\n    FROM\n        DateSeries ds\n    CROSS JOIN\n        TokenSeries ts\n)\nSELECT\n    ac.\"date\",\n    ac.token,\n    COALESCE(td.total_amount, 0) AS total_amount,\n    COALESCE(td.total_shares, 0) AS total_shares\nFROM\n    AllCombinations ac\nLEFT JOIN\n    DailyDeposits td\nON\n    ac.\"date\" = td.\"date\"\nAND\n    (ac.token = td.token OR (ac.token IS NULL AND td.token IS NULL))\nORDER BY\n    ac.\"date\",\n    ac.token;\n    ")];
            case 1:
                response = _a.sent();
                rEthDeposits = [];
                cbEthDeposits = [];
                stEthDeposits = [];
                array = response.toArray();
                // @ts-ignore
                array.forEach(function (ele) {
                    if (ele.token === RETH_ADDRESS.toLowerCase()) {
                        rEthDeposits.push(ele);
                    }
                    else if (ele.token === CBETH_ADDRESS.toLowerCase()) {
                        cbEthDeposits.push(ele);
                    }
                    else if (ele.token === STETH_ADDRESS.toLowerCase()) {
                        stEthDeposits.push(ele);
                    }
                });
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify([stEthDeposits, cbEthDeposits, rEthDeposits]),
                    }];
        }
    });
}); };
exports.getDeposits = getDeposits;
var getStrategyDepositLeaderBoard = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var response, rEth, cbEth, stEth, array;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("here");
                return [4 /*yield*/, spice_1.default.query("\n  WITH ranked_deposits AS (\n    SELECT\n        depositor,\n        token,\n        SUM(token_amount) / POWER(10, 18) AS total_amount,\n        SUM(shares) / POWER(10, 18) AS total_shares,\n        ROW_NUMBER() OVER (PARTITION BY token ORDER BY total_shares DESC) AS rn\n    FROM eth.eigenlayer.strategy_manager_deposits\n    WHERE token IN (\n        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',\n        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',\n        '0xae78736cd615f374d3085123a210448e74fc6393'\n    )\n    GROUP BY depositor, token\n)\n    SELECT *\n    FROM ranked_deposits\n    WHERE rn <= 50;\n")];
            case 1:
                response = _a.sent();
                rEth = [];
                cbEth = [];
                stEth = [];
                array = response.toArray();
                // @ts-ignore
                array.forEach(function (ele) {
                    ele = {
                        total_amount: ele.total_amount,
                        total_staked_shares: ele.total_shares,
                        depositor: ele.depositor,
                        token: ele.token,
                    };
                    if (ele.token === RETH_ADDRESS.toLowerCase()) {
                        rEth.push(ele);
                    }
                    else if (ele.token === CBETH_ADDRESS.toLowerCase()) {
                        cbEth.push(ele);
                    }
                    else if (ele.token === STETH_ADDRESS.toLowerCase()) {
                        stEth.push(ele);
                    }
                });
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify([stEth, cbEth, rEth]),
                    }];
        }
    });
}); };
exports.getStrategyDepositLeaderBoard = getStrategyDepositLeaderBoard;
var getWithdrawals = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var response, rEthWithdrawls, cbEthWithdrawls, stEthWithdrawls, array;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, spice_1.default.query("\n  WITH DailyTokenWithdrawals AS (\n    SELECT\n        TO_DATE(block_timestamp) AS \"date\",\n        token,\n        SUM(token_amount) / POWER(10, 18) AS total_amount,\n        SUM(shares) / POWER(10, 18) AS total_shares\n    FROM eth.eigenlayer.strategy_manager_withdrawal_completed\n    WHERE token IN (\n        '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',\n        '0xbe9895146f7af43049ca1c1ae358b0541ea49704',\n        '0xae78736cd615f374d3085123a210448e74fc6393'\n    )\n    AND receive_as_tokens\n    GROUP BY \"date\", token\n),\nDailyValidatorWithdrawals AS (\n    SELECT\n        TO_DATE(1606845623 + 32 * 12 * exit_epoch) as \"date\",\n        NULL as token,\n        count(*) * 32 AS total_amount,\n        count(*) * 32 AS total_shares\n        FROM\n            eth.beacon.validators vl\n        INNER JOIN\n            eth.eigenlayer.eigenpods ep\n        ON\n            LEFT(vl.withdrawal_credentials, 4) = '0x01' AND vl.withdrawal_credentials = ep.withdrawal_credential\n        GROUP BY \"date\"\n    ),\n    DailyWithdrawals AS (\n        SELECT * FROM DailyTokenWithdrawals UNION ALL SELECT * FROM DailyValidatorWithdrawals\n    ),\n    MinDate AS (\n        SELECT MIN(\"date\") AS min_date FROM DailyTokenWithdrawals\n    ),\n    DateSeries AS (\n        SELECT DISTINCT DATE_ADD((SELECT min_date FROM MinDate), number) AS \"date\"\n        FROM eth.blocks\n        WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT min_date FROM MinDate))\n    ),\n    TokenSeries AS (\n        SELECT '0xae7ab96520de3a18e5e111b5eaab095312d7fe84' AS token\n        UNION ALL\n            SELECT '0xbe9895146f7af43049ca1c1ae358b0541ea49704'\n        UNION ALL\n            SELECT '0xae78736cd615f374d3085123a210448e74fc6393'\n        UNION ALL\n            SELECT NULL\n    ),\n    AllCombinations AS (\n        SELECT \n            ds.\"date\", \n            ts.token\n        FROM \n            DateSeries ds\n        CROSS JOIN \n            TokenSeries ts\n    )\n    SELECT \n        ac.\"date\", \n        ac.token, \n        COALESCE(tw.total_amount, 0) AS total_amount,\n        COALESCE(tw.total_shares, 0) AS total_shares\n    FROM \n        AllCombinations ac\n    LEFT JOIN \n        DailyWithdrawals tw\n    ON \n        ac.\"date\" = tw.\"date\" \n    AND \n        (ac.token = tw.token OR (ac.token IS NULL and tw.token IS NULL))\n    ORDER BY \n    ac.\"date\", \n    ac.token;\n      ")];
            case 1:
                response = _a.sent();
                rEthWithdrawls = [];
                cbEthWithdrawls = [];
                stEthWithdrawls = [];
                array = response.toArray();
                // @ts-ignore
                array.forEach(function (ele) {
                    if (ele.token === RETH_ADDRESS.toLowerCase()) {
                        rEthWithdrawls.push(ele);
                    }
                    else if (ele.token === CBETH_ADDRESS.toLowerCase()) {
                        cbEthWithdrawls.push(ele);
                    }
                    else if (ele.token === STETH_ADDRESS.toLowerCase()) {
                        stEthWithdrawls.push(ele);
                    }
                });
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify([stEthWithdrawls, cbEthWithdrawls, rEthWithdrawls]),
                    }];
        }
    });
}); };
exports.getWithdrawals = getWithdrawals;
function totalStakedBeaconChainEth() {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, spice_1.default.query("SELECT SUM(effective_balance)/POW(10,9) as final_balance\n                FROM eth.beacon.validators\n                JOIN eth.eigenlayer.eigenpods\n                ON eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential AND effective_balance!='0'\n            ")];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, { statusCode: 200, body: JSON.stringify(result.toString()) }];
                case 2:
                    err_1 = _a.sent();
                    console.log(err_1);
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.totalStakedBeaconChainEth = totalStakedBeaconChainEth;
function stakersBeaconChainEth() {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, spice_1.default.query("\n    SELECT \n    eth.eigenlayer.eigenpods.pod_owner,\n    SUM(eth.beacon.validators.effective_balance) / POWER(10,9) AS total_effective_balance\nFROM \n    eth.beacon.validators\nJOIN \n    eth.eigenlayer.eigenpods\nON \n    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential \n    AND eth.beacon.validators.effective_balance != '0'\nGROUP BY \n    eth.eigenlayer.eigenpods.pod_owner\nORDER BY total_effective_balance DESC;")];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify(result.toArray()),
                        }];
                case 2:
                    err_2 = _a.sent();
                    console.log(err_2);
                    throw err_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.stakersBeaconChainEth = stakersBeaconChainEth;
function dailyBeaconChainETHDeposit() {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, spice_1.default.query("\n    WITH Daily_Deposits AS (\n        SELECT \n            GREATEST(\n                TO_DATE(ep.block_timestamp),\n                TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),\n                TO_DATE(COALESCE(bte.block_timestamp, 0))\n            ) as \"date\",\n            CAST(count(*) * 32 AS FLOAT) AS daily_added_effective_balance\n        FROM \n            eth.beacon.validators vl\n        JOIN \n            eth.eigenlayer.eigenpods ep\n        ON \n            vl.withdrawal_credentials = ep.withdrawal_credential\n        LEFT JOIN\n            eth.beacon.bls_to_execution_changes bte\n        ON\n            bte.validator_index = vl.validator_index\n        GROUP BY \n            \"date\"\n    ),\n    Date_Series AS (\n        SELECT DISTINCT DATE_ADD((SELECT MIN(\"date\") FROM Daily_Deposits), number) AS \"date\"\n        FROM eth.blocks\n        WHERE number <= DATEDIFF(CURRENT_DATE, (SELECT MIN(\"date\") FROM Daily_Deposits))\n    )\n    SELECT \n        Date_Series.\"date\",\n        COALESCE(Daily_Deposits.daily_added_effective_balance, 0) AS daily_added_effective_balance,\n        SUM(COALESCE(Daily_Deposits.daily_added_effective_balance, 0)) OVER (ORDER BY Date_Series.\"date\" ASC) AS cumulative_daily_effective_balance\n    FROM \n        Date_Series\n    LEFT JOIN\n        Daily_Deposits\n    ON \n        Date_Series.\"date\" = Daily_Deposits.\"date\"\n    ORDER BY \n        Date_Series.\"date\";\n    ")];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, {
                            statusCode: 200,
                            body: JSON.stringify(result.toArray()),
                        }];
                case 2:
                    err_3 = _a.sent();
                    console.log(err_3);
                    throw err_3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.dailyBeaconChainETHDeposit = dailyBeaconChainETHDeposit;
//# sourceMappingURL=handler.js.map