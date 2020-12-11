//Node.jsならnode-fetchなどを読み込む
const fetch = require('node-fetch');

//=========================================================
// 実行
// アカウントアドレス "3be5596596c8970b183d91dffd0a9bb3" 
// のトランザクション情報(複数)を取得する
get_account_transactions(
    {
        address:"3be5596596c8970b183d91dffd0a9bb3"
        ,start:0
        ,limit:100
        ,include_events:false
    }
    ,function(data){
        console.log(
            JSON.stringify(data, null, 4)
        )
    }
)

//=========================================================
// get account
// アカウント情報取得
// @args{object} 
// @callback{function}
// e.g. get_account_transactions({address:'3be5596596c8970b183d91dffd0a9bb3'}, function(data){})
function get_account_transactions(args, callback){
    if(!args)return
    if(!args.address)return
    let method_name="get_account_transactions"
    let address=args.address
    let start=args.start||0
    let limit=args.limit||10
    let events=args.include_events||true
    let data={
        "jsonrpc":"2.0"
        ,"method":method_name
        ,"params":[address, start, limit, events]
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