require("dotenv").config()
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const { ethers } = require("ethers")
const rangeOrderFulfillLogic = require("../../core-logic/range-order-fulfill")

exports.handler = async function (credentials) {
	const relayerAddress = "0xdAE7F1E8F9Ad2faBF321326Abd581D1E751c233D" // Relayer address
	const reactorAddress = "0x5250F9ab6a6a7CB447dc96cb218cE9E796905852"

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})

	return rangeOrderFulfillLogic(signer, reactorAddress)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const {
		RANGE_ORDER_FULFILL_MAINNET_API_KEY: apiKey,
		RANGE_ORDER_FULFILL_MAINNET_SECRET: apiSecret
	} = process.env
	exports
		.handler({ apiKey, apiSecret })
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			process.exit(1)
		})
}
