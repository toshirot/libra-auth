const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const libracore =require('libra-core')

let ADDRESS_HEX
let argAddr=process.argv[2];
if(!argAddr){
    ADDRESS_HEX='--'//'cd2eacf4079ca9b1dd2c74b263b67ad6aafbbba708246c9b2e3c48b9d57f7f54'
} else {
    ADDRESS_HEX=argAddr
}
console.log(ADDRESS_HEX)

const client = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
const sequence=0 
 
let key=getPubKeyOj(client, ADDRESS_HEX, sequence, function(pubkeyHex){
    console.log( (pubkeyHex))
   // console.log(JSON.stringify(pubkeyHex))
});

 
async function getPubKeyOj(client, addr, sequence, callback) {
  const transaction = await client.getAccountTransaction(addr, sequence, false);
  const pubkeyHex=buffer2hex(transaction.signedTransaction.publicKey)
  //if(callback)callback(pubkeyHex)
}

function buffer2hex(buffer) {
    return Array.prototype.map.call(
      new Uint8Array(buffer), x => ('00' + x.toString(16)
    ).slice(-2)).join('')
}
 
 

