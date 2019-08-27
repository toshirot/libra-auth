const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const libracore =require('libra-core')
const express = require('express');
const app = express();
app.use(express.json());

// 
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    next();
});
app.options('*', function (req, res) {
    res.sendStatus(200);
  });

//const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
//const sequence=0 

app.get('/', (req, res) => {
    res.send('Simple REST API');
});

app.get('/api/pubkey/:addr', (req, res) => {

    // Stub for test
    let pubkeyHex='6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc'
    res.send(JSON.stringify({type: 'pubkey', key: pubkeyHex}));

    return 
    let ADDRESS_HEX=req.params.addr
    console.log('ADDRESS_HEX', ADDRESS_HEX)

    getPubKeyOj(client, ADDRESS_HEX, sequence, function(pubkeyHex){
        console.log( (pubkeyHex))
        res.send(JSON.stringify({type: 'pubkey', key: pubkeyHex}));
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
