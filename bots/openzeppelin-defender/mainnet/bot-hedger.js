const { Relayer } = require("defender-relay-client")
const { DefenderRelaySigner, DefenderRelayProvider } = require("defender-relay-client/lib/ethers")
const { ethers } = require("ethers")

exports.handler = async function (credentials) {
	const relayerAddress = "0xada6667926b8a600576637f7ec7957ab05b99be7" // Relayer address
	const managerAddress = "0xD404D0eD7fe1EB1Cd6388610F9e5B5E6b6E41E72"
	const relayer = new Relayer(credentials)
	const {
		queryParameters // Object with key-values from query parameters
	} = credentials.request
	delta = queryParameters.delta
	reactor_index = queryParameters.reactor_index

	// Initialize default provider and defender relayer signer
	const provider = new DefenderRelayProvider(credentials)
	const signer = new DefenderRelaySigner(credentials, provider, {
		speed: "fast",
		from: relayerAddress
	})
	// manager instance
	const manager = new ethers.Contract(managerAddress, managerAbi, signer)
	const deltaLim = await manager.deltaLimit(relayerAddress)
	if (deltaLim < delta) {
		throw "error: delta limit exceeded"
	}
	let tx = await manager.rebalancePortfolioDelta(delta, reactor_index, { gasLimit: "10000000" })
	console.log("Tx hash: ", tx.hash)
	return tx.hash
}
