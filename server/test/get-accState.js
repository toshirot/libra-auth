const libracore =require('libra-core')

async function main() {
  const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });

  const accountAddress = '854563c50d20788fb6c11fac1010b553d722edb0c02f87c2edbdd3923726d13f';
  const accountState = await client.getAccountState(accountAddress);

  console.log(accountState)

  console.log('sequenceNumber:' +accountState.sequenceNumber)

        // log account balance
  //console.log(accountState.balance.toString());

  // Account state has other information that you could be interested in such as `sequenceNumber`.
}

//await
main();