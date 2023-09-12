require("dotenv").config()
const { ethers } = require("ethers")

const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const { KeyValueStoreClient } = require("defender-kvstore-client")
const vaultCollateralManagerLogic = require("../../core-logic/vault-collateral-manager")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	const store = new KeyValueStoreClient({ path: "./store.json" })
	// config
	const relayerAddress = "0xF308f68A42eB577133dF915D995dD8C0AeE97B42"
	const optionRegistryAddress = "0x8Bc23878981a207860bA4B185fD065f4fd3c7725"
	const controllerAddress = "0x594bD4eC29F7900AE29549c140Ac53b5240d4019"
	const multicallAddress = "0x7e9Ee45c683F6160eFfB56Ec1253FaF3f43c80A5"

	// block that the option regsitry was deployed on
	const optionRegistryDeployBlock = 105497603

	// Initialize default provider and defender relayer signer

	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})

	return vaultCollateralManagerLogic(
		provider,
		signer,
		store,
		optionRegistryAddress,
		controllerAddress,
		multicallAddress,
		optionRegistryDeployBlock
	)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const { VAULT_THRESHOLD_BOT_API_KEY: apiKey, VAULT_THRESHOLD_BOT_API_SECRET: apiSecret } =
		process.env
	exports
		.handler({ apiKey, apiSecret })
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			console.log("error hit")
			process.exit(1)
		})
}
