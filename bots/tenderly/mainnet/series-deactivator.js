require("dotenv").config()
const { ethers } = require("ethers")
const seriesDeactivatorLogic = require("../../core-logic/series-deactivator-lens")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function () {
	// config
	const optionCatalogueAddress = "0x44227Dc2a1d71FC07DC254Dfd42B1C44aFF12168"
	const managerAddress = "0xD404D0eD7fe1EB1Cd6388610F9e5B5E6b6E41E72"
	const lensAddress = "0xa306C00e08ebC84a5F4F67b561B8F6EDeb77600D"

	// Initialize default provider and defender relayer signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_SERIES_DEACTIVATOR_BOT_PK, provider)

	return seriesDeactivatorLogic(signer, optionCatalogueAddress, managerAddress, lensAddress)
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
