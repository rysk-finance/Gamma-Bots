require('dotenv').config()
const { ethers, utils } = require('ethers')

const optionCatalogueAbi = require('../abi/OptionCatalogue.json')
const liquidityPoolAbi = require('../abi/LiquidityPool.json')
const beyondPricerAbi = require('../abi/BeyondPricer.json')
const managerAbi = require('../abi/Manager.json')

const seriesDeactivatorLogic = async (
	signer,
	optionCatalogueAddress,
	liquidityPoolAddress,
	beyondPricerAddress,
	managerAddress,
	collateralAssetAddress,
	strikeAssetAddress,
	underlyingAssetAddress
) => {
	const optionCatalogue = new ethers.Contract(optionCatalogueAddress, optionCatalogueAbi, signer)
	const liquidityPool = new ethers.Contract(liquidityPoolAddress, liquidityPoolAbi, signer)
	const beyondPricer = new ethers.Contract(beyondPricerAddress, beyondPricerAbi, signer)
	const manager = new ethers.Contract(managerAddress, managerAbi, signer)

	const minExpiryTime = 86400
	const expirations = await optionCatalogue.getExpirations()

	const minDelta = 0.1
	const maxDelta = 0.7

	// create array to which we will add all Option types to change as we iterate
	const totalInput = []

	for (let i = 0; i < expirations.length; i++) {
		const callStrikes = await optionCatalogue.getOptionDetails(expirations[i], false)
		const putStrikes = await optionCatalogue.getOptionDetails(expirations[i], true)

		if (expirations[i] < Date.now() / 1000 + minExpiryTime) {
			// expiration date is below our minimum DTE. Make all options on this expiration untradeable
			// format array for changeOptionBuyOrSell that contains all option series of this expiration
			const formattedOptions = callStrikes
				.map(x => {
					return {
						expiration: expirations[i],
						strike: x,
						isPut: false,
						isBuyable: false,
						isSellable: false
					}
				})
				.concat(
					putStrikes.map(y => {
						return {
							expiration: expirations[i],
							strike: y,
							isPut: true,
							isBuyable: false,
							isSellable: false
						}
					})
				)
			// check the status of these options to make sure theyre not already untradeable
			const promises = formattedOptions.map(async option => {
				return await optionCatalogue.optionStores(
					ethers.utils.solidityKeccak256(
						['uint64', 'uint128', 'bool'],
						[option.expiration, option.strike, option.isPut]
					)
				)
			})
			const currentStatusArray = await Promise.all(promises)
			// filter out those series that are already untradeable
			const input = formattedOptions.filter((option, index) => {
				return currentStatusArray[index].isBuyable || currentStatusArray[index].isSellable
			})

			// if any options are still tradeable on this expiration, set them to not tradeable.
			if (input.length) {
				totalInput.push(input)
			}
		} else {
			// expiration date is still valid. check delta values on series individually.
			// get array of Types.OptionSeries format
			const optionSeriesArray = callStrikes
				.map(x => {
					return {
						expiration: expirations[i],
						strike: x,
						isPut: false,
						underlying: underlyingAssetAddress,
						strikeAsset: strikeAssetAddress,
						collateral: collateralAssetAddress
					}
				})
				.concat(
					putStrikes.map(y => {
						return {
							expiration: expirations[i],
							strike: y,
							isPut: true,
							underlying: underlyingAssetAddress,
							strikeAsset: strikeAssetAddress,
							collateral: collateralAssetAddress
						}
					})
				)
			for (let j = 0; j < optionSeriesArray.length; j++) {
				// iterate over array, get delta value of option
				const { totalDelta } = await beyondPricer.quoteOptionPrice(
					optionSeriesArray[j],
					ethers.utils.parseEther('1'),
					false,
					0
				)
				if (
					Math.abs(parseFloat(utils.formatEther(totalDelta))) > maxDelta ||
					Math.abs(parseFloat(utils.formatEther(totalDelta))) < minDelta
				) {
					// delta out of range
					const currentState = await optionCatalogue.optionStores(
						ethers.utils.solidityKeccak256(
							['uint64', 'uint128', 'bool'],
							[
								optionSeriesArray[j].expiration,
								optionSeriesArray[j].strike,
								optionSeriesArray[j].isPut
							]
						)
					)
					// if the option is tradable, make it not tradeable
					if (currentState.isBuyable || currentState.isSellable)
						totalInput.push({
							expiration: optionSeriesArray[j].expiration,
							strike: optionSeriesArray[j].strike,
							isPut: optionSeriesArray[j].isPut,
							isBuyable: false,
							isSellable: false
						})
				} else {
					// delta within range
					const currentState = await optionCatalogue.optionStores(
						ethers.utils.solidityKeccak256(
							['uint64', 'uint128', 'bool'],
							[
								optionSeriesArray[j].expiration,
								optionSeriesArray[j].strike,
								optionSeriesArray[j].isPut
							]
						)
					)
					// if the option is not tradable, make it tradeable
					if (!currentState.isBuyable || !currentState.isSellable)
						totalInput.push({
							expiration: optionSeriesArray[j].expiration,
							strike: optionSeriesArray[j].strike,
							isPut: optionSeriesArray[j].isPut,
							isBuyable: true,
							isSellable: true
						})
				}
			}
		}
	}
	// send the payload if there is any
	if (totalInput.length) {
		await manager.changeOptionBuyOrSell(totalInput)
	}
}

module.exports = seriesDeactivatorLogic
