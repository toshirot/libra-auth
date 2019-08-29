//=============================================================================
// import
// 
//-----------------------------------------------------------------------------
const mongoose = require('mongoose')
const modelLibraAuth = require('schma-libra-auth').modelLibraAuth 
console.log('modelLibraAuth', modelLibraAuth)

//=============================================================================
// run test
// 
//-----------------------------------------------------------------------------
test()

function test(){
    //1) Alice's Address
    let addr='a5dc291dd1c424287c723b73b1e368925e9c6385d9265daf5f53822299b05600'
    //5) Bob's Signature by the msg hash and Bob's Private Key.
    let sigB='8D973FD56C5A0E46E70C39CB3E77061904A1012B9FB70B83129C436126B7D46EE793FEF587823CD1037A7140DDC09A77572435FA48E8B93FAF558606EBEDCF03'

    setAddrSigB(modelLibraAuth, addr, sigB, function(){
        findByAddress(modelLibraAuth, addr, function(res){
            console.log(res)
            process.exit(0)
        })
        
    })
}

//=============================================================================
// functions
// 
//-----------------------------------------------------------------------------

    //------------------------------------------------------------
    // set upsert Address and SigB
    //
    function setAddrSigB(model, addr, sigB, callback){
        let item={ 
            "addr": addr
            ,"sigB": sigB
            ,"utaime":  (new Date()).getTime()
        };    
        upsertAddrSigB(model, item, callback)
    }

    //------------------------------------------------------------
    // Upsert Address and SigB
    //
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
                    console.log('err upsertAddrSigB:');
                    
                } else {
                    console.log('upsertAddrSigB', item);
                    // some thing do it
                    if(callback)callback()

                }
            }
        );
    }

    //------------------------------------------------------------
    // Fined by Address
    //
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

                /* docs[0] response
                    {
                    _id: 5d672772263f2c5735418c38,
                    addr: 'a5dc291dd1c424287c723b73b1e368925e9c6385d9265daf5f53822299b05600',
                    __v: 0,
                    sigB: '8D973FD56C5A0E46E70C39CB3E77061904A1012B9FB70B83129C436126B7D46EE793FEF587823CD1037A7140DDC09A77572435FA48E8B93FAF558606EBEDCF03'
                    }
                */
            });
    }