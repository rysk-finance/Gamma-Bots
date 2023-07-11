require("dotenv").config()
const { ethers } = require("ethers")
const gmxCollateralManagerLogic = require("../../core-logic/gmx-collateral-manager")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function () {
	// config
	const gmxHedgingReactorAddress = "0xbCd871faAf2c36D57B0F4C006c6B0Cc2E1929736"

	// Initialize default provider and defender relayer signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.REDUNDANT_GMX_COLLAT_BOT_PK, provider)

	return gmxCollateralManagerLogic(signer, perpHedgingReactorAddress)
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
