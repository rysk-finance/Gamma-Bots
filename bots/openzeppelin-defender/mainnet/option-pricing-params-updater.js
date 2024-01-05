require("dotenv").config()
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const optionPricingParamsUpdaterLogic = require("../../core-logic/option-pricing-params-updater")

exports.handler = async function (credentials) {
	const managerAddress = "0xa7AD85AC7Eda2807fA2d596B3ff1F9b63D4d3682"
	// const relayerAddress = "0x2C728c972ee6fC4815318232a06740cFcE914BC2" // Relayer address
	const relayerAddress = "0x7025E843f08fC28c8255109F4daC716f8277C5a2" // TESTNET Relayer address
	const exchangeAddress = "0xC117bf3103bd09552F9a721F0B8Bce9843aaE1fa"

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})

	const {
		queryParameters // Object with key-values from query parameters
	} = credentials.request
	return optionPricingParamsUpdaterLogic(signer, managerAddress, exchangeAddress, queryParameters)
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
