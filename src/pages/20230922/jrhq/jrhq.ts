import '../../../static/css/jrhq.scss'
import { emBase } from 'emglobaljs/dist/emGlobal'
import $ from 'jquery'
declare const emconfig: any;
declare const window: any;

var loadingHq: boolean = true

emBase.Ready(function () {
    $(".header-back").click(function(){
        window.history.go(-1);
    })
    loadingHq = true;
    loadData();
    setInterval(() => {
        if(!loadingHq && isInWorkTime()){
            loadingHq = true;
            loadData();
        }
    }, 1000 * 5)
})

async function loadData(){
    let model = [
        { name: '上证指数', value: '--', rate: '--', color: '', code: '000001' },
        { name: '深证指数', value: '--', rate: '--', color: '', code: '399001' },
        { name: '创业板指', value: '--', rate: '--', color: '', code: '399006' },
    ];
    let parm = {
        "fltt": "2",
        "invt": "2",
        "fields": "f1,f2,f3,f4,f12,f13,f14,f124,f292",
        "secids": "1.000001,0.399001,0.399006",
        "ut": "f057cbcbce2a86e2866ab8877db1d059",
        "v": "08162412136964361"
    }
    let result: any = await emconfig.AsyncRequestJsonp.push2({
        url: "api/qt/ulist.np/get",
        callbackparm: "cb",
        data: parm
    });
    if(result?.data?.diff && result.data.diff.length > 0){
        for(var i = 0; i < result.data.diff.length; i++){
            let item = result.data.diff[i];
            let index = item.f12 == '000001' ? 0 : item.f12 == '399001' ? 1 : 2;
            model[index].value = (item.f2 / 1).toFixed(2);
            model[index].color = item.f4 > 0 ? 'red' : item.f4 < 0 ? 'green' : '';
            model[index].rate = (item.f4 > 0 ? '+' : '') + (item.f3 / 1).toFixed(2) + '%';
        }
    }
    let html = require("../jrhq/art/zs.art")({ data: model });
    let el: any = document.querySelector("#zhishu");
    el.innerHTML = html;
    loadingHq = false;
}

function isInWorkTime(){
    const current = new Date();
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const day = current.getDate();
    const beginTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 9:15:00';
    const endTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 15:00:00';
    return (current >= new Date(beginTimeString) && current <= new Date(endTimeString));
}