//import { LibraClient, LibraNetwork } from 'libra-core';
const libracore =require('libra-core')
const ALICE_ADDRESS_HEX='cd2eacf4079ca9b1dd2c74b263b67ad6aafbbba708246c9b2e3c48b9d57f7f54'
const CLIENT = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });


async function main(client, addr, sequence) {
  const transaction = await client.getAccountTransaction(addr, sequence, false);
  //console.log(transaction)
  console.log(transaction.signedTransaction.publicKey.toString('hex'))

  Buffer.from(fromAddrOj.address.addressBytes).toString('hex') 
  console.log(transaction.signedTransaction.transaction.sendersAddress.toString('hex'))
  console.log(+transaction.signedTransaction.transaction.sequenceNumber)
  
  //console.log(JSON.stringify(transaction, null, 2))
}
const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
//let addr='000000000000000000000000000000000000000000000000000000000a550c18'
//let sequence=1

let addr='cd2eacf4079ca9b1dd2c74b263b67ad6aafbbba708246c9b2e3c48b9d57f7f54'//'000000000000000000000000000000000000000000000000000000000a550c18'
let sequence=0//3084
//await 
main(CLIENT, addr, sequence);
