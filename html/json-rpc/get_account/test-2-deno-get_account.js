/*
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"get_account","params":["1668f6be25668c1a17cd8caf6b8d2f25"],"id":1}' https://testnet.libra.org/v1
これを JavaScript functionで書いてみます



*/
 
//=========================================================
// 実行
// アカウントアドレス "1668f6be25668c1a17cd8caf6b8d2f25" の情報を取得する
get_account("1668f6be25668c1a17cd8caf6b8d2f25"
, function(data){
    data=JSON.stringify(data, null, 4)
    //precode.innerHTML=data
    console.log(data)
})

//=========================================================
// get account
// アカウント情報取得
// @address{string} 
// @callback{function}
function get_account(address, callback){
    let method_name="get_account"
    let data={
        "jsonrpc":"2.0"
        ,"method":method_name
        ,"params":[address]
        ,"id":1
    }
    postToTestnet(data)
    .then(data => {
        if(callback)callback(data)
    });
}

//=========================================================
//テストネットへPOSTする
//
async function postToTestnet(data = {}) {
    let url = 'https://testnet.libra.org/v1'
    const response = await fetch(url, {
        method: 'POST',             //POSTで
        cache: 'no-cache',          //キャッシュしない
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return response.json();
}