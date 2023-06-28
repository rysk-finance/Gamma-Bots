require('dotenv').config()
const { ethers } = require('ethers')

const gmxHedgingReactorAbi = require('../abi/GmxHedgingReactor.json')

const gmxCollateralManagerLogic = async (signer, gmxHedgingReactorAddress) => {
	const gmxHedgingReactor = new ethers.Contract(
		gmxHedgingReactorAddress,
		gmxHedgingReactorAbi,
		signer
	)

	const minHealthFactor = 4000
	const maxHealthFactor = 6000

	const [isBelowMin, isAboveMax, healthFactor, collateralToTransfer, position] =
		await gmxHedgingReactor.checkVaultHealth()

	if (healthFactor < minHealthFactor || healthFactor > maxHealthFactor) {
		const tx = await gmxHedgingReactor.update({
			gasLimit: '10000000'
		})
		await tx.wait()
	}

	console.log({
		isBelowMin,
		isAboveMax,
		healthFactor: healthFactor.toNumber(),
		collateralToTransfer: collateralToTransfer.toNumber(),
		position
	})
}

module.exports = gmxCollateralManagerLogic
