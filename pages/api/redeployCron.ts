export default async function handler(req: any, res: any) {
  const redeployResult = await fetch(process.env.REDEPLOY_URL || "");
  const redeployResultJson = await redeployResult.json();
  console.log(redeployResultJson);
}
