//import { LibraClient, LibraNetwork } from 'libra-core';
const libracore =require('libra-core')


async function main(client, addr, sequence) {
  const transaction = await client.getAccountTransaction(addr, sequence, false);
  console.log(transaction)
  console.log(transaction.signedTransaction.publicKey)
  console.log(+transaction.signedTransaction.transaction.sequenceNumber)
  
  //console.log(JSON.stringify(transaction, null, 2))
}
const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
let addr='000000000000000000000000000000000000000000000000000000000a550c18'
let sequence=3084
//await 
main(client, addr, sequence);
