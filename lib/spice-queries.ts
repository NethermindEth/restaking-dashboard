export class SpiceEigenlayerQueries {
    constructor(protected readonly spiceClient: any) {}
    
    public async totalStakedBeaconChainEth() {
        try {
            const result = this.spiceClient.query(`
                SELECT 
                    SUM(effective_balance)/POW(10,9)
                FROM 
                    eth.beacon.validators
                JOIN 
                    eth.eigenlayer.eigenpods
                ON 
                    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential AND effective_balance!='0'`
            )
            return result
        } catch(err: any) {
            throw err
        }
    }

    public async stakersBeaconChainEth() {
        try {
            const result = this.spiceClient.query(`
                SELECT 
                    eth.eigenlayer.eigenpods.pod_owner,
                    SUM(eth.beacon.validators.effective_balance) AS total_effective_balance
                FROM 
                    eth.beacon.validators
                JOIN 
                    eth.eigenlayer.eigenpods
                ON 
                    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential 
                    AND eth.beacon.validators.effective_balance != '0'
                GROUP BY 
                    eth.eigenlayer.eigenpods.pod_owner;`
            )
        
            return result
        } catch(err: any) {
            console.log(err)
            throw err
        }
    }

    public async dailyBeaconChainETHDeposit() {
        try{
            const result = this.spiceClient.query(`
            SELECT 
                GREATEST(
                    TO_DATE(ep.block_timestamp),
                    TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),
                    TO_DATE(COALESCE(bte.block_timestamp, 0))
                ) as "date",
                SUM(effective_balance)/POW(10,9) as Daily_Added_Effective_Balance,
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
            ORDER BY 
                "date" ASC;
            `)
            return result
        } catch(err: any) {
            console.log(err)
            throw err
        }
    }

    public async dailyCumulativeBeaconChainETHDeposit() {
        try{
            const result = this.spiceClient.query(`
            SELECT 
                GREATEST(
                    TO_DATE(ep.block_timestamp),
                    TO_DATE(1606845623 + 32 * 12 * activation_eligibility_epoch),
                    TO_DATE(COALESCE(bte.block_timestamp, 0))
                ) as "date",
                SUM(effective_balance)/POW(10,9) as Daily_Added_Effective_Balance,
                SUM(SUM(effective_balance)/POW(10,9)) OVER (ORDER BY "date" ASC) as Cumulative_Daily_Added_Effective_Balance
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
            ORDER BY 
                "date" ASC;
            `        
            )
            return result
        } catch(err: any) {
            console.log(err)
            throw err
        }
    }
}