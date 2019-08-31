'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const assert = require('assert');
const { SHA3 } = require('sha3');

test()

function test(){

    
    //==============================================
    // ALICE

    const AlicePriKeyHex='2dde91f2830bda4b1eda07b33e45736f4c9e34707f655b110e0dca5751144336';
    // Create key pair from secret
    const AlicePriKey = ec.keyFromSecret(AlicePriKeyHex, 'hex');// hex string, array or Buffer

    // Import public key
    const AlicePubKeyHex = '5e173066752204c1824f90bc5d6f1d68bbca920be020c9bb0abce4da4398ef07';
    const AlicePubKey = ec.keyFromPublic(AlicePubKeyHex, 'hex');

    //==============================================
    // BOB

    const BobPriKeyHex='16253458330e54b08e3d492d200776d8af2d0367bbca4ca59df88985175a6069';
    // Create key pair from secret
    const BobPriKey = ec.keyFromSecret(BobPriKeyHex, 'hex');// hex string, array or Buffer

    // Import public key
    const BobPubKeyHex = '6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc';
    const BobPubKey = ec.keyFromPublic(BobPubKeyHex, 'hex');
 
    //==============================================
    // Massage

    const msg = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

    //==============================================
    // 5. BOB: sigB = BobPriKey.sign(msg)

    const sigB= BobPriKey.sign(msg).toHex();

    //==============================================
    // 6. BOB: Send sigB and msg to Alice by WebSocket. wss.send(sigB, msg)

    // send and recieve wss.send(signB, msg)

    //==============================================
    // 7. ALICE: verify {bool} BobPubKey.verify(msg, sigB)

    const res7 = BobPubKey.verify(msg, sigB);
  
    //==============================================
    // 8. ALICE: if((7)===true){ Admission or Login: sigA = AlicePriKey.sign(sigB); Show sigA or QR code } else { Goto 1 }

 
    if(res7===true){
        console.info('8. OK. verify(msg, sigB) is true.');
    } else {
        console.error('8. Error. verify(msg, sigB) is false.');
    }
    
    assert.equal(res7, true);
 
    
    let sigA; 
    if(res7){
        sigA = AlicePriKey.sign(sigB); 
    } else {
    }

    //==============================================
    // 9. BOB: verify {bool} AlicePubKey.verify(sigB, sigA)

    const res8 = AlicePubKey.verify(sigB, sigA);

    if(res8===true){
        console.info('9. OK. verify(sigB, sigA) is true.');
    } else {
        console.error('9. Error. verify(sigB, sigA) is false.');
    }
    
}


