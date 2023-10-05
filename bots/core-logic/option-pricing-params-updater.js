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

	// input is given as percentage with e18 decimal formatting. 100% --> "1 000 000 000 000 000 000"
	if ("set_low_delta_sell_option_flat_iv" in body) {
		console.log("setting low delta sell option flat IV")
		await manager.setLowDeltaSellOptionFlatIV(body.set_low_delta_sell_option_flat_iv)
	}

	// input is given as delta value between 0 and 1. e18 deciaml formatting.
	if ("set_low_delta_threshold" in body) {
		console.log("setting low delta Threshold")
		await manager.setLowDeltaThreshold(body.set_low_delta_threshold)
	}

	// input is given as percentage with e18 decimal formatting. 100% --> "1 000 000 000 000 000 000"
	if ("set_bid_ask_iv_spread" in body) {
		console.log("setting bid/ask IV Spread")
		await manager.setBidAskIVSpread(body.set_bid_ask_iv_spread)
	}

	// input is given with e18 decimal formatting. eg 0.0001 -> "100 000 000 000 000"
	if ("set_slippage_gradient" in body) {
		console.log("setting slippage gradient")
		await manager.setSlippageGradient(body.set_slippage_gradient)
	}

	// input is given as percentage with e6 decmial formatting. 100% --> "1 000 000"
	if ("set_collateral_lending_rate" in body) {
		console.log("setting collateral lending rate")
		await manager.setCollateralLendingRate(body.set_collateral_lending_rate)
	}

	/*	input given as a JSON object in the following format. 100% --> "1 000 000"
			{
				"sellLong": 200000, --> 20%
				"sellShort": 100000,  --> 10%
				"buyLong": -100000,  --> -10%
				"buyShort": -50000  --> -5%
			}
	*/
	if ("set_delta_borrow_rates" in body) {
		console.log("setting delta borrow rates")
		await manager.setDeltaBorrowRates(body.set_delta_borrow_rates)
	}

	// array multiplier values given as e18 notation. each must be > 1e18
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

	// array multiplier values given as e18 notation. each must be > 1e18
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

	// array multiplier values given as e18 notation. each must be > 1e18
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
