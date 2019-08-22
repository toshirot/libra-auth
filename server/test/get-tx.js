//import { LibraClient, LibraNetwork } from 'libra-core';
const libracore =require('libra-core')
async function main() {
  const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
  const accountAddress = '000000000000000000000000000000000000000000000000000000000a550c18'//'7f58df27522872ecfac340c5c072427e6f8083ca3c79bb748cdd1ae073dacc42';
  const sequenceNumber = 3084; //can also use a string for really large sequence numbers;

  const transaction = await client.getAccountTransaction(accountAddress, sequenceNumber, false);
  console.log(transaction)
  //console.log(JSON.stringify(transaction, null, 2))
}

//await
main();