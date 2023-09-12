require("dotenv").config()
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const { KeyValueStoreClient } = require("defender-kvstore-client")
const vaultCollateralManagerLogic = require("../../core-logic/vault-collateral-manager")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function () {
	const store = new KeyValueStoreClient({ path: "./store.json" })
	// config
	const optionRegistryAddress = "0x8Bc23878981a207860bA4B185fD065f4fd3c7725"
	const controllerAddress = "0x594bD4eC29F7900AE29549c140Ac53b5240d4019"
	const multicallAddress = "0x7e9Ee45c683F6160eFfB56Ec1253FaF3f43c80A5"
	// block that the option regsitry was deployed on
	const optionRegistryDeployBlock = 105497603

	// Initialize default provider and defender relayer signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_VAULT_COLLAT_BOT_PK, provider)

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
	exports
		.handler()
		.then(() => process.exit(0))
		.catch(error => {
			console.error(error)
			console.log("error hit")
			process.exit(1)
		})
}
