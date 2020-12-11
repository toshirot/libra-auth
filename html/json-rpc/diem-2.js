const diem=require(__dirname+'/diem2.js');
//import { cube, foo, graph } from  './diem.js';

 
console.log(typeof diem.get_account_transactions ); //  

//=========================================================
// 実行
// アカウントアドレス "3be5596596c8970b183d91dffd0a9bb3" 
// のトランザクション情報(複数)を取得する
diem.get_account_transactions(
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
 