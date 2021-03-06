<h1>Libra Auth</h1>

<p>
An authentication method using Libra's Public Key and Secret Key.
Use a signature by EdDSA.
In the figure below, User “ALICE” pays the ticket fee to Ticket Center “BOB” with Libra and is authenticated with the signature ticket. </p>
<p>
It is authentication based on the Libra client keys. And the processing speed is fast.
</p>
<p>
Why is it fast?the communication between Bob and Alice doesn't put a load on the Libra blockchain. For example, when if tens of thousands of people enter the stadium, libra-auth authentication can be handled only by the client-side and server-side without "transaction" of accessing the Libra network.
</p>

<h2>What we are going to make on this Demo</h2>

Make this. Client and server authentication work sample for ticket application using the libra-auth method.

<h2>Demo</h2>
<p>
<li>2019-09-18 Libra Auth won 'Honorable mention' at HackLibra.  https://medium.com/@hacklibra/hacklibra-winners-8da1a9124628
<li>2019-09-10 Demo maintenance completed.
<li>2019-09-10 Now the demo is under maintenance.
<li>2019-09-06 on "after0901" branch, i fixed it. i made stub in the faulty part of the connection to Testnet. https://github.com/toshirot/libra-auth/tree/after0901
my demo now works.</li>
<li>2019-09-05 This demo currently stops with transaction-related errors. @see https://github.com/perfectmak/libra-core/issues/41</li>
</p>
<p>
First, open the ALICE page on your PC or smartphone and display the QR ticket.
Next, use another smartphone to authenticate by scanning the ALICE QR code from the BOB page.
</p>

<a href="https://libra-auth.com/">https://libra-auth.com/</a>
<ol>
<li><strong>ALICE: Buy ticket: </strong><br><a href=http://libra-auth.com/buy-ticket.html>http://libra-auth.com/buy-ticket.html</a></li>
<li><strong>BOB: Authenticate ticket: </strong><br><a href=https://libra-auth.com/auth-ticket.html>https://libra-auth.com/auth-ticket.html</a></li>
</ol>
<ul>
<li><strong>test-1 <u>QR ticket's address was broken.</u> </strong><br><a href=https://libra-auth.com/test/buy-ticket-fake-1.html>https://libra-auth.com/test/buy-ticket-fake-1.html</a> 7th in the figure below, Alice's address length was different received the server.</li>
<li><strong>test-2 <u>QR ticket with changed to Fake address was used.</u> </strong><br><a href=https://libra-auth.com/test/buy-ticket-fake-2.html>https://libra-auth.com/test/buy-ticket-fake-2.html</a> 7th in the figure below, Alice's address is another client one.</li>
</ul>


<h2>Future</h2>
<p>
The Libra Auth method can be used not only for ticket sales authentication as in this demo but also for normal authentication tasks. Especially suitable for authentication tasks involving payments. It provides trust by the Libra blockchain ledger. However, each authentication work is fast because it is separated from the Libra Network.  
</p>
<p>
If you already have a Libra account, i.e. a private key or mnemonic, you can immediately authenticate with someone else's account without payment.
</p>
<p>
By the way, mnemonics are important. I did n’t make import mnemonic this time, But with that, if Alice loses the QR ticket, She can reissue a secure QR ticket from the same address from 1 to 7. BOB can invalidate old tickets by overwriting Alice's address DB.
</p>
<p>
In another case, Alice can pass resale information to Bob. If Bob allows it, Bob and Eve will be able to issue a new QR Tiket by executing 1-7 from the transaction that Eve sent the Libra to Alice.　Bob can also receive a resale fee. If you are strictly concerned about QR Ticket theft or unauthorized resale, there is a way to prove Alice at the entrance with the private key.
</p>

<img src=https://reien.top/img/toshirot/libra-auth.png> 

<h2>Flow</h2>

<section>
        <div>
                <ol>
                        <li>ALICE: Tap or Click [ Buy ] Button. And get address each other.<br>
                         And  Alice send "address" and "msg" to Bob by WebSocket.
e.g.<pre class=eg>
msg = CryptoJS.SHA3(msg+Math.random()).toString();
wss.send(addr, msg) </pre>
                 </li>
                        <li>ALICE: Transffer Some Libra to BOB</li>
                        <li>ALICE: get BOB's PublicKey from testnet transaction.</li>
                        <li>BOB:   get ALICE's PublicKey from testnet transaction and Check payment if necessary.</li>
                        <li>BOB:   Make the "sigB" by the "msg" and  Bob's Private Key.<br>
                                And upsert sigB, Alice address, Alice PublicKey to DB<br>
                                And send "sigB" to Alice by WebSocket. <br>
e.g.<pre class=eg>
sigB = BobPriKey.sign(msg).toHex();
upsert sigB and address to DB
wss.send(sigB) </pre>
                        </li>
                        <li>ALICE: Verify by Bob's Public Key the "sigB" and the "msg" those were received.<br>
                         Well, Bob's Public Key was getting from testnet. "sigB" was send from Bob. "msg" was made by Alice.<br>
e.g.<pre class=eg>{bool} BobPubKey.verify(msg, sigB)</pre>
                        </li>
                        <li>ALICE: if 6th is true then Make the "sigA" by the Alice's Private Key and the "sigB".<br>
                         And Show QR code that is made by "sigA" and Alis's Address<br>
e.g.<pre class=eg>
if(res6){
        sigA = AlicePriKey.sign(sigB)
        mkQR([sigB, Address])
} else {
        //goto 1
} </pre>
                        </li>
                        <li>BOB:  Bob is received "sigA" and Alis's Address.<br>
                         And find sigB from DB by Address, <br>
                         And Verify the "sigB" and "sigA" by Alice's Public Key. <br>
                         Well, Alice's Public Key was getting from testnet. "sigA" was scanned from Alice's smartphone. "sigB" was made by Bob.<br>
e.g.<pre class=eg>
find sigB from DB by Address
{bool}  AlicePubKey.verify(sigB, sigA) </pre>
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

<h2>Discription</h2>
<section>
        <div>
                <ul>
                        <li>ALICE: if the sixth verify is true, That means 
                        <ol>
                                <li>Bob's Public Key and signeture "sigB" and msg were valid.</li>
                                <li>Bob has the Private Key used in this Libra transaction.</li>
                                <li>Therefore, 5's Bob is the person Alice paid Libra in 2's transaction.</li>
                        </ol>
                        </li>
                        <li>BOB: if the 8th verify is true,That means 
                        <ol>
                                <li>Alice's Public Key and signeture "sigA" and signeture "sigB" were valid.</li>
                                <li>Alice has the Private Key used in 2's Libra transaction.</li>
                                <li>And this msg was recieved from Bob to Alice at 6. So 7's Allice is the same as 6.</li>
                                <li>Therefore, 7's Alice is the person who paid Libra to Bob in 2 transactions.</li>
                        </ol>   
                            <br>
                        </li>
                        <li>As a result, at 9, Alice is authenticated by Bob. Entry tickets or tokens with “sigA” are valid.</li>
                </ul>   
        </div>
</section>

<h2>Test implementation for Signature-verify-only</h2>
<section>
        <div>
                <strong>Node.js: </strong>Signature-only test without WebSocket and testnet communication between Alice and Bob.
                <pre><code  class="javascript">'use strict';

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
        // 5. BOB: Make the "sigB" by the msg hash and  Bob's Private Key.
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
                // Send "sigB" and msg to Alice by WebSocket
                // Omitted

        //==============================================
        // 6. ALICE: Verify by Bob's Public Key the signB and the msg that were received.
        //      
                const res6 = BobPubKey.verify(msg, sigB);
        
        //==============================================
        // 7. ALICE: if 6th is true then Make the "sigA" by the Alice's Private Key and the "sigB".
        //
        
                //----------------------------------------------
                // test for res6

                if(res6===true){
                        console.info('8. ALICE: OK. verify(msg, sigB) is true.');
                } else {
                        console.error('8. ALICE: Error. verify(msg, sigB) is false.');
                }
                
                //----------------------------------------------
                // if res6 is true then  Make the "sigA"
                
                let sigA; 
                if(res6){
                        sigA = AlicePriKey.sign(sigB)
                        //mkQR([sigB, Address])
                } else {
                        //goto 1
                }

        //==============================================
        // 8. BOB: Verify the "sigB" and "sigA" by Alice's Public Key.

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
<h2>Thanx main dependence for this Demo</h2>
<section>
        <div>
         <h4>for LIBRA</h4>
                <ul>
                        <li>perfectmak/libra-core https://github.com/perfectmak/libra-core</li>
                        <li>bandprotocol/libra-web https://github.com/bandprotocol/libra-web</li>
                        <li>kulapio/libra-core(kulap-libra) https://github.com/kulapio/libra-core </li>
                        <li>LibraVista https://www.libravista.com/</li>
                        <li>browserify/browserify https://github.com/browserify/browserify</li>
                </ul>
        </div>
        <div>
        <h4>for Crypto</h4>
                <ul>
                        <li>indutny/elliptic https://github.com/indutny/elliptic</li>
                        <li>phusion/node-sha3 https://github.com/phusion/node-sha3</li>
                        <li>brix/crypto-js https://github.com/brix/crypto-js</li>
                </ul>
        </div>
        <div>
         <h4>for DB</h4>
                <ul>
                        <li>mongoDB https://www.mongodb.com</li>
                        <li>Automattic/mongoose https://github.com/Automattic/mongoose</li>
                </ul>
        </div>
        <div>
         <h4>for WebSocket Server</h4>
                <ul>
                        <li>websockets/ws https://github.com/websockets/ws</li>
                </ul>
        </div>
        <div>
         <h4>for Proxy Server</h4>
                <ul>
                        <li>expressjs/express https://github.com/expressjs/express</li>
                </ul>
        </div>
         <div>
         <h4>for https Server</h4>
                <ul>
                        <li>nginx/nginx https://github.com/nginx/nginx</li>
                </ul>
        </div>
         <div>
         <h4>for Others</h4>
                <ul>
                        <li>davidshimjs/qrcodejs https://github.com/davidshimjs/qrcodejs</li>
                        <li>cozmo/jsQR https://github.com/cozmo/jsQR</li>
                        <li>scan QR Icon made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
                        <li>key Icon https://icon-rainbow.com/</li>
                        <li>my favorite drawing tool https://www.draw.io/</li>
                        <li>jquery https://jquery.com/</li>
                        <li>nvm-sh/nvm https://github.com/nvm-sh/nvm</li>
                        <li>npm https://github.com/npm</li>
                        <li>nodejs/node https://github.com/nodejs/node</li>
                        <li>Let’s Encrypt https://letsencrypt.org/</li>
                        <li>Oracle VM VirtualBox https://www.virtualbox.org/</li>
                        <li>Ubuntu 18.04.3 LTS https://ubuntu.com/download/server</li>
                </ul>
        </div>
          <div>
         <h4>other</h4>
                <ul>
                        <li>reien.top https://reien.top/</li>
                </ul>
        </div>
There are many others. Thank you, everyone!
</section>
</body>
</html>

