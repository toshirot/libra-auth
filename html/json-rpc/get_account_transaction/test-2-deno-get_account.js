
//=========================================================
// 実行
// 
// アカウントアドレス "3be5596596c8970b183d91dffd0a9bb3" 
// のトランザクション情報を取得する

get_account_transaction(
    {address:"3be5596596c8970b183d91dffd0a9bb3"}
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
// e.g. get_account_transaction({address:'3be5596596c8970b183d91dffd0a9bb3'}, function(data){})
function get_account_transaction(args, callback){
    if(!args)return
    if(!args.address)return
    let method_name="get_account_transaction"
    let address=args.address
    let sequence=args.sequence||0
    let events=args.include_events||true
    let data={
        "jsonrpc":"2.0"
        ,"method":method_name
        ,"params":[address, sequence, events]
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