require('dotenv').config()
const { DefenderRelaySigner, DefenderRelayProvider } = require('defender-relay-client/lib/ethers')
const { KeyValueStoreClient } = require('defender-kvstore-client')
const vaultCollateralManagerLogic = require('../../core-logic/vault-collateral-manager')

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	const store = new KeyValueStoreClient({ path: './store.json' })
	// config
	const relayerAddress = '0x0b95d8e9ca7ff55be19f9f69d789b4ba5131dd3b'
	const optionRegistryAddress = '0x4E89cc3215AF050Ceb63Ca62470eeC7C1A66F737'
	const controllerAddress = '0x11a602a5F5D823c103bb8b7184e22391Aae5F4C2'
	// block that the option regsitry was deployed on
	const optionRegistryDeployBlock = 18196415

	let provider
	let signer
	// Initialize default provider and defender relayer signer

	provider = new DefenderRelayProvider(credentials)
	signer = new DefenderRelaySigner(credentials, provider, {
		speed: 'fast',
		from: relayerAddress
	})

	return vaultCollateralManagerLogic(
		true,
		provider,
		signer,
		store,
		optionRegistryAddress,
		controllerAddress,
		optionRegistryDeployBlock
	)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const {
		VAULT_COLLAT_MANAGER_BOT_TESTNET_API_KEY: apiKey,
		VAULT_COLLAT_MANAGER_BOT_TESTNET_API_SECRET: apiSecret
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
