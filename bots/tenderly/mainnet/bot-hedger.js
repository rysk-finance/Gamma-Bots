const { ethers } = require('ethers')
const axios = require("axios");
const managerAbi = require('../../abi/Manager.json')

// constants
const MANAGER_ADDRESS = "0xa7AD85AC7Eda2807fA2d596B3ff1F9b63D4d3682"
const HEDGER_BOT_ADDRESS = "0x259585e3D8a4cc209b33eEa64751287Ed05629b7"

const notifyDiscord = async (text, context) => {
  console.log('Sending to Discord:', `🐥 ${text}`)
  const webhookLink = await context.secrets.get("tenderlyWarningWebhook");
  await axios.post(
    webhookLink,
    {
      'content': `🐥 ${text}`
    },
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
  );
}

async function createEthereumClient(secrets) {
  const provider = new ethers.providers.JsonRpcProvider(
    await secrets.get("ALCHEMY_RPC_ENDPOINT")
  );
  const signer = new ethers.Wallet(
    await secrets.get("REDUNDANT_DELTA_HEDGER_BOT_PK"),
    provider
  );
  return { provider, signer };
}

async function validateDeltaWithinLimit(manager, delta) {
  const deltaLimit = await manager.deltaLimit(HEDGER_BOT_ADDRESS);
  const isDeltaExceedingLimit = deltaLimit < Math.abs(delta);
  if (isDeltaExceedingLimit) {
    throw "error: delta limit exceeded";
  }
}

async function hedgeDelta(manager, delta, reactorIndex) {
  await validateDeltaWithinLimit(manager, delta);
  let tx = await manager.rebalancePortfolioDelta(delta, reactorIndex);
  return tx.hash;
}

const actionFn = async (context, webhookEvent, createClient = createEthereumClient, perform = hedgeDelta, notify = notifyDiscord) => {
  try {
    const { provider, signer } = createClient(context.secrets);
    const manager = new ethers.Contract(MANAGER_ADDRESS, managerAbi, signer);
    const queryParameters = webhookEvent.payload;

    return await perform(manager, queryParameters.delta, queryParameters.reactor_index);
  } catch (error) {
    notify(`Tenderly Delta Hedger Failure:\n${error}`, context);
  }
};

// Do not change this.
module.exports = { actionFn, createEthereumClient, hedgeDelta, notifyDiscord, validateDeltaWithinLimit }


