//==============================================================================
// Libra Ticket Center Demo
/* libra-ticket-center.js

sudo pm2 start|restart|stop /pathTo/libra-ticket-center.js

*/
//=============================================================================
// import modules
// 
//-----------------------------------------------------------------------------
'use strict'

    const EdDSA = require('elliptic').eddsa
    const ec = new EdDSA('ed25519')
    const assert = require('assert')
    const libracore =require('libra-core')
    const https = require('https')
    const WsServer = require('ws').Server
    const fs = require("fs")

//=============================================================================
// data
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // for LIBRA
    const BOB_ADDRESS_HEX='b7c811fd8f488e9c41f03a2cc1671b3a65b4638806a2ad72c96109924bde8454'
    let ALICE_ADDRESS_HEX='5ddea88879129cf59fd59fa82c3096c52e377e1bb258fe70672c016580ae9b89'
    const CLIENT = new libracore.LibraClient({ network: libracore.LibraNetwork.Testnet });
    //unit of Libra
    const LIBRA_UNIT=1000000
    //The ticket price is 10 Libra
    const TICKET_AMOUNT=10*LIBRA_UNIT//10*1000000 is 10 Libra

    //------------------------------------------------------------
    // WebSocket config
    //
    const port = 8888 //from client port 443 by nginx proxy upstream websocket 
    const host='wss.libra-auth.com'
    const pemPath='/etc/myletsencrypt/live/'+host
    const options = {
        cert: fs.readFileSync(pemPath+'/fullchain.pem')
        ,key: fs.readFileSync(pemPath+'/privkey.pem')
    }
    const HB=JSON.stringify({type:'hb'})//heartbeat


    //test


//=============================================================================
// main 
// 
//------------------------------------------------------------------------------

    // lets start
    main ()

    function main (){

        

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
    // @param port {Number}
    // @return wss {Object} WebSocket
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
    // @param msg {String} received json stringified message
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
        if(!received)return
        if(!received.type)return
        if(received.type === 'addr'){
            if(!received.data)return
            //address
            onReceivedAddress(received.data)
        } else if(received.type === 'sig'){
            if(!received.data)return
            //signeture 
            onGetSigneture(received.data)
        } else if(received.type==='hb'){
            // Heartbeat response
            if(socket.readyState===socket.OPEN){
                console.log(5, 'hb', received)
                socket.send(HB)
            }
        } else {
            return
        }
        
    }

    //------------------------------------------------------------
    // wssSend send to client
    // @param wss {Object} WebSocket instance
    // @param oj {Object} The object to send
    function wssSend(wss, oj){
        if(!oj)return// e.g. oj = {"type":"sigs","body":{"msg":"...", "sig":"..."} }
        if (wss.readyState===1) {
            if(oj.type==='sigs'){
                let data=JSON.stringify(oj)
                wss.send(data)
            }
        } else {
            delClient(socket, 'at wssSend')
        }
    }
    //------------------------------------------------------------
    // delClient
    // @param socket {Object} socket
    function delClient(socket, at) {
        console.log('--to be del--: '
            , at
            , socket.readyState
            , socket.client.ip
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
    // @addrees {Number} libra addrees
    // @return sequence{Number} last sequence number
    function onReceivedAddress(addrees){
        let sequence=getLastSequence(addrees)

        return
        findLastTxBobAndAlic(sequence, ALICE_ADDRESS_HEX)
        let pubKey=getPubKey(addrees, sequence)
        //BOB_ADDRESS_HEX   
    }
    //------------------------------------------------------------
    // get accountState object
    // @addrees {Number} libra addrees
    // @return accountState{Objecr} accountState
    function getAccountStat(addrees){
        return CLIENT.getAccountState(addrees)
    }
    //------------------------------------------------------------
    // get balance 
    // @addrees {Number} libra addrees
    // @return accountState{Objecr} accountState
    function getBalance(accountState){
        return CLIENT.getAccountState(addrees)
    }
    //------------------------------------------------------------
    // 4) 最新のシークエンス番号を取得する
    // @addrees {Number} libra addrees
    // @return sequence{String} string of last sequence number
    function getLastSequence(addrees){
        const accountState = CLIENT.getAccountState(addrees)
        return accountState.sequenceNumber.toString()
    }
    //------------------------------------------------------------
    // 4) get transaction
    // @addrees {Number} libra addrees
    // @sequence{Number} sequence number
    // @fetch_events{Bool} fetch event? true|false 
    // @return {object} transaction
    function getTx(addrees, sequence, fetch_events){
        if(!fetch_events)fetch_events=false
        //get tx from testnet by libra-core
        return CLIENT.getAccountTransaction(addrees, sequence, fetch_events);
        /* return transaction object
            LibraSignedTransactionWithProof {
            signedTransaction: LibraSignedTransaction {
                transaction: LibraTransaction {
                program: [Object],
                gasContraint: [Object],
                expirationTime: [BigNumber],
                sendersAddress: [AccountAddress],
                sequenceNumber: [BigNumber]
                },
                publicKey: Uint8Array [Array],
                signature: Uint8Array [Array]
            },
            proof: {
                wrappers_: { '1': [Object], '2': [Object] },
                messageId_: undefined,
                arrayIndexOffset_: -1,
                array: [ [Array], [Array] ],
                pivot_: 1.7976931348623157e+308,
                convertedPrimitiveFields_: {}
            },
            events: undefined
            }
        */
    }
    //------------------------------------------------------------
    // 4) seach last transaction from bob and alice address
    // @sequence{Number} sequence number
    // @clientAddr {Number} client Address
    // @return {object} transaction
    function findLastTxBobAndAlic(sequence, clientAddr){
        let tx
        for(let i=sequence;i<=0;i--){
            tx=null; tx=getTx(alice, sequence, false)

            //chk alice bob balance これで特定してよいか
            console.log(getPubKey(transaction))
        }

        return tx
    }

    //------------------------------------------------------------
    // 4) pubKeyを取得する
    // @transaction {object} transaction
    // @return {String} pubKey 
    function getPubKey(transaction){
        return transaction.public_key
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