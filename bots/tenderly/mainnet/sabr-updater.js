require("dotenv").config()

const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const sabrUpdaterLogic = require("../../core-logic/sabr-updater")
// Entrypoint for the Autotask
exports.handler = async function () {
	// config
	const volFeedAddress = "0xF204B60A98B3be05914AeC46bcEd2476D13a0225"
	const exchangeAddress = "0xC117bf3103bd09552F9a721F0B8Bce9843aaE1fa"
	const relayerAddress = "0xd5730eDE6Ed7f9051E9E55eB4B507b4F48C46111" // Relayer address

	// Initialize default provider signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_SABR_UPDATER_BOT_PK, provider)

	const {
		queryParameters // Object with key-values from query parameters
	} = credentials.request
	return sabrUpdaterlogic(signer, volFeedAddress, exchangeAddress, queryParameters)
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
