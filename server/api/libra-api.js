const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const libracore =require('libra-core')
const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const app = express();

const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
const sequence=0 

//=============================================================================
// data
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // for LIBRA

    //unit of Libra
    const LIBRA_UNIT=1000000
    //The ticket price is 10 Libra
    const TICKET_PRICE=10*LIBRA_UNIT//10*1000000 is 10 Libra
    //First mint for Alice
    const FIRST_MINT_FOR_ALICE=TICKET_PRICE*2
    //host for mint
    const DEFAULT_FAUCET_HOST='faucet.testnet.libra.org'
    //protocol for mint. http or https
    const DEFAULT_FAUCET_PROTOCOL='http' //Currently you must post it via http "DEFAULT_FAUCET_PROTOCOL" instead of https. 2019-08-27

//=============================================================================
// https
// 
//-----------------------------------------------------------------------------

    const host='libra-auth.com'
    const pemPath='/etc/myletsencrypt/live/'+host
    const options = {
        cert: fs.readFileSync(pemPath+'/fullchain.pem')
        ,key: fs.readFileSync(pemPath+'/privkey.pem')
    }
    const server = https.createServer(options,app);
    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log(`Listening on port ${port}...`));

//=============================================================================
// express
// 
//-----------------------------------------------------------------------------

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


app.get('/', (req, res) => {
    res.send('Simple REST API');
});

//------------------------------------------------------------
// mintで入金する
// e.g. https://libra-auth.com:3000/api/faucet-testnet/ca1b2332ed90385257598d9bba84d15bc35bc7260540ab1f48e39428bee60955
app.get('/api/faucet-testnet/:addr', (req, res) => {

    console.log('ADDRESS_HEX', req.params.addr)
       // res.send(JSON.stringify({type:'faucet',res:'ok'}));
    doMint(res, req.params.addr, FIRST_MINT_FOR_ALICE, function(res2){
        res2.send(JSON.stringify({type:'mint', body:'ok'}));
    })
    //res.send(JSON.stringify({type:'mint', body:'ok'}));
});

//------------------------------------------------------------
// pubkeyを取得する
// e.g. https://libra-auth.com:3000/api/pubkey/hoge
app.get('/api/pubkey/:addr', (req, res) => {
    
    console.log('ADDRESS_HEX', req.params.addr)
    // Stub for test
    let pubkeyHex='6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc'
    res.send(JSON.stringify({type:'pubkey',key:pubkeyHex}));

    return 
    let ADDRESS_HEX=req.params.addr
    console.log('ADDRESS_HEX', ADDRESS_HEX)

    getPubKeyOj(client, ADDRESS_HEX, sequence, function(pubkeyHex){
        console.log( (pubkeyHex))
        res.send(JSON.stringify({type: 'pubkey', key: pubkeyHex}));
    });
});




//=============================================================================
// functions
// 
//-----------------------------------------------------------------------------


//------------------------------------------------------------
// Publick key を取得する
// @client {object} 
// @addr {string} 
// @sequence {number} 
// @callback {function} 
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

//------------------------------------------------------------
// mintで入金する
// @address {number} libra address
function doMint(res2, address, amount, callback){

    const host=DEFAULT_FAUCET_HOST
    const protocol=DEFAULT_FAUCET_PROTOCOL

    const url=`${protocol}://${host}?amount=${amount}&address=${address}`

    const options = {
        host: host,
        method: "POST"
    };
    console.log('url', url)
    const req = http.request(url, options, res => {
         
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
            //console.log('No more data in response.');
            if(callback)callback(res2)
        });
    });
    
    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });
    
    // Write data to request body
    //req.write('');
    req.end();
}