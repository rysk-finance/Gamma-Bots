require('dotenv').config()
const { ethers } = require('ethers')
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers')
const seriesDeactivatorLogic = require('../../core-logic/series-deactivator')

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	// config
	const relayerAddress = '0x51b15bdfc9a4cc990102ca4a7ee4fb42eb29a3d9' // no series deactivator relayer address created.
	const optionCatalogueAddress = '0xde458dD32651F27A8895D4a92B7798Cdc4EbF2f0'
	const liquidityPoolAddress = '0x0B1Bf5fb77AA36cD48Baa1395Bc2B5fa0f135d8C'
	const beyondPricerAddress = '0xc939df369C0Fc240C975A6dEEEE77d87bCFaC259'
	const managerAddress = '0xB8Cb70cf67EF7d7dFb1C70bc7A169DFCcCF0753c'
	const collateralAssetAddress = '0x408c5755b5c7a0a28D851558eA3636CfC5b5b19d' // usdc
	const strikeAssetAddress = '0x408c5755b5c7a0a28D851558eA3636CfC5b5b19d' // usdc
	const underlyingAssetAddress = '0x3b3a1dE07439eeb04492Fa64A889eE25A130CDd3' // weth

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
