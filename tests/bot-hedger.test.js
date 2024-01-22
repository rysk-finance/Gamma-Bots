let expect;
import('chai').then(chai => {
    expect = chai.expect;
});
const { ethers } = require('ethers');
const { actionFn, createEthereumClient, validateDeltaWithinLimit } = require('../bots/tenderly/mainnet/bot-hedger');
const { TestContext, TestRuntime, TestWebhookEvent } = require('@tenderly/actions-test');
const managerAbi = require('../bots/abi/Manager.json');


const MANAGER_ADDRESS = "0xa7AD85AC7Eda2807fA2d596B3ff1F9b63D4d3682"

function generatePrivateKey() {
    const wallet = ethers.Wallet.createRandom();
    return wallet.privateKey;
  }

describe('Tenderly delta hedging bot tests', () => {
    context = new TestContext();
    private_key = generatePrivateKey();
    signer = new ethers.Wallet(private_key);
    // wait if let expect is undefined
    if(expect === undefined) {
        setTimeout(() => {}, 500);
    }

    beforeEach(async () => {
    });

    afterEach(() => {
    });

    it('client creation should have pk and signer', async () => {
        context.secrets.put('ALCHEMY_RPC_ENDPOINT', 'https://eth-mainnet.alchemyapi.io/v2/secret');
        context.secrets.put('REDUNDANT_DELTA_HEDGER_BOT_PK', private_key);
        const client = await createEthereumClient(context.secrets);
        expect(client.provider).to.not.be.null;
        expect(client.signer).to.not.be.null;
    });

    it('should handle delta limit exceeded error', async () => {
        const managerSimulator = () => ({
            deltaLimit: async (address) => {
                return 100 * 1e18;
            }
        })
        let delta = 100 * 1e18;

        try {
            await validateDeltaWithinLimit(managerSimulator(), delta);
        } catch (error) {
            expect(error).to.equal('error: delta limit exceeded');
        }

        delta = 1 * 1e18;
        expect(await validateDeltaWithinLimit(managerSimulator(), delta)).to.equal(undefined);
        
    });

});
