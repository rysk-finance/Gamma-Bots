require("dotenv").config()
const { ethers } = require("ethers")

const managerAbi = require("../abi/Manager.json")
const optionExchangeAbi = require("../abi/OptionExchange.json")

const optionPricingParamsUpdaterLogic = async (
	signer,
	managerAddress,
	exchangeAddress,
	queryParameters
) => {
	const manager = new ethers.Contract(managerAddress, managerAbi, signer)
	const exchange = new ethers.Contract(exchangeAddress, optionExchangeAbi, signer)

	console.log(queryParameters)

	// check if system is paused first anc pause if not
	const isPausedBefore = await exchange.paused()
	if (!isPausedBefore) {
		let tx = await exchange.pause({ gasLimit: "10000000" })
		tx.wait()
		console.log("exchange paused")
	}

	// ************ set params ************

	// input is given as percentage with e18 decimal formatting. 100% --> "1 000 000 000 000 000 000"
	if ("set_low_delta_sell_option_flat_iv" in queryParameters) {
		console.log("setting low delta sell option flat IV")
		await manager.setLowDeltaSellOptionFlatIV(queryParameters.set_low_delta_sell_option_flat_iv)
	}

	// input is given as delta value between 0 and 1. e18 deciaml formatting.
	if ("set_low_delta_threshold" in queryParameters) {
		console.log("setting low delta Threshold")
		await manager.setLowDeltaThreshold(queryParameters.set_low_delta_threshold)
	}

	// input is given as percentage with e18 decimal formatting. 100% --> "1 000 000 000 000 000 000"
	if ("set_bid_ask_iv_spread" in queryParameters) {
		console.log("setting bid/ask IV Spread")
		await manager.setBidAskIVSpread(queryParameters.set_bid_ask_iv_spread)
	}

	// input is given with e18 decimal formatting. eg 0.0001 -> "100 000 000 000 000"
	if ("set_slippage_gradient" in queryParameters) {
		console.log("setting slippage gradient")
		await manager.setSlippageGradient(queryParameters.set_slippage_gradient)
	}

	// input is given as percentage with e6 decmial formatting. 100% --> "1 000 000"
	if ("set_collateral_lending_rate" in queryParameters) {
		console.log("setting collateral lending rate")
		await manager.setCollateralLendingRate(queryParameters.set_collateral_lending_rate)
	}

	/*	input given as a JSON object in the following format. 100% --> "1 000 000"
			{
				"sellLong": 200000, --> 20%
				"sellShort": 100000,  --> 10%
				"buyLong": -100000,  --> -10%
				"buyShort": -50000  --> -5%
			}
	*/
	if ("set_delta_borrow_rates" in queryParameters) {
		console.log("setting delta borrow rates")
		await manager.setDeltaBorrowRates(queryParameters.set_delta_borrow_rates)
	}

	// array multiplier values given as e18 notation. each must be > 1e18
	if ("set_slippage_gradient_multipliers" in queryParameters) {
		console.log(
			"setting slippage gradient multipliers for tenor ",
			queryParameters.set_slippage_gradient_multipliers.tenorIndex,
			queryParameters.set_slippage_gradient_multipliers.callSlippageGradientMultipliers,
			queryParameters.set_slippage_gradient_multipliers.putSlippageGradientMultipliers
		)
		await manager.setSlippageGradientMultipliers(
			queryParameters.set_slippage_gradient_multipliers.tenorIndex,
			queryParameters.set_slippage_gradient_multipliers.callSlippageGradientMultipliers,
			queryParameters.set_slippage_gradient_multipliers.putSlippageGradientMultipliers
		)
	}

	// array multiplier values given as e18 notation. each must be > 1e18
	if ("set_spread_collateral_multipliers" in queryParameters) {
		console.log(
			"setting spread collateral multipliers for tenor ",
			queryParameters.set_spread_collateral_multipliers.tenorIndex,
			queryParameters.set_spread_collateral_multipliers.callSpreadCollateralMultipliers,
			queryParameters.set_spread_collateral_multipliers.putSpreadCollateralMultipliers
		)
		await manager.setSpreadCollateralMultipliers(
			queryParameters.set_spread_collateral_multipliers.tenorIndex,
			queryParameters.set_spread_collateral_multipliers.callSpreadCollateralMultipliers,
			queryParameters.set_spread_collateral_multipliers.putSpreadCollateralMultipliers
		)
	}

	// array multiplier values given as e18 notation. each must be > 1e18
	if ("set_spread_delta_multipliers" in queryParameters) {
		console.log(
			"setting spread delta multipliers for tenor ",
			queryParameters.set_spread_delta_multipliers.tenorIndex,
			queryParameters.set_spread_delta_multipliers.callSpreadDeltaMultipliers,
			queryParameters.set_spread_delta_multipliers.putSpreadDeltaMultipliers
		)
		await manager.setSpreadDeltaMultipliers(
			queryParameters.set_spread_delta_multipliers.tenorIndex,
			queryParameters.set_spread_delta_multipliers.callSpreadDeltaMultipliers,
			queryParameters.set_spread_delta_multipliers.putSpreadDeltaMultipliers
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
