//import { LibraClient, LibraNetwork } from 'libra-core';
const kulaplibra =require('kulap-libra')

async function main() {
    // On Browser
    // const client = new LibraClient({
    //   transferProtocol: 'https',
    //   host: 'ac-libra-testnet.kulap.io',
    //   port: '443',
    //   dataProtocol: 'grpc-web-text'
    // })
    // On Node
    const client = new kulaplibra.LibraClient({ network: kulaplibra.LibraNetwork.Testnet })
  
    const accountAddress = '7f58df27522872ecfac340c5c072427e6f8083ca3c79bb748cdd1ae073dacc42';
    const sequenceNumber = 43; //can also use a string for really large sequence numbers;
  
    const transaction = await client.getAccountTransaction(accountAddress, sequenceNumber);
  }

main();