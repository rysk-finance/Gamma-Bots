require("dotenv").config()
const { ethers, utils } = require("ethers")

const optionCatalogueAbi = require("../abi/OptionCatalogue.json")
const beyondPricerAbi = require("../abi/BeyondPricer.json")
const managerAbi = require("../abi/Manager.json")
const lensAbi = require("../abi/DHVLensMK1.json")

const seriesDeactivatorLogic = async (
	signer,
	optionCatalogueAddress,
	beyondPricerAddress,
	managerAddress,
	collateralAssetAddress,
	strikeAssetAddress,
	underlyingAssetAddress
) => {
	const lensAddress = "0xa306C00e08ebC84a5F4F67b561B8F6EDeb77600D"
	const optionCatalogue = new ethers.Contract(optionCatalogueAddress, optionCatalogueAbi, signer)
	const beyondPricer = new ethers.Contract(beyondPricerAddress, beyondPricerAbi, signer)
	const manager = new ethers.Contract(managerAddress, managerAbi, signer)
	const lens = new ethers.Contract(lensAddress, lensAbi, signer)

	const minExpiryTime = 86400
	const expirations = await optionCatalogue.getExpirations()

	const minDelta = 0.025
	const maxDelta = 0.975

	// create array to which we will add all Option types to change as we iterate
	const totalInput = []

	for (let i = 0; i < expirations.length; i++) {
		const optionExpirationDrill = await lens.getOptionExpirationDrill(expirations[i])
		const callStrikes = optionExpirationDrill.callStrikes
		const putStrikes = optionExpirationDrill.putStrikes
		const callOptionDrill = optionExpirationDrill.callOptionDrill
		const putOptionDrill = optionExpirationDrill.putOptionDrill
		if (expirations[i] < Date.now() / 1000 + minExpiryTime) {
			if (expirations[i] < Date.now() / 1000) {
				console.log("expiry in past")
				continue
			}
			console.log("below min expiry")

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
			const concatOptionDrill = callOptionDrill.concat(putOptionDrill)
			// filter out those series that are already untradeable
			const input = formattedOptions.filter((option, index) => {
				return !concatOptionDrill[index].buy.disabled || !concatOptionDrill[index].sell.disabled
			})

			// if any options are still tradeable on this expiration, set them to not tradeable.
			if (input.length) {
				totalInput.push(...input)
			}
		} else {
			console.log("above min expiry")
			for (let j = 0; j < callStrikes.length; j++) {
				// iterate over array, get delta value of option
				const totalDelta = optionExpirationDrill.callOptionDrill[j].delta
				console.log({
					totalDelta: utils.formatEther(totalDelta),
					expiration: optionExpirationDrill.expiration.toNumber(),
					strike: utils.formatEther(callOptionDrill[j].strike)
				})
				if (
					Math.abs(parseFloat(utils.formatEther(totalDelta))) > maxDelta ||
					Math.abs(parseFloat(utils.formatEther(totalDelta))) < minDelta
				) {
					// delta out of range
					const isBuyable = !optionExpirationDrill.callOptionDrill[j].buy.disabled
					const isSellable = !optionExpirationDrill.callOptionDrill[j].sell.disabled

					// if the option is tradable, make it not tradeable
					if (isBuyable || isSellable)
						totalInput.push({
							expiration: optionExpirationDrill.expiration,
							strike: callOptionDrill[j].strike,
							isPut: false,
							isBuyable: false,
							isSellable: false
						})
				} else {
					// delta within range
					const isBuyable = !optionExpirationDrill.callOptionDrill[j].buy.disabled
					const isSellable = !optionExpirationDrill.callOptionDrill[j].sell.disabled
					// if the option is not tradable, make it tradeable
					if (!isBuyable || !isSellable)
						totalInput.push({
							expiration: optionExpirationDrill.expiration,
							strike: callOptionDrill[j].strike,
							isPut: false,
							isBuyable: true,
							isSellable: true
						})
				}
			}
			for (let j = 0; j < putStrikes.length; j++) {
				// iterate over array, get delta value of option
				const totalDelta = optionExpirationDrill.putOptionDrill[j].delta
				console.log({
					totalDelta: utils.formatEther(totalDelta),
					expiration: optionExpirationDrill.expiration.toNumber(),
					strike: utils.formatEther(putOptionDrill[j].strike)
				})
				if (
					Math.abs(parseFloat(utils.formatEther(totalDelta))) > maxDelta ||
					Math.abs(parseFloat(utils.formatEther(totalDelta))) < minDelta
				) {
					// delta out of range
					const isBuyable = !optionExpirationDrill.putOptionDrill[j].buy.disabled
					const isSellable = !optionExpirationDrill.putOptionDrill[j].sell.disabled

					// if the option is tradable, make it not tradeable
					if (isBuyable || isSellable)
						totalInput.push({
							expiration: optionExpirationDrill.expiration,
							strike: putOptionDrill[j].strike,
							isPut: true,
							isBuyable: false,
							isSellable: false
						})
				} else {
					// delta within range
					const isBuyable = !optionExpirationDrill.putOptionDrill[j].buy.disabled
					const isSellable = !optionExpirationDrill.putOptionDrill[j].sell.disabled
					// if the option is not tradable, make it tradeable
					if (!isBuyable || !isSellable)
						totalInput.push({
							expiration: optionExpirationDrill.expiration,
							strike: putOptionDrill[j].strike,
							isPut: true,
							isBuyable: true,
							isSellable: true
						})
				}
			}
		}
	}
	// send the payload if there is any
	console.log("total input length:", totalInput.length)
	if (totalInput.length) {
		console.log(
			"totalInput:",
			totalInput.map(x => {
				return {
					expiration: x.expiration.toNumber(),
					strike: utils.formatEther(x.strike),
					isPut: x.isPut,
					isBuyable: x.isBuyable,
					isSellable: x.isSellable
				}
			})
		)
		// await manager.changeOptionBuyOrSell(totalInput)
	}
}

module.exports = seriesDeactivatorLogic
