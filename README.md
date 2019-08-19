<h1>Libra Auth</h1>

 
An authentication method using Libra's Public Key and Secret Key.
Use a signature by EdDSA.
In the figure below, User “ALICE” pays the ticket fee to Ticket Center “BOB” with Libra and is authenticated with the signature ticket.

It is an authentication based on the Libra client key. But the communication between Bob and Alice doesn't put a load on the Libra blockchain. And the processing speed is fast.

<h2>What we are going to make</h2>

Make this. Ticket application client and server authentication work using libra-auth method.

<a href="https://kabuda.net/test/libra/libra-auth/doc/libra-auth-en.html"><img src=https://kabuda.net/test/libra/libra-auth/img/libra-auth.png></a>

<h2>document</h2>
<li>English: <a href="https://kabuda.net/test/libra/libra-auth/doc/libra-auth-en.html">https://kabuda.net/test/libra/libra-auth/doc/libra-auth-en.html</a></li>
<li>Japanese: <a href="https://kabuda.net/test/libra/libra-auth/doc/libra-auth-ja.html">https://kabuda.net/test/libra/libra-auth/doc/libra-auth-ja.html</a></li>
<h2>flow</h2>

<section>
        <div>
                <ol>
                        <li>ALICE: Tap or Click [ Entry Button ]</li>
                        <li>ALICE: Transffer Some Libra to BOB</li>
                        <li>ALICE: get BOB's PublicKey from testnet transaction</li>
                        <li>BOB:   get ALICE's PublicKey from testnet transaction</li>
                        <li>BOB:   Make the sigB by the msg hash and  Bob's Private Key.<br>
                                And send sigB and msg to Alice by WebSocket. <br>
e.g.<pre class=eg>
msg = (new SHA3(512)).update('msg hello').digest('hex');
sigB = BobPriKey.sign(msg).toHex();
wss.send(sigB, msg) </pre>
                        </li>
                        <li>ALICE: Verify by Bob's Public Key the signB and the msg that were received.<br>
e.g.<pre class=eg>{bool} BobPubKey.verify(msg, sigB)</pre>
                        </li>
                        <li>ALICE: if 6th is true then Make the sigA by the Alice's Private Key and the sigB.<br>
e.g.<pre class=eg>
if(res6){
        sigA = AlicePriKey.sign(sigB)
} else {
        //goto 1
} </pre>
                        </li>
                        <li>BOB:  Verify the sigB and sigA by Alice's Public Key. <br>
e.g.<pre class=eg>{bool}  AlicePubKey.verify(sigB, sigA) </pre>
                        </li>
                        <li>BOB:  if 8th is true then login is OK.<br>
e.g.<pre class=eg>
if(res8){
        // OK. Alice login is OK.
} else {
        // Error
}</pre>
                        </li>
                </ol>   
        </div>
</section>

<h2>discription</h2>
<section>
        <div>
                <ul>
                        <li>ALICE: if the sixth verify is true, That means 
                        <ol>
                                <li>Bob's Public Key and signeture "sigB" and msg were valid.</li>
                                <li>Bob has the Private Key used in this transaction.</li>
                                <li>Therefore, 5's Bob is the person Alice paid Libra in 2's transaction.</li>
                        </ol>
                        </li>
                        <li>BOB: if the 8th verify is true,That means 
                        <ol>
                                <li>Alice's Public Key and signeture "sigA" and signeture "sigB" were valid.</li>
                                <li>Alice has the Private Key used in 2's transaction.</li>
                                <li>And this msg was recieved from Bob to Alice at 6. So 7's Allice is the same as 6.</li>
                                <li>Therefore, 7's Alice is the person who paid Libra to Bob in 2 transactions.</li>
                        </ol>   
                            <br>
                        </li>
                        <li>As a result, at 9, Alice is authenticated by Bob. Entry tickets or tokens with “sigA” are valid.</li>
                </ul>   
        </div>
</section>

<h2>test Implementation</h2>
<section>
        <div>
                <strong>Node.js: </strong>Signature-only test without WeSocket communication between Alice and Bob.
                <pre><code  class="javascript">
'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');
const { SHA3 } = require('sha3');

test()

function test(){

        //==============================================
        // Prepare Keys
        // Corresponds to 3 and 4 after 1 and 2
        // Communication with testnet is omitted this sourse
        // 
        
                //----------------------------------------------
                // ALICE

                // Alice's Private Key
                const AlicePriKeyHex='fa127e73935678a647daf3d3af2a934dc0e9c9c39dc4ac2e69c9c3648447ff53';
                // Create key pair from secret
                const AlicePriKey = ec.keyFromSecret(AlicePriKeyHex, 'hex');// hex string, array or Buffer

                // Import public key
                const AlicePubKeyHex = '78cd96278f49a78664faf50e9b238f3f5642360d80b3b0ce82782a4a8af3a8e9';
                const AlicePubKey = ec.keyFromPublic(AlicePubKeyHex, 'hex');

                //----------------------------------------------
                // BOB

                const BobPriKeyHex='16253458330e54b08e3d492d200776d8af2d0367bbca4ca59df88985175a6069';
                // Create key pair from secret
                const BobPriKey = ec.keyFromSecret(BobPriKeyHex, 'hex');// hex string, array or Buffer

                // Import public key
                const BobPubKeyHex = '6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc';
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
                const res6 = BobPubKey.verify(msg, sigB);
        
        //==============================================
        // 7. ALICE: if 6th is true then Make the sigA by the Alice's Private Key and the sigB.
        //
        
                //----------------------------------------------
                // test for res6

                if(res6===true){
                        console.info('8. ALICE: OK. verify(msg, sigB) is true.');
                } else {
                        console.error('8. ALICE: Error. verify(msg, sigB) is false.');
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

                const res8 = AlicePubKey.verify(sigB, sigA);

        //==============================================
        // 9. BOB: if 8th is true then Alice login is OK.

                //----------------------------------------------
                // test for res8

                if(res8===true){
                        console.info('9. BOB: OK. verify(sigB, sigA) is true.');
                } else {
                        console.error('9.BOB: Error. verify(sigB, sigA) is false.');
                }
        
}
          
/* response */
7. ALICE: OK. verify(msg, sigB) is true.
9. BOB: OK. verify(sigB, sigA) is true. 
                </code></pre>
        </div>
</section>
<h2>todos</h2>
<section>
        <div>
                <ul>
                        <li>pre: create alice's account. and mint.</li>
                        <li>pre: create bob's account. </li>
                        <li>for 1: mk htmls </li>
                        <li>for 2: transfer from browser.(create client, mint too.)  </li>
                        <li>for 3: get transaction from browser.</li>
                        <li>for 4: get transaction from server.</li>
                        <li>for 5,6: instal EdDSA, sha3, WebSocket</li>
                        <li>for 7: install QR for browser.</li>
                        <li>for 8,9: Smile</li>
                </ul>
        </div>
</section>
</body>
</html>

