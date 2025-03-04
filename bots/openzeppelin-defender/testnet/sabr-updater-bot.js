const { Relayer } = require('defender-relay-client');
const {
    DefenderRelaySigner,
    DefenderRelayProvider
} = require("defender-relay-client/lib/ethers")
const { ethers } = require('ethers')
const sabrUpdaterLogic = require("../../core-logic/sabr-updater")


exports.handler = async function(credentials) {
  const volFeedAddress = "0xa0bC9BADC8F9489D440C5B16cf5f51273080137E"
  const exchangeAddress = "0xd92bEf13fAcC35679Db7cD1397a2D0997d6936A8"
  const relayerAddress = "0xbfde9d2d2f046d0f0336973c127f71fc2cfef491" // Relayer address

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