require("dotenv").config()
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const gmxCollateralManagerLogic = require("../../core-logic/gmx-collateral-manager")

// Entrypoint for the Autotask
// Function to keep track of all active Vault IDs and periodically check their collateral health factors and add/remove collateral as needed
exports.handler = async function (credentials) {
	// config
	const relayerAddress = "0x88a8974d582df40f6315642f21420b9dbcccbc20"
	const gmxHedgingReactorAddress = "0xbCd871faAf2c36D57B0F4C006c6B0Cc2E1929736"

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})

	return gmxCollateralManagerLogic(signer, gmxHedgingReactorAddress)
}

// To run locally (this code will not be executed in Autotasks)
if (require.main === module) {
	const {
		GMX_COLLAT_MANAGER_BOT_MAINNET_API_KEY: apiKey,
		GMX_COLLAT_MANAGER_BOT_MAINNET_SECRET: apiSecret
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
