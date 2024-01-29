const { ethers } = require('ethers')
const axios = require("axios");
const managerAbi = require('../../abi/Manager.json')

// constants
const MANAGER_ADDRESS = "0xa7AD85AC7Eda2807fA2d596B3ff1F9b63D4d3682"
const HEDGER_BOT_ADDRESS = "0x259585e3D8a4cc209b33eEa64751287Ed05629b7"

class DiscordNotifier {
  constructor(context) {
    this.context = context;
  }

  async #notifyDiscord(title, description, fields, footer_text = null) {
    console.log('Sending to Discord:', title);

    const webhookLink = await this.context.secrets.get("tenderlyWarningWebhook");

    const embed = {
      title: title,
      description: description,
      fields: fields,
      footer: footer_text ? { text: footer_text } : undefined
    };

    const data = {
      content: "Automated Hedge Order",
      embeds: [embed]
    };

    try {
      const response = await axios.post(webhookLink, data, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 204) {
        throw new Error(`Request to discord returned an error ${response.status}, the response is:\n${response.statusText}`);
      }
    } catch (error) {
      console.error('Error sending message to Discord:', error);
      throw error;
    }
  }

  async sendHedgeFailure(text) {
    const title = "Hedge Order Failure";
    const description = "An error occurred while processing the hedge order.";

    const fields = [
      { name: "Error:", value: text, inline: true }
    ];

    await this.#notifyDiscord(title, description, fields);
  }
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

const actionFn = async (context, webhookEvent, createClient = createEthereumClient, perform = hedgeDelta, notifier = new DiscordNotifier(context)) => {
  if (!notifier) {
    notifier = new DiscordNotifier(context);
  }

  try {
    const { provider, signer } = createClient(context.secrets);
    const manager = new ethers.Contract(MANAGER_ADDRESS, managerAbi, signer);
    const queryParameters = webhookEvent.payload;

    return await perform(manager, queryParameters.delta, queryParameters.reactor_index);
  } catch (error) {
    notifier.sendHedgeFailure(error);
  }
};

// Do not change this.
module.exports = { actionFn, createEthereumClient, hedgeDelta, DiscordNotifier, validateDeltaWithinLimit }


