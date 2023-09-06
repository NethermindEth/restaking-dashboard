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
                    TO_DATE(block_timestamp) as created_at,
                    SUM(SUM(effective_balance)/POW(10,9)) OVER (ORDER BY TO_DATE(block_timestamp) ASC) as Cumulative_Daily_Added_Effective_Balance
                FROM 
                    eth.beacon.validators
                JOIN 
                    eth.eigenlayer.eigenpods
                ON 
                    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential
                GROUP BY 
                    created_at
                ORDER BY 
                    created_at ASC;`
            )
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
                    TO_DATE(block_timestamp) as created_at,
                    SUM(effective_balance)/POW(10,9) as Daily_Added_Effective_Balance,
                    SUM(SUM(effective_balance)/POW(10,9)) OVER (ORDER BY TO_DATE(block_timestamp) ASC) as Cumulative_Daily_Added_Effective_Balance
                FROM 
                    eth.beacon.validators
                JOIN 
                    eth.eigenlayer.eigenpods
                ON 
                    eth.beacon.validators.withdrawal_credentials = eth.eigenlayer.eigenpods.withdrawal_credential
                GROUP BY 
                    created_at
                ORDER BY 
                    created_at ASC;`
            )
            return result
        } catch(err: any) {
            console.log(err)
            throw err
        }
    }
}