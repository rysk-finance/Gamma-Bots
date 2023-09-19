const { ethers } = require("ethers")

const pvFeedAbi = require("../abi/PvFeed.json")
const multicallAbi = require("../abi/SettlerMulticall.json")

const settlerLogic = async (signer, pvfeedAddress, multicallAddress) => {
	const pvfeed = new ethers.Contract(pvfeedAddress, pvFeedAbi, signer)
	const multicall = new ethers.Contract(multicallAddress, multicallAbi, signer)

	const series = await pvfeed.getAddressSet()
	const multicallResponse = await multicall.checkVaultsToSettle(series)
	const vaultsToSettle = multicallResponse[0].filter(
		id => id != "0x0000000000000000000000000000000000000000"
	)
	console.log(multicallResponse)
	if (multicallResponse[1] == true) {
		await multicall.settleVaults(vaultsToSettle, { gasLimit: "100000000" })
	}
}

module.exports = settlerLogic
