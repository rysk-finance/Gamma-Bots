require("dotenv").config()

const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const settlerLogic = require("../../core-logic/settler")
// Entrypoint for the Autotask
exports.handler = async function () {
	// config

	const pvfeedAddress = "0xc7abaec336098cd0dcd98b67cb14d3b18e1c68a8"
	const multicallAddress = "0xac344596a241A3D801db62C98f3B93b768eE7dB5"

	// Initialize default provider signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_SETTLER_BOT_PK, provider)

	return settlerLogic(signer, pvfeedAddress, multicallAddress)
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
