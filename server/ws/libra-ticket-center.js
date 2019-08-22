//==============================================================================
// Libra Ticket Center Demo
/* libra-ticket-center.js

sudo pm2 start|restart|stop /pathTo/libra-ticket-center.js

*/

//-----------------------------------------------------------------------------
// import modules
const https = require('https');
const WsServer = require('ws').Server;
const fs = require("fs");

//-----------------------------------------------------------------------------
// data
const AddrBob='9291e14f5e7c1ce211ce9477154faddb0c308af2f6a10324f893e2e59a13ff80'
//unit of Libra
const LIBRA_UNIT=1000000
//The ticket price is 10 Libra
const TICKET_AMOUNT=10*LIBRA_UNIT//10*1000000 is 10 Libra


//-----------------------------------------------------------------------------
// WebSocket config
//
const port = 8888; //from client port 443 by nginx proxy upstream websocket 
const host='wss.libra-auth.com';
const pemPath='/etc/letsencrypt/live/'+host;
const options = {
    cert: fs.readFileSync(pemPath+'/fullchain.pem')
    ,key: fs.readFileSync(pemPath+'/privkey.pem')
};
const HB=JSON.stringify({type:'hb'})//heartbeat
//-----------------------------------------------------------------------------
// start WebSocket Server
let wss=conn(port)
console.log('start wss', host, port, new Date())
//-----------------------------------------------------------------------------
// conn WebSocket
// @param port {Number}
// @return wss {Object} WebSocket
function conn(port){
    let app = https.createServer(options, function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('libra auth!\n');
    }).listen(port);
    
    //WS server start
    let wss = new WsServer({server: app});
    //on connection
    wss.on('connection', function(socket, req) {

        const ip = req.headers['x-forwarded-for']||req.connection.remoteAddress;
        socket.client={
             id      : uuidv4()
            ,ip      : ip
            ,time    : new Date().getTime()
            ,pubkey  : null
            ,isAlive : true
        };
        
        //info
        console.log(
              port
            , host 
            ,'conned to '
            , (new Date)
            , ip
        );
        
        socket.on('message', function(msg) {
            onmsg(msg, socket)
        });
        socket.on('close', function() {
            console.log('closed: '
                , socket.readyState
                , (new Date)
                , ip
            );
            delClient(socket, 'at onclose');
        });
    })
    return wss;
}
//-----------------------------------------------------------------------------
// onmsg
// @param msg {String} received message
function onmsg(msg, socket){
    let data
    try {
        console.log(1, msg);
        data = JSON.parse(msg);
    } catch (e) {
        console.log('JSONparse err:', msg);
        return;
    }
    console.log(2, data);
    if(!data)return
    console.log(3, data);
    if(!data.type)return
    console.log(4, data);
    if(data.type === 'test'){
        //test


    } else if(data.type==='hb'){
        // Heartbeat response
        if(socket.readyState===socket.OPEN){
            console.log(5, 'hb', data);
            socket.send(HB);
        }
    } else {
        console.log(6, 'other', msg);
    }
    
}

//-----------------------------------------------------------------------------
// wssSend send to client
// @param wss {Object} WebSocket instance
// @param oj {Object} The object to send
function wssSend(wss, oj){
    if(!oj)return;// e.g. oj = {"type":"sigs","body":{"msg":"...", "sig":"..."} }
    if (wss.readyState===1) {
        if(oj.type==='sigs'){
            let data=JSON.stringify(oj);
            wss.send(data);
        }
    } else {
        delClient(socket, 'at wssSend');
    }
}
//-----------------------------------------------------------------------------
// delClient
// @param socket {Object} socket
function delClient(socket, at) {
    console.log('--to be del--: '
        , at
        , socket.readyState
        , socket.client.ip
    );
    //socket.client.isAlive=false
    socket.client=null
    socket.close()
    socket.terminate()
}
// -----------------------------------------------------------------------------
// uuidv4
//
function uuidv4() {
    // Thanx for
    // https://gist.github.com/jcxplorer/823878
    // https://web.archive.org/web/20150201084235/http://blog.snowfinch.net/post/3254029029/uuid-v4-js

    let uuid = '';
    let random;
    for (let i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += '-';
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    setTimeout(function() {
        uuid=random=null;
    }, 1000);
    return uuid;
}