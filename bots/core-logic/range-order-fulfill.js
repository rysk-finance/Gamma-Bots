require("dotenv").config()
const { ethers } = require("ethers")

const reactorAbi = require("../abi/UniswapV3RangeOrderReactor.json")

const rangeOrderFulfillLogic = async (signer, reactorAddress) => {
	const reactor = new ethers.Contract(reactorAddress, reactorAbi, signer)

	const currentPosition = await reactor.currentPosition()

	console.log(currentPosition)
	if (
		currentPosition.activeLowerTick == 0 ||
		currentPosition.activeUppertick == 0 ||
		currentPosition.activeLowerTick == currentPosition.activeUppertick
	) {
		console.log("nothing to do")
		return
	}

	const poolPrice = (await reactor.getPoolPrice()).price
	console.log({ poolPrice })
	console.log(
		"lower tick to price:",
		normalized_tick_to_price(currentPosition.activeLowerTick),
		"upper tick to price:",
		normalized_tick_to_price(currentPosition.activeUpperTick)
	)
	if (
		(currentPosition.activeRangeAboveTick &&
			poolPrice > normalized_tick_to_price(currentPosition.activeUpperTick)) ||
		(!currentPosition.activeRangeAboveTick &&
			poolPrice < normalized_tick_to_price(currentPosition.activeLowerTick))
	) {
		console.log("fulfilling range order")

		await reactor.fulfillActiveRangeOrder()
	}
}

const tick_to_price = (tick, token0Decimals = 18, token1Decimals = 6) => {
	const price_raw = 1.0001 ** tick
	const price_adjusted = (price_raw * 10 ** token1Decimals) / 10 ** token0Decimals
	return price_adjusted
}

const normalized_tick_to_price = (tick, token0Decimals = 18, token1Decimals = 6) => {
	const raw_price = tick_to_price(tick, token0Decimals, token1Decimals)
	const normalization_factor = 10 ** (2 * (token0Decimals - token1Decimals))
	return raw_price * normalization_factor
}
module.exports = rangeOrderFulfillLogic
