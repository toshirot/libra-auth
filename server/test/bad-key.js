'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const { SHA3 } = require('sha3');

//==============================================
// Run tests

//Alice's Key
test('bad key test alice_pri_key_hex', {
    alice_pri_key_hex: 'fa127e73935678a647daf3d3af2a934dc0e9c9c39dc4ac2e69c9c3648447ff5'
})
test('bad key test alice_pub_key_hex', {
    alice_pub_key_hex: '6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc'
})

//Bob's Key
test('bad key test bob_pri_key_hex', {
    bob_pri_key_hex: '16253458330e54b08e3d492d200776d8af2d0367bbca4ca59df88985175a606'
})
test('bad key test bob_pub_key_hex', {
    bob_pub_key_hex: '78cd96278f49a78664faf50e9b238f3f5642360d80b3b0ce82782a4a8af3a8e9'
})



function test(info, testOj, calback){

        let oj={
            alice_pri_key_hex:  testOj.alice_pri_key_hex||'fa127e73935678a647daf3d3af2a934dc0e9c9c39dc4ac2e69c9c3648447ff53'
            ,alice_pub_key_hex: testOj.alice_pub_key_hex||'78cd96278f49a78664faf50e9b238f3f5642360d80b3b0ce82782a4a8af3a8e9'
            ,bob_pri_key_hex:   testOj.bob_pri_key_hex  ||'16253458330e54b08e3d492d200776d8af2d0367bbca4ca59df88985175a6069'
            ,bob_pub_key_hex:   testOj.bob_pub_key_hex  ||'6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc'
        }

        console.log('-----------------------------------------------');
        console.log(info);

        //==============================================
        // Prepare Keys
        // Corresponds to 3 and 4 after 1 and 2
        // Communication with testnet is omitted this sourse
        // 
        
                //----------------------------------------------
                // ALICE

                // Alice's Private Key
                const AlicePriKeyHex=oj.alice_pri_key_hex;
                // Create key pair from secret
                const AlicePriKey = ec.keyFromSecret(AlicePriKeyHex, 'hex');// hex string, array or Buffer

                // Import public key
                const AlicePubKeyHex = oj.alice_pub_key_hex;
                const AlicePubKey = ec.keyFromPublic(AlicePubKeyHex, 'hex');

                //----------------------------------------------
                // BOB

                const BobPriKeyHex = oj.bob_pri_key_hex;
                // Create key pair from secret
                const BobPriKey = ec.keyFromSecret(BobPriKeyHex, 'hex');// hex string, array or Buffer

                // Import public key
                const BobPubKeyHex =  oj.bob_pub_key_hex;
                const BobPubKey = ec.keyFromPublic(BobPubKeyHex, 'hex');
        



        // Start testing from the 5th

        //==============================================
        // 5. BOB: Make the sigB by the msg hash and  Bob's Private Key.
        //        
        //         msg = sha3Hash('hello') // mk massage hash 
        //         sigB = BobPriKey.sign(msg) // Sign with BOB's private key.
        //         // on this test, without this wss send. 
        //         // wss.send(sigB, msg) 

                //----------------------------------------------
                // Massage
                const msg = (new SHA3(512)).update('msg hello').digest('hex');

                //----------------------------------------------
                // Sign
                const sigB = BobPriKey.sign(msg).toHex();

                //----------------------------------------------
                // Send sigB and msg to Alice by WebSocket
                // Omitted

        //==============================================
        // 6. ALICE: Verify by Bob's Public Key the signB and the msg that were received.
        //  
                let res6     
                try{
                    res6 = BobPubKey.verify(msg, sigB);
                } catch{}
                
        
        //==============================================
        // 7. ALICE: if 6th is true then Make the sigA by the Alice's Private Key and the sigB.
        //
        
                //----------------------------------------------
                // test for res6

                if(res6===true){
                        console.info('8. ALICE: OK. BobPubKey.verify(msg, sigB) is true.');
                } else {
                        console.error('8. ALICE: Error. BobPubKey.verify(msg, sigB) is false.');
                }
                
                //----------------------------------------------
                // if res6 is true then  Make the sigA
                
                let sigA; 
                if(res6){
                        sigA = AlicePriKey.sign(sigB)
                } else {
                        //goto 1
                }

        //==============================================
        // 8. BOB: Verify the sigB and sigA by Alice's Public Key.

                let res8     
                try{
                    res8 =  AlicePubKey.verify(sigB, sigA);
                } catch{}
                
        //==============================================
        // 9. BOB: if 8th is true then Alice login is OK.

                //----------------------------------------------
                // test for res8

                if(res8===true){
                        console.info('9. BOB: OK. AlicePubKey.verify(sigB, sigA) is true.');
                } else {
                        console.error('9. BOB: Error. AlicePubKey.verify(sigB, sigA) is false.');
                }
        
}
        

/*

-----------------------------------------------
bad key test alice_pri_key_hex
8. ALICE: OK. BobPubKey.verify(msg, sigB) is true.
9. BOB: Error. AlicePubKey.verify(sigB, sigA) is false.
-----------------------------------------------
bad key test alice_pub_key_hex
8. ALICE: OK. BobPubKey.verify(msg, sigB) is true.
9. BOB: Error. AlicePubKey.verify(sigB, sigA) is false.
-----------------------------------------------
bad key test bob_pri_key_hex
8. ALICE: Error. BobPubKey.verify(msg, sigB) is false.
9. BOB: Error. AlicePubKey.verify(sigB, sigA) is false.
-----------------------------------------------
bad key test bob_pub_key_hex
8. ALICE: Error. BobPubKey.verify(msg, sigB) is false.
9. BOB: Error. AlicePubKey.verify(sigB, sigA) is false.
*/