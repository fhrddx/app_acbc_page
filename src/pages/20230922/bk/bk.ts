import '../../../static/css/bk.scss'
import { emBase, emUtility } from 'emglobaljs/dist/emGlobal'
import $ from 'jquery'
import dialog from '../../../static/dialog';
const artRuntime = require('art-template/lib/runtime');
declare const emconfig: any;
declare const window: any;

emBase.Ready(function () {
    $(".header-back").click(function(){
        window.history.go(-1);
    })
    window.linkToStock = function(code: string){
        window.location.href = "./stock.html?code=" + code
    }
    page.load();
})

var page = {
    params: {
        //行业板块0，概念板块1
        type: 0,
        //升序是0，倒序是1
        po: 1,
        //排序字段，f3是涨跌幅，f6是成交额
        fid: 'f3',
        //第几页
        pn: 1,
        //每页数量
        pz: 500,
        //是否正在加载中
        loading: true
    },
    load(){
        dialog.loading('正在加载中');
        this.registerTemplateFunction();
        let type = emUtility.getUrlParameter("type") || 0;
        this.params.type = type;
        $('.tab li:eq(' + type + ')').addClass('active').siblings().removeClass('active');
        if(type == '0'){
            this.loadHY(true, true);
        }else{
            this.loadGN(true, true);
        }
        this.bindEvent();
        setInterval(() => {
            if(!this.params.loading && this.isInWorkTime()){
                this.params.loading = true;
                if(this.params.type == '0'){
                    this.loadHY(true, false);
                }else{
                    this.loadGN(true, false);
                }
            }
        }, 1000 * 30)
    },
    async loadHY(isNewList: boolean, needToFixPosition: boolean) {
        const params  = this.params;
        let result: any = await emconfig.AsyncRequestJsonp.push72({
            url: "api/qt/clist/get",
            callbackparm: "cb",
            data: {
                "pn": params.pn,
                "pz": params.pz,
                "po": params.po,
                "fid": params.fid,
                "np": 1,
                "ut": "bd1d9ddb04089700cf9c27f6f7426281",
                "fs": "m:90+t:2",
                "fields": "f3,f6,f12,f13,f14",
                "tspan": "16953691"
            }
        });
        if(result?.data?.diff && result.data.diff.length > 0){
            let html = require("../bk/art/hy.art")({ list: result.data.diff });
            if(isNewList){
                $("#table").html(html);
            }else{
                $("#table").append(html);
            }
        }
        dialog.removeLoading();
        this.params.loading = false;
        if(needToFixPosition){
            this.fixPosition();
        }
    },
    async loadGN(isNewList: boolean, needToFixPosition: boolean) {
        const params  = this.params;
        let result: any = await emconfig.AsyncRequestJsonp.push99({
            url: "api/qt/clist/get",
            callbackparm: "cb",
            data: {
                "pn": params.pn,
                "pz": params.pz,
                "po": params.po,
                "fid": params.fid,
                "np": 1,
                "ut": "bd1d9ddb04089700cf9c27f6f7426281",
                "fltt": 2,
                "invt": 2,
                "fs": "m:90+t:3+f:!50",
                "fields": "f3,f6,f12,f13,f14",
                "tspan": "16953691"
            }
        });
        if(result?.data?.diff && result.data.diff.length > 0){
            let html = require("../bk/art/gn.art")({ list: result.data.diff });
            if(isNewList){
                $("#table").html(html);
            }else{
                $("#table").append(html);
            }
        }
        dialog.removeLoading();
        this.params.loading = false;
        if(needToFixPosition){
            this.fixPosition();
        }    
    },
    bindEvent(){
        let _this = this;
        $('.table-header div').click(function(){
            let st = $(this).attr('data-st');
            if(!st){
                return;
            }
            _this.params.fid = st;
            let sortTemp = $(this).find('span').attr('class');
            //点击了涨幅
            if(st == 'f3'){
                $('.table-header div:eq(2) span').attr('class', 'sort');
                if(sortTemp == 'desc'){
                    $('.table-header div:eq(1) span').attr('class', 'asc');
                    _this.params.po = 0;
                }else{
                    $('.table-header div:eq(1) span').attr('class', 'desc');
                    _this.params.po = 1;
                }
            }
            //点击了成交额
            else if(st == 'f6'){
                $('.table-header div:eq(1) span').attr('class', 'sort');
                if(sortTemp == 'desc'){
                    $('.table-header div:eq(2) span').attr('class', 'asc');
                    _this.params.po = 0;
                }else{
                    $('.table-header div:eq(2) span').attr('class', 'desc');
                    _this.params.po = 1;
                }
            }
            _this.params.pn = 1;
            _this.params.loading = true;
            dialog.loading('正在加载中');
            if(_this.params.type == 0){
                _this.loadHY(true, true);
            }else{
                _this.loadGN(true, true);
            }
        })
        $("ul.tab li").click(function(){
            if($(this).hasClass('active')){
                return;
            }
            $(this).addClass('active').siblings().removeClass('active');
            let type = $(this).attr('data-type');
            _this.params.type = type;
            _this.params.pn = 1;
            _this.params.loading = true;
            dialog.loading('正在加载中');
            if(type == '0'){
                _this.loadHY(true, true);
            }else{
                _this.loadGN(true, true);
            }
        })
    },
    registerTemplateFunction(){
        //颜色
        artRuntime['color'] = function (value: number) {
            return (value > 0 ? 'red' : value < 0 ? 'green' : '');
        };
        //数字格式
        artRuntime['numberFormat'] = function (value: number) {
            return (value > 0 ? '+' : '') + (value / 100).toFixed(2) + '%'
        };
        artRuntime['numberFormat2'] = function (value: number) {
            return (value > 0 ? '+' : '') + (value / 1).toFixed(2) + '%'
        };
        //成交量
        artRuntime['mountFormat'] = function (value: any) {
            if(isNaN(value)){
                return 0;
            }
            let abs = Math.abs(value);
            if(abs > 1e8){
                return (value / 1e8).toFixed(2) + '亿'
            }else if(abs > 1e4){
                return (value / 1e4).toFixed(2) + '万'
            }else{
                return (value / 1).toFixed(0)
            }
        };
    },
    //开盘时间
    isInWorkTime(){
        const current = new Date();
        const year = current.getFullYear();
        const month = current.getMonth() + 1;
        const day = current.getDate();
        const beginTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 9:15:00';
        const endTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 15:00:00';
        return (current >= new Date(beginTimeString) && current <= new Date(endTimeString));
    },
    fixPosition(){
        let scrollTop: any = ($(".stick-banner") as any).offset().top;
        let headerHeight: any = $(".header-banner").height();
        if(scrollTop > headerHeight){
            $("html, body").scrollTop(headerHeight);
        }
    }
}