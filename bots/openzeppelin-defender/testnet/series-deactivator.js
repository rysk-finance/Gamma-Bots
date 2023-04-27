require('dotenv').config()
const { ethers } = require('ethers')
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers')
const seriesDeactivatorLogic = require('../../core-logic/series-deactivator')

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	// config
	const relayerAddress = '0x51b15bdfc9a4cc990102ca4a7ee4fb42eb29a3d9' // no series deactivator relayer address created.
	const optionCatalogueAddress = '0x5F7350aEA196825C3AAc335D97535e9b4EfCDb45'
	const liquidityPoolAddress = '0x72038BC9f6279bd8F1d0f65535beA7f976e28fc5'
	const beyondPricerAddress = '0xF18C263aA3926f1AaBb879Cb9fF5905E40239fF4'
	const managerAddress = '0x45451c486e70c4d17609F441aE4ec1A577925E56'
	const collateralAssetAddress = '0x6775842ae82bf2f0f987b10526768ad89d79536e' // usdc
	const strikeAssetAddress = '0x6775842ae82bf2f0f987b10526768ad89d79536e' // usdc
	const underlyingAssetAddress = '0x53320bE2A35649E9B2a0f244f9E9474929d3B699' // weth

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: 'fast',
		from: relayerAddress
	})

	return seriesDeactivatorLogic(
		signer,
		optionCatalogueAddress,
		liquidityPoolAddress,
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
		BEYOND_TESTNET_SERIES_DEACTIVATOR_API_KEY: apiKey,
		BEYOND_TESTNET_SERIES_DEACTIVATOR_API_SECRET: apiSecret
	} = process.env
	exports
		.handler({ apiKey, apiSecret })
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			console.log('error hit')
			process.exit(1)
		})
}
