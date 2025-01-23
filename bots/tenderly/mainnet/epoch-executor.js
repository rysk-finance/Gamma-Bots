require("dotenv").config()
const { ethers } = require("ethers")
const liquidityPoolAbi = require("../abi/LiquidityPool.json")

// Entrypoint for the Autotask
// Function to execute an epoch on a daily basis.
exports.handler = async function () {
	// config
	const liquidityPoolAddress = "0x217749d9017cB87712654422a1F5856AAA147b80"

	// Initialize default provider and defender relayer signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_GMX_COLLAT_BOT_PK, provider)

	const liquidityPool = new ethers.Contract(
		liquidityPoolAddress,
		liquidityPoolAbi,
		signer
	)}

	await liquidityPool.pauseUnpauseTrading(true);
	await liquidityPool.executeEpochCalculation();

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	exports
		.handler()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			console.log("error hit")
			process.exit(1)
		})
}
