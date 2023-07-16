require("dotenv").config()
const { ethers } = require("ethers")
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const seriesDeactivatorLogic = require("../../core-logic/series-deactivator-copy")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	// config
	const relayerAddress = "0x776eDE9E537c1580A67FE28033C527b2776B6851"
	const optionCatalogueAddress = "0x44227Dc2a1d71FC07DC254Dfd42B1C44aFF12168"
	const beyondPricerAddress = "0xeA5Fb118862876f249Ff0b3e7fb25fEb38158def"
	const managerAddress = "0xD404D0eD7fe1EB1Cd6388610F9e5B5E6b6E41E72"
	const collateralAssetAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" // usdc
	const strikeAssetAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" // usdc
	const underlyingAssetAddress = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" // weth

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})

	return seriesDeactivatorLogic(
		signer,
		optionCatalogueAddress,
		beyondPricerAddress,
		managerAddress,
		collateralAssetAddress,
		strikeAssetAddress,
		underlyingAssetAddress
	)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const {
		SERIES_DEACTIVATOR_MAINNET_API_KEY: apiKey,
		SERIES_DEACTIVATOR_MAINNET_SECRET: apiSecret
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
