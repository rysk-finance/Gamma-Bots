require("dotenv").config()
const { ethers } = require("ethers")

const pvFeedAbi = require("../abi/PvFeed.json")
const controllerAbi = require("../abi/NewController.json")
const pricerAbi = require("../abi/ChainLinkPricer.json")

const settlerLogic = async () => {

  // Initialize default provider signer
	const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT)
	const signer = new ethers.Wallet(process.env.SETTLER_BOT_PK, provider)

  const controllerAddress = "0x0"

  const wethAddress = "0x0"
  const wstethAddress = "0x0"
  const wethPricerAddress = "0x0"
  const wstethPricerAddress = "0x0"


  
	const controller = new ethers.Contract(controllerAddress, controllerAbi, signer)
  const wethPricer = new ethers.Contract(wethPricerAddress, pricerAbi, signer)
  const wstethPricer = new ethers.Contract(wstethPricerAddress, pricerAbi, signer)
  
  // this will be an array of all assets that need pricing on expiration.
  // contains all possible collateral assets and underlying assets.
  const assetsToPrice = [
                          {
                            asset: "wETH",
                            address: wethAddress,
                            priceFeedURL: "www.pyth.biz/weth-prices-to-go",
                            pricer: wethPricer
                          },
                          {
                            asset: "wstETH",
                            address: wstethAddress,
                            priceFeedURL: "www.pyth.biz/wsteth-prices-to-go",
                            pricer: wstethPricer
                          }
                        ]
  //-------- time validation ----------

	// Otoken expiry hour in UTC
	const expiryHour = 8

  // set expiry timestamp
	let expiryTimestamp = new Date()
	expiryTimestamp.setHours(expiryHour)
	expiryTimestamp.setMinutes(0)
	expiryTimestamp.setSeconds(0)
	expiryTimestamp = Math.floor(expiryTimestamp.getTime() / 1000)

	// current timestamp in UTC seconds
	let currentTimestamp = new Date()
	const hour = currentTimestamp.getHours()
	currentTimestamp = Math.floor(currentTimestamp.getTime() / 1000)

	console.log('Expiry timestamp: ', expiryTimestamp.toString())
	console.log('Current timestamp: ', currentTimestamp)
	console.log('Current hour: ', hour)

  if (hour == expiryHour) {
    assetsToPrice.forEach(asset => {
      let expiryPrice = await oracle.getExpiryPrice(
        asset.address,
        expiryTimestamp
      )
      let isLockingPeriodOver = await oracle.isLockingPeriodOver(
        asset.address,
        expiryTimestamp
      )
      
      if (expiryPrice[0].toString() == '0' && isLockingPeriodOver) {
        // TODO: get price feed from stork and validate its timestamp == expiryTimestamp
        asset.pricer.setExpiryPriceInOracle(expiryTimestamp, wethPriceFromFeed);
      }

    })
  }
}



  // ============== settlement code ===================



  function checkVaultsToSettle() {
    
    // get list of users and Vault IDs which are active. something like below
    const openVaults = [
      {
        seriesAddress: "0x000000000000000000000000", // address of oToken minted from vault
        owner: "0x00000000000000000000000000", // vault owner
        id: 1 // vault id
      },
      {
        seriesAddress: "0x000000000000000000000000", // address of oToken minted from vault
        owner: "0x00000000000000000000000000", // vault owner
        id: 2 // vault id
      },
    ]

    // this will be filled with the settleable vaults from the array above
    const vaultsToSettle = []


    const needsToExecute = false

    for (let i = 0; i > openVaults.length; i++){
      vault = controller.getVault(openVaults[i].owner, openVaults[i].id);
      if (vault.shortAmounts.length == 0) {
				continue; // doesnt need settling
			}
      // check vault can be settled (dispute period over etc)
      if ((controller.isSettlementAllowed(seriesAddresses[i])) && vault.shortAmounts[0] > 0) {
				vaultsToSettle.push(openVaults[i])
				needsToExecute = true; // at least one vault can be settled so toggle this to true
			}
    }

    if (needsToExecute) {
      for (let i = 0; i > vaultsToSettle.length; i++){
        controller.operate(
          {
            actionType: 7, // SettleVault actiontype enum
            owner: vaultsToSettle[i].owner, // address
            secondAddress: vaultsToSettle[i].owner, // THIS IS THE ADDRESS TO SEND THE COLLATERAL TO. WE MAY WANT TO SET IT TO OURSELVES AND DEPOSIT AGAIN ON BEHALF OF USER.
            asset: "irrelevant", // address
            vaultId: vaultsToSettle[i].id, // uint256
            amount: "irrelevant", // uint256
            index: "irrelevant", // uint256
            data: "irrelevant" // bytes
          }
        )
      }
    }
  }




