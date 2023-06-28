const { Relayer } = require('defender-relay-client');
const {
    DefenderRelaySigner,
    DefenderRelayProvider
} = require("defender-relay-client/lib/ethers")
const { ethers } = require('ethers')
const sabrUpdaterLogic = require("../../core-logic/sabr-updater")


exports.handler = async function(credentials) {
  const volFeedAddress = "0xF204B60A98B3be05914AeC46bcEd2476D13a0225"
  const exchangeAddress = "0xC117bf3103bd09552F9a721F0B8Bce9843aaE1fa"
  const relayerAddress = "0xd5730eDE6Ed7f9051E9E55eB4B507b4F48C46111" // Relayer address

  // Initialize default provider and defender relayer signer
  const provider = new DefenderRelayProvider(credentials)
  const signer = new DefenderRelaySigner(credentials, provider, {
        speed: "fast",
        from: relayerAddress
  })
  const {
    queryParameters, // Object with key-values from query parameters
  } = credentials.request;

  return sabrUpdaterlogic(signer, volFeedAddress, exchangeAddress, queryParameters) 

}