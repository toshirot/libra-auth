//==============================================================================
// Libra Ticket Center Demo
/* libra-ticket-center.js

pm2 start|restart|stop /pathTo/libra-ticket-center.js

*/
//=============================================================================
// import modules
// 
//-----------------------------------------------------------------------------
'use strict'

    const debug=false

    const EdDSA = require('elliptic').eddsa
    const ec = new EdDSA('ed25519')
    const { SHA3 } = require('sha3');
    const libracore =require('libra-core')
    const https = require('https')
    const WsServer = require('ws').Server
    const fs = require("fs")
    const modelLibraAuth = require('schma-libra-auth').modelLibraAuth //mongoDB

//=============================================================================
// data
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // BOB
    const BOB_ADDRESS_HEX='4fb5de5cf96588273ceab41ee1a807ea4efb0c6f8c08f10c2efc617175cea390'
    const BOB_PRI_KEY_HEX='16253458330e54b08e3d492d200776d8af2d0367bbca4ca59df88985175a6069';
    // Create key pair from secret
    const BobPriKey = ec.keyFromSecret(BOB_PRI_KEY_HEX, 'hex');// hex string, array or Buffer
    // const nemonic=["uncle", "grow", "purchase", "fury", "upper", "chalk", "venture", "evidence", "enrich", "margin", "gentle", "range", "seven", "route", "clip", "vehicle", "ticket", "lawn", "stuff", "hungry", "clap", "muffin", "choice", "such"]
    // Import public key
    const BOB_PUB_KEY_HEX = '6e6579f1f368f9a4ac6d20a11a7741ed44d1409a923fa9b213e0160d90aa0ecc';
    const BobPubKey = ec.keyFromPublic(BOB_PUB_KEY_HEX, 'hex');
    //------------------------------------------------------------
    // LIBRA
    const CLIENT = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
    //unit of Libra
    const LIBRA_UNIT=1000000
    //The ticket price is 10 Libra
    const TICKET_AMOUNT=10*LIBRA_UNIT//10*1000000 is 10 Libra

    //------------------------------------------------------------
    // WebSocket config
    //
    const port = 8888 //from client port
    const host='wss.libra-auth.com'
    const pemPath='/etc/myletsencrypt/live/'+host
    const options = {
        cert: fs.readFileSync(pemPath+'/fullchain.pem')
        ,key: fs.readFileSync(pemPath+'/privkey.pem')
    }
    const HB=JSON.stringify({type:'hb'})//heartbeat
 
    //------------------------------------------------------------
    // Errors
    //
    const ERR_000='000' //JSON.parse error. in onGetQRSigneture
    const ERR_001='001' //!data.addr error. in onGetQRSigneture
    const ERR_002='002' //!data.sigA error. in onGetQRSigneture
    const ERR_003='003' //data.addr.length!==64 error. in onGetQRSigneture
    const ERR_004='004' //data.sigA.length!==128 error. in onGetQRSigneture
    const ERR_005='005' //AlicePubKeyOj.verify is false error. in onGetQRSigneture

//=============================================================================
// main 
// 
//------------------------------------------------------------------------------

    // lets start
    main()

    function main() {

        //------------------------------------------------------------
        // start WebSocket Server
        let wss=conn(port)
        console.log('start wss', host, port, new Date())
    }


//=============================================================================
// WebSocket Operations
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // conn WebSocket
    // @param port {number}
    // @return wss {object} WebSocket
    function conn(port){
        let app = https.createServer(options, function (req, res) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            res.end('libra auth!\n')
        }).listen(port)
        
        //WS server start
        let wss = new WsServer({server: app})
        //on connection
        wss.on('connection', function(socket, req) {

            const ip = req.headers['x-forwarded-for']||req.connection.remoteAddress
            socket.client={
                id      : uuidv4()
                ,ip      : ip
                ,time    : new Date().getTime()
                ,pubkey  : null
                ,isAlive : true
            }
            
            //info
            console.log(
                port
                , host 
                ,'conned to '
                , (new Date)
                , ip
            )
            
            socket.on('message', function(msg) {
                console.log('on message')
                onmsg(msg, socket)
            })
            socket.on('close', function() {
                console.log('closed: '
                    , socket.readyState
                    , (new Date)
                    , ip
                )
                delClient(socket, 'at onclose')
            })
        })
        return wss
    }
    //------------------------------------------------------------
    // onmsg
    // @param msg {string} received json stringified message
    // @param socket {object} wss client socket
    function onmsg(msg, socket){

        //parse
        let received
        try {
            console.log(1, msg)
            received = JSON.parse(msg)
        } catch (e) {
            console.log('JSONparse err:', msg)
            return
        }

        //branch
        console.log('received', received)
        if(!received)return
        console.log('received.type', received.type)
        if(!received.type)return
        console.log(received.data)
        if(received.type === 'addr'){
            if(!received.data)return
            //address
            console.log(received.data)
            onReceivedAddress(received.data, socket)
        } else if(received.type === 'sig'){
            if(!received.data)return
            //signeture 
            onGetSigneture(received.data, socket)

        } else if(received.type === 'qr'){
            if(debug)console.log('onmsg type qr', received.data)
            if(!received.data)return
            //verify 
            onGetQRSigneture(received.data, socket)
        } else if(received.type==='hb'){
            // Heartbeat response
            wssSend(socket, 'hb')
        } else {
            return
        }
        
    }

    //------------------------------------------------------------
    // wssSend send to client
    // @param socket {object} wss client socket
    // @param type {object} type e.g. 'hb'|'addr'|'sig'
    // @param data {any} The object to send
    function wssSend(socket, type, data){
        if(socket.readyState!==1){
            delClient(socket, 'at wssSend')
        } else {
            if(type==='hb'){
                socket.send(HB)
            } else {
                socket.send(
                    JSON.stringify({
                        type: type,
                        data: data
                    })
                )
            }
        }
    }
    //------------------------------------------------------------
    // delClient
    // @param socket {object} wss client socket
    // @at {string} memo
    function delClient(socket, at) {
        console.log('--to be del--: '
            , at
            , socket.readyState
            , socket.client
        )
        //socket.client.isAlive=false
        socket.client=null
        socket.close()
        socket.terminate()
    }

//=============================================================================
// LIBRA operations
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // Event executed when an address is received from the client
    // @addreesAndMsg {object} libra addrees  //e.g. { addr:AliceAddressHex, msg: AliceMsgHash} 
    // @socket {object} wss client socket
    async function onReceivedAddress(addreesAndMsg, socket){

        //-------------------------------------------------
        // 5) mk sigB

        //get tx
        // In this demo, Alice generates a new address every time, 
        // so it is assumed that the sequence is 0. 
        // At the time of implementation, 
        // it is necessary to search for an appropriate tx.

        // need input check and error handling
        let addrees=addreesAndMsg.addr
        let msgHash=addreesAndMsg.msg
  
        if(debug)console.log('onReceivedAddress', typeof addrees, addrees)
        if(debug)console.log('onReceivedAddress msgHash', typeof msgHash, msgHash)

        let seq=0
        const transaction = await CLIENT.getAccountTransaction(addrees, seq, false)
        const publicKeyHex=buffer2hex(transaction.signedTransaction.publicKey)
        const AlicePubKeyOj = ec.keyFromPublic(publicKeyHex, 'hex')

        if(debug)console.log('onReceivedAddress alice publicKeyHex', typeof publicKeyHex, publicKeyHex)

        // set to Notes for each client
        socket.client.addrees=addrees
        socket.client.pubkey=publicKeyHex

        /*
        // mk Massage
        const salt = 'my sweet salt'
        const saltHash = (new SHA3(512)).update(salt).digest('hex')
        const random = saltHash + Math.random().toString()
        const msgHash = (new SHA3(512)).update(random).digest('hex')
        */

        // 5. BOB: sigB = BobPriKey.sign(msg)
        const sigB= BobPriKey.sign(msgHash).toHex();

        // 5. upsert sigB, Alice address, Alice PublicKey to DB
        setAddrSigBPubkey(modelLibraAuth, addrees, sigB, publicKeyHex)

        //-------------------------------------------------
        // 5) BOB: Send sigB to Alice by WebSocket. socket.send(sigB)

        wssSend(socket, 'sig', sigB)

    }
    //------------------------------------------------------------
    // Event executed when an QR sigA is received from the client
    // @data {object} {"addr":"...", "sigA":"..."}
    // @socket {object} wss client socket
    async function onGetQRSigneture(data, socket){
        let msg=''
        //parse
        try {
            data = JSON.parse(data)
        } catch (e) {
            console.log('JSONparse err:', data)
            msg=ERR_000
            sendErrorToclient(socket, msg)
            return
        }

        if(!data.addr){msg=ERR_001; sendErrorToclient(socket, msg); return }
        if(!data.sigA){msg=ERR_002; sendErrorToclient(socket, msg); return }
        if(data.addr.length!==64){msg=ERR_003; sendErrorToclient(socket, msg); return }
        if(data.sigA.length!==128){msg=ERR_004; sendErrorToclient(socket, msg); return }

        let seq=0
        // I Doit 2019-08-30
        // TODO
        // In this code, get the Alice's Public Key from testnet.
        // However, to speed up the process, we plan to register Alice's Public Key during the first DB insert.
        /* old code from testnet
        const transaction = await CLIENT.getAccountTransaction(data.addr, seq, false)
        let publicKeyHex=buffer2hex(transaction.signedTransaction.publicKey)
        let AlicePubKeyOj = ec.keyFromPublic(publicKeyHex, 'hex')
        let AlicePubKeyOj2 = ec.keyFromPublic(publicKeyHex, 'hex')
        if(debug){
            console.log('findByAddress publicKeyHex from testnet', publicKeyHex.length, publicKeyHex)
        }
        */
        findByAddress(modelLibraAuth, data.addr, function(res){
            
            const publicKeyHex=res.pubkey
            const AlicePubKeyOj = ec.keyFromPublic(publicKeyHex, 'hex')

            const sigB=res.sigB
            const sigA=data.sigA
            if(debug)console.log('findByAddress res.pubkey from DB', res.pubkey)
            if(debug)console.log('findByAddress res.sigB   from DB', res.sigB)
            if(debug)console.log('findByAddress data.sigA  from QR', data.sigA)
            if(debug)console.log('findByAddress data.addr  from QR', data.addr)

            const res9 = AlicePubKeyOj.verify(sigB, sigA)

            console.log('res9', res9)

            //-------------------------------------------------
            // 9) BOB: Send responce
            if(res9){
                wssSend(socket, 'res', 'OK')
            } else {
                msg=ERR_005
                sendErrorToclient(socket, msg);
            }
            
        })
    }
    //------------------------------------------------------------
    // send Error to client
    // @socket {object} wss client socket
    // @err {string} err code
    function sendErrorToclient(socket, err){
        wssSend(socket, 'res', 'NG:'+err)
    }
    //------------------------------------------------------------
    // buffer to hex
    // @array{uint8array} array
    // @return {string} hex
    function buffer2hex(array) {
        return Array.prototype.map.call(
          new Uint8Array(array), x => ('00' + x.toString(16)
        ).slice(-2)).join('')
    }

//=============================================================================
// DB  operations
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // set upsert Address and SigB and pubkey
    // @model {object} model
    // @addr {string} Alice's address
    // @sigB {string} Bob's address
    // @pubkey {string} Alice's pubkey
    // @callback {function} callback
    function setAddrSigBPubkey(model, addr, sigB, pubkey, callback){
        let item={ 
            "addr": addr
            ,"sigB": sigB
            ,"pubkey": pubkey
            ,"utaime":  (new Date()).getTime()
        };    
        upsertAddrSigB(model, item, callback)
    }

    //------------------------------------------------------------
    // Upsert Address and SigB
    // @model {object} model
    // @item {object} item
    // @callback {function} callback
    function upsertAddrSigB(model, item, callback) {
        if (typeof item !== 'object') return;
        model.updateOne(
            {
                addr: item.addr,
            },
            item,
            {upsert: true, useNewUrlParser: true},
            function(err) {
                if (err) {
                    //console.log('upsertAddrSigB: err');
                    
                } else {
                    //console.log('upsertAddrSigB', item);
                    // some thing do it
                    if(callback)callback()

                }
            }
        );
    }

    //------------------------------------------------------------
    // Fined by Address
    // @model {object} model
    // @addr {string} seach address
    // @callback {function} callback
    function findByAddress(model, addr, callback){

        model
            .find({
                addr: addr
            })
            .limit(1)
            .exec(function(err, docs) {
                
                if(docs[0]){
                    // 有る時 
                    if(callback)callback(docs[0])
                } else {
                    // 無い時 findAddress undefined err: null
                    if(callback)callback({
                         addr: addr
                        ,sigB: null
                    })
                }
            });
    }
//=============================================================================
// Util Functions
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // uuidv4
    //
    function uuidv4() {
        // Thanx for
        // https://gist.github.com/jcxplorer/823878
        // https://web.archive.org/web/20150201084235/http://blog.snowfinch.net/post/3254029029/uuid-v4-js

        let uuid = ''
        let random
        for (let i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0
            if (i == 8 || i == 12 || i == 16 || i == 20) {
                uuid += '-'
            }
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16)
        }
        return uuid
    }