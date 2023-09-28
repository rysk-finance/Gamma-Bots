require("dotenv").config()
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const optionPricingParamsUpdaterLogic = require("../../core-logic/option-pricing-params-updater")

exports.handler = async function (credentials) {
	const managerAddress = "0xede48885cae8c41ff0761b51c33b4a0a1becbc79"
	// const relayerAddress = "0x2C728c972ee6fC4815318232a06740cFcE914BC2" // Relayer address
	const relayerAddress = "0x7025E843f08fC28c8255109F4daC716f8277C5a2" // TESTNET Relayer address
	const exchangeAddress = "0x25d1b2B599061e0a5B553bE20474fF3b4139878D"

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})
	// const {
	// 	body // Object with key-values from HTTP request body
	// } = credentials.request

	return optionPricingParamsUpdaterLogic(signer, managerAddress, exchangeAddress, body)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const {
		OPTION_PRICING_PARAMS_UPDATER_TESTNET_API_KEY: apiKey,
		OPTION_PRICING_PARAMS_UPDATER_TESTNET_SECRET: apiSecret
	} = process.env
	exports
		.handler({ apiKey, apiSecret })
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			console.log("error hit")
			process.exit(1)
		})
}
