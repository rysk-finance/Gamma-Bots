require("dotenv").config()
const { ethers } = require("ethers")

const exchangeAbi = require("../abi/OptionExchange.json")
const volFeedAbi = require("../abi/VolatilityFeed.json")

const sabrUpdaterLogic = async (signer, volFeedAddress, exchangeAddress, queryParameters) => {
	const volFeed = new ethers.Contract(volFeedAddress, volFeedAbi, signer)
	const exchange = new ethers.Contract(exchangeAddress, exchangeAbi, signer)

	sabr_params = queryParameters.sabr_params
	sabr = JSON.parse(sabr_params)
	console.log(sabr)

	const isPausedBefore = await exchange.paused()
	if (!isPausedBefore) {
		let tx = await exchange.pause({ gasLimit: "10000000" })
		tx.wait()
		console.log("exchange paused")
	}
	for (let i = 0; i < sabr.length; i++) {
		const ts = sabr[i].shift()
		tx = await volFeed.setSabrParameters(sabr[i], ts, { gasLimit: "10000000" })
		console.log("Tx hash: ", tx.hash)
	}
	// if the system was not paused prior, then unpause
	// otherwise leave paused
	if (!isPausedBefore) {
		let tx = await exchange.unpause({ gasLimit: "10000000" })
		tx.wait()
		console.log("exchange unpaused")
	}
}

module.exports = sabrUpdaterLogic
