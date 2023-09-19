require("dotenv").config()

const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const settlerLogic = require("../../core-logic/settler")
// Entrypoint for the Autotask
exports.handler = async function (credentials) {
	// config
	const relayerAddress = "0x500eEeE19e4EaD80EbbE255600A59D4cc4C88494" // Relayer address
	const pvfeedAddress = "0xc7abaec336098cd0dcd98b67cb14d3b18e1c68a8"
	const multicallAddress = "0xac344596a241A3D801db62C98f3B93b768eE7dB5"

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})
	return settlerLogic(signer, pvfeedAddress, multicallAddress)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const { SETTLER_BOT_MAINNET_API_KEY: apiKey, SETTLER_BOT_MAINNET_API_SECRET: apiSecret } =
		process.env
	exports
		.handler({ apiKey, apiSecret })
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			process.exit(1)
		})
}
