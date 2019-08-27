const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const libracore =require('libra-core')
const express = require('express');
const app = express();
app.use(express.json());


const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
const sequence=0 

app.get('/', (req, res) => {
    res.send('Simple REST API');
});

app.get('/api/pubkey', (req, res) => {
    res.send(pubkey);
});

app.get('/api/pubkey/:addr', (req, res) => {
    let ADDRESS_HEX=req.params.addr
    console.log('ADDRESS_HEX', ADDRESS_HEX)

    getPubKeyOj(client, ADDRESS_HEX, sequence, function(pubkeyHex){
        console.log( (pubkeyHex))
        res.send(JSON.stringify({type: 'pubkey', data: pubkeyHex}));
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

async function getPubKeyOj(client, addr, sequence, callback) {
    const transaction = await client.getAccountTransaction(addr, sequence, false);
    const pubkeyHex=buffer2hex(transaction.signedTransaction.publicKey)
    if(callback)callback(pubkeyHex)
  }
  
  function buffer2hex(buffer) {
      return Array.prototype.map.call(
        new Uint8Array(buffer), x => ('00' + x.toString(16)
      ).slice(-2)).join('')
  }
   