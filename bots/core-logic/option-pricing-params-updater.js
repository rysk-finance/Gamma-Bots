require("dotenv").config()
const { ethers } = require("ethers")

const managerAbi = require("../abi/Manager.json")
const optionExchangeAbi = require("../abi/OptionExchange.json")

const optionPricingParamsUpdaterLogic = async (signer, managerAddress, exchangeAddress, body) => {
	const manager = new ethers.Contract(managerAddress, managerAbi, signer)
	const exchange = new ethers.Contract(exchangeAddress, optionExchangeAbi, signer)

	// console.log(sabr)

	// check if system is paused first anc pause if not
	const isPausedBefore = await exchange.paused()
	if (!isPausedBefore) {
		let tx = await exchange.pause({ gasLimit: "10000000" })
		tx.wait()
		console.log("exchange paused")
	}

	// ************ set params ************

	if ("set_low_delta_sell_option_flat_iv" in body) {
		console.log("setting low delta sell option flat IV")
		await manager.setLowDeltaSellOptionFlatIV(
			ethers.utils.parseEther(body.set_low_delta_sell_option_flat_iv)
		)
	}
	console.log("boop", "set_low_delta_threshold" in body)

	// input is given as delta value between 0 and 1. no deciaml formatting.
	if ("set_low_delta_threshold" in body) {
		console.log("setting low delta Threshold")
		await manager.setLowDeltaThreshold(ethers.utils.parseEther(body.set_low_delta_threshold))
	}

	// input is given as percentage with no decimal formatting. 3% --> 0.03
	if ("set_bid_ask_IV_spread" in body) {
		console.log("setting bid/ask IV Spread")
		await manager.setBidAskIVSpread(ethers.utils.parseEther(body.set_bid_ask_IV_spread))
	}

	// input is given with no decimal formatting. eg 0.0001
	if ("set_slippage_gradient" in body) {
		console.log("setting slippage gradient")
		await manager.setSlippageGradient(ethers.utils.parseEther(body.set_slippage_gradient))
	}

	// input is given as percentage with no decimal formatting. 4% --> 0.04
	if ("set_collateral_lending_rate" in body) {
		console.log("setting collateral lending rate")
		await manager.setCollateralLendingRate(
			ethers.utils.parseUnits(body.set_collateral_lending_rate, 6)
		)
	}
	console.log("boop", "set_delta_borrow_rates" in body)

	/*	input given as a JSON object in the following format
			{
				"sellLong": 0.2,
				"sellShort": 0.1,
				"buyLong": -0.1,
				"buyShort": -0.05
			}
	*/
	if ("set_delta_borrow_rates" in body) {
		console.log("setting delta borrow rates")
		let params = {}
		Object.keys(body.set_delta_borrow_rates).forEach(rate => {
			params[rate] = body.set_delta_borrow_rates[rate] * 1000000
		})
		console.log("params", params)
		await manager.setDeltaBorrowRates(params)
	}

	if ("set_slippage_gradient_multipliers" in body) {
		console.log(
			"setting slippage gradient multipliers for tenor ",
			body.set_slippage_gradient_multipliers.tenorIndex,
			body.set_slippage_gradient_multipliers.callSlippageGradientMultipliers,
			body.set_slippage_gradient_multipliers.putSlippageGradientMultipliers
		)
		await manager.setSlippageGradientMultipliers(
			body.set_slippage_gradient_multipliers.tenorIndex,
			body.set_slippage_gradient_multipliers.callSlippageGradientMultipliers,
			body.set_slippage_gradient_multipliers.putSlippageGradientMultipliers
		)
	}

	if ("set_spread_collateral_multipliers" in body) {
		console.log(
			"setting spread collateral multipliers for tenor ",
			body.set_spread_collateral_multipliers.tenorIndex,
			body.set_spread_collateral_multipliers.callSpreadCollateralMultipliers,
			body.set_spread_collateral_multipliers.putSpreadCollateralMultipliers
		)
		await manager.setSpreadCollateralMultipliers(
			body.set_spread_collateral_multipliers.tenorIndex,
			body.set_spread_collateral_multipliers.callSpreadCollateralMultipliers,
			body.set_spread_collateral_multipliers.putSpreadCollateralMultipliers
		)
	}

	if ("set_spread_delta_multipliers" in body) {
		console.log(
			"setting spread delta multipliers for tenor ",
			body.set_spread_delta_multipliers.tenorIndex,
			body.set_spread_delta_multipliers.callSpreadDeltaMultipliers,
			body.set_spread_delta_multipliers.putSpreadDeltaMultipliers
		)
		await manager.setSpreadDeltaMultipliers(
			body.set_spread_delta_multipliers.tenorIndex,
			body.set_spread_delta_multipliers.callSpreadDeltaMultipliers,
			body.set_spread_delta_multipliers.putSpreadDeltaMultipliers
		)
	}
	// ********** end set params **********

	// if the system was not paused prior, then unpause
	// otherwise leave paused
	if (!isPausedBefore) {
		let tx = await exchange.unpause({ gasLimit: "10000000" })
		tx.wait()
		console.log("exchange unpaused")
	}
}

module.exports = optionPricingParamsUpdaterLogic
