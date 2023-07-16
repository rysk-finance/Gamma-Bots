require("dotenv").config()

const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const settlerLogic = require("../../core-logic/settler")
// Entrypoint for the Autotask
exports.handler = async function () {
	// config
	const optionRegistryAddress = "0x8Bc23878981a207860bA4B185fD065f4fd3c7725"
	const controllerAddress = "0x594bD4eC29F7900AE29549c140Ac53b5240d4019"
	const liquidityPoolAddress = "0x217749d9017cB87712654422a1F5856AAA147b80"
	const pvfeedAddress = "0x7f9d820CFc109686F2ca096fFA93dd497b91C073"

	// Initialize default provider signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_SETTLER_BOT_PK, provider)

	return settlerLogic(
		signer,
		optionRegistryAddress,
		controllerAddress,
		liquidityPoolAddress,
		pvfeedAddress
	)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	exports
		.handler()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			process.exit(1)
		})
}
