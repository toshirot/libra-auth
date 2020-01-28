const kulaplibra = require("kulap-libra");

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
    let mnemonic='recipe patch airport shove toast detect echo type stand zero choice eye head spoon jungle three lava shallow lizard craft cancel brush stairs avoid'

    const wallet = new kulaplibra.LibraWallet({
      mnemonic: mnemonic
    });
    const account1 = wallet.newAccount();
    console.log('account1', account1.getAddress().toHex())
    const account2 = 'f96314b256a0af3dfe138c6e6363e5cea3ea2abb914135e1706bf9af63b38290';
    console.log('account2', account2)
    const response = await client.transferCoins(account1, account2, 1e6);
   
    // wait for transaction confirmation
    await response.awaitConfirmation(client);
  }
  main()