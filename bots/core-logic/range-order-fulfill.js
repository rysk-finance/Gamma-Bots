require("dotenv").config()
const { ethers } = require("ethers")

const reactorAbi = require("../abi/UniswapV3RangeOrderReactor.json")

const rangeOrderFulfillLogic = async (signer, reactorAddress) => {
	const reactor = new ethers.Contract(reactorAddress, reactorAbi, signer)

	const currentPosition = await reactor.currentPosition()

	console.log(currentPosition)
	// if (
	// 	currentPosition.activeLowerTick == 0 ||
	// 	currentPosition.activeUppertick == 0 ||
	// 	currentPosition.activeLowerTick == currentPosition.activeUppertick
	// ) {
	// 	console.log("nothing to do")
	// 	return
	// }

	const poolPrice = (await reactor.getPoolPrice()).price

	if (
		(currentPosition.activeRangeAboveTick && poolPrice > currentPosition.activeUpperTick) ||
		(!currentPosition.activeRangeAboveTick && poolPrice < currentPosition.activeLowerTick)
	) {
		console.log("fulfilling range order")
		await reactor.fulfillActiveRangeOrder()
	}

	console.log({ poolPrice })
}

module.exports = rangeOrderFulfillLogic
