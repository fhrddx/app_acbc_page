import '../../../static/css/index.scss'
import $ from 'jquery'
import { emBase } from 'emglobaljs/dist/emGlobal'
declare const emconfig: any;
declare const window: any;
import dialog from '../../../static/dialog'

emBase.Ready(function () {
    index.init();
    index.bindEvent();
    window.linkToStock = function(code: string){
        window.location.href = "./stock.html?code=" + code
    }
    window.linkToBk =  function(code: string, name: string){
        window.location.href = "./stock.html?code=" + code
    }
})

class index {
    constructor() {
    }
    static loading: boolean = true
    static init()
    {
        dialog.loading('正在加载中');
        Promise.all([this.loadZS(), this.loadHY(), this.loadGN()]).then(function(){
            index.loading = false;
            setTimeout(() => {
                dialog.removeLoading();
            }, 200); 
        })
        setInterval(() => {
            if(!index.loading && index.isInWorkTime()){
                index.loading = true;
                Promise.all([this.loadZS(), this.loadHY(), this.loadGN()]).then(function(){
                    index.loading = false;
                })
            }
        }, 1000 * 10)
    }
    static bindEvent(){
        $(".header-back").click(function(){
            window.history.go(-1);
        })
    }
    //大盘指数
    static async loadZS() {
        let model = [
            { name: '上证指数', value: '--', rate: '--', color: '', code: '1.000001' },
            { name: '深证指数', value: '--', rate: '--', color: '', code: '0.399001' },
            { name: '创业板指', value: '--', rate: '--', color: '', code: '0.399006' },
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
        let html = require("../index/art/zs.art")({ data: model });
        let el: any = document.querySelector("#zhishu");
        el.innerHTML = html;
    }
    //行业板块
    static async loadHY() {
        let result: any = await emconfig.AsyncRequestJsonp.push72({
            url: "api/qt/clist/get",
            callbackparm: "cb",
            data: {
                "pn": 1,
                "pz": 6,
                "po": 1,
                "np": 1,
                "ut": "bd1d9ddb04089700cf9c27f6f7426281",
                "fid": "f3",
                "fs": "m:90+t:2",
                "fields": "f3,f12,f13,f14",
                "tspan": "16953691"
            }
        });
        let firstList: any[] = [];
        let secondList: any[] = [];
        if(result?.data?.diff && result.data.diff.length > 0){
            for(var i=0; i < result.data.diff.length; i++){
                let item = result.data.diff[i];
                let model = {
                    code: item.f12,
                    name: item.f14,
                    value: (item.f3 > 0 ? '+' : '') + (item.f3 / 100).toFixed(2) + '%',
                    color: item.f3 > 0 ? 'red' : item.f3 < 0 ? 'green' : '',
                    mkt: item.f13
                };
                if(i < 3){
                    firstList.push(model);
                }else{
                    secondList.push(model);
                }
            }
        }
        let html = require("../index/art/hy.art")({ firstList: firstList, secondList: secondList });
        let el: any = document.querySelector("#hangye");
        el.innerHTML = html;
    }
    //概念板块
    static async loadGN() {
        let result: any = await emconfig.AsyncRequestJsonp.push99({
            url: "api/qt/clist/get",
            callbackparm: "cb",
            data: {
                "pn": 1,
                "pz": 6,
                "po": 1,
                "np": 1,
                "ut": "bd1d9ddb04089700cf9c27f6f7426281",
                "fltt": 2,
                "invt": 2,
                "fid": "f3",
                "fs": "m:90+t:3+f:!50",
                "fields": "f3,f12,f13,f14",
                "tspan": "16953691"
            }
        });
        let firstList: any[] = [];
        let secondList: any[] = [];
        if(result?.data?.diff && result.data.diff.length > 0){
            for(var i=0; i < result.data.diff.length; i++){
                let item = result.data.diff[i];
                let model = {
                    code: item.f12,
                    name: item.f14,
                    value: (item.f3 > 0 ? '+' : '') + (item.f3 / 1).toFixed(2) + '%',
                    color: item.f3 > 0 ? 'red' : item.f3 < 0 ? 'green' : '',
                    mkt: item.f13
                };
                if(i < 3){
                    firstList.push(model);
                }else{
                    secondList.push(model);
                }
            }
        }
        let html = require("../index/art/hy.art")({ firstList: firstList, secondList: secondList });
        let el: any = document.querySelector("#gainian");
        el.innerHTML = html;
    }
    //开盘时间
    static isInWorkTime(){
        const current = new Date();
        const year = current.getFullYear();
        const month = current.getMonth() + 1;
        const day = current.getDate();
        const beginTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 9:15:00';
        const endTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 15:00:00';
        return (current >= new Date(beginTimeString) && current <= new Date(endTimeString));
    }
}