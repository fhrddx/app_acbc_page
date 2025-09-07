import '../../../static/css/stock.scss'
import { emBase, emUtility } from 'emglobaljs/dist/emGlobal'
import $ from 'jquery'
import kline from './kline';
const artRuntime = require('art-template/lib/runtime')
declare const emconfig: any;
declare const window: any;
declare const EmchartsMobileTime: any;
declare const EmchartsMobileK: any;

emBase.Ready(function () {
    $("#detail").on('click', '.header-back', function(){
        window.history.go(-1);
    })
    page.init();
})

var page = {
    state: {
        code: '90.BK0465',
        chartType: 'T1',
        loadingHq: true,
        loadingChart: true
    },
    init(){
        let code = emUtility.getUrlParameter("code") || '90.BK0465';
        this.state.code = code;
        this.registerTemplateFunction();
        this.loadData();
        this.drawChart();
        this.bindEvent();
        this.beginInterval();
    },
    async loadData(){
        let code = this.state.code;
        let result: any = await emconfig.AsyncRequestJsonp.push2({
            url: "api/qt/stock/get",
            callbackparm: "cb",
            data: {
                secid: code,
                ut: "f057cbcbce2a86e2866ab8877db1d059",
                fields: 'f19,f20,f23,f24,f25,f26,f27,f28,f29,f30,f43,f44,f45,f46,f47,f48,f49,f50,f57,f58,f59,f60,f113,f114,f115,f116,f117,f127,f130,f131,f132,f133,f135,f136,f137,f138,f139,f140,f141,f142,f143,f144,f145,f146,f147,f148,f149,f152,f161,f162,f164,f165,f167,f168,f169,f170,f171,f174,f175,f177,f178,f198,f199,f530,f531',
                invt: 2
            }
        });
        let html = require("../stock/art/bk.art")({ data: result.data });
        let el: any = document.querySelector("#detail");
        el.innerHTML = html;
        this.state.loadingHq = false;
    },
    beginInterval(){
        let i = 0;
        setInterval(() => {
            i++;
            let isWorkTime: boolean = this.isInWorkTime();
            if(!this.state.loadingHq && isWorkTime){
                this.state.loadingHq = true;
                this.loadData();
            }
            if((!this.state.loadingChart && (i % 3) == 0) && isWorkTime){
                this.state.loadingChart = true;
                this.drawChart();
            }
        }, 1000 * 10)
    },
    /*
    分时图：T1 | 五日：T5
    日K：DK | 周K：WK | 月K：MK | 5分钟、15分钟、30分钟、60分钟 分别对应 M5K、M15K、M30K、M60K
    */
    drawChart(){
        /*
        let type = this.state.chartType;
        let containerId = 'timechart';
        let marketCode = this.state.code;
        let container: any = document.getElementById(containerId);
        let containerWidth = container.clientWidth;
        let containerHeight = container.clientHeight;
        if(type == "T1" || type == "T5"){
            if(!$("#" + containerId).hasClass("marginTop")){
                $("#" + containerId).addClass("marginTop");
            }  
            //分时图
            var chart = new EmchartsMobileTime({
                container: containerId,
                code: marketCode,
                width: containerWidth,
                height: containerHeight,
                dpr: 2,
                showVMax: true,
                type: type
            });
            chart.draw();
        }else{
            if($("#" + containerId).hasClass("marginTop")){
                $("#" + containerId).removeClass("marginTop");
            } 
            //K线图
            var chartK = new EmchartsMobileK({
                container: containerId,
                code: marketCode,
                width: containerWidth,
                height: containerHeight,
                dpr: 2,
                showVMark: true,
                type: type
            });
            chartK.draw();
        }
        */
        this.state.loadingChart = false;

        const klineChart = new kline({
          code: '90.BK1015',
          container: document.getElementById('timechart')
        });

        klineChart.draw();
    },
    registerTemplateFunction(){
        //颜色
        artRuntime['color'] = function (value: any) {
            if(isNaN(value) || value == null || value == ''){
                return '';
            }
            return (value > 0 ? 'red' : value < 0 ? 'green' : '');
        };
        //数字格式
        artRuntime['numberFormat'] = function (value: any, divider: number, tofixed: number) {
            if(isNaN(value)){
                return '-';
            }
            return (value / divider).toFixed(tofixed);
        };
        //成交量
        artRuntime['mountFormat'] = function (value: any) {
            if(isNaN(value)){
                return '-';
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
    bindEvent(){
        let _this = this;
        $("ul.tab > li:not(:last-child)").click(function(){
            $(".drop").hide();
            if($(this).hasClass('active')){
                return;
            }
            $(this).addClass('active').siblings().removeClass('active');
            $("ul.tab li:last-child span").text('更多');
            $(".drop li").removeClass("active");
            let type = $(this).attr('data-type');
            _this.state.chartType = type;
            _this.state.loadingChart = true;
            _this.drawChart();
        })
        $("ul.tab > li:last-child").click(function(){
            if($(".drop").is(":visible")){
                $(".drop").hide();
            }else{
                $(".drop").show();
            }
        })
        $(".drop li").click(function(){
            if($(this).hasClass("active")){
                $(".drop").hide();
                return;
            }
            $(this).addClass("active").siblings().removeClass("active");
            $("ul.tab li").removeClass("active");
            let text = $.trim($(this).text()) ;
            $("ul.tab li:last-child span").text(text);
            $("ul.tab li:last-child").addClass('active');
            $(".drop").hide();
            let type = $(this).attr('data-type');
            _this.state.chartType = type;
            _this.state.loadingChart = true;
            _this.drawChart();
        })
    },
    isInWorkTime(){
        const current = new Date();
        const year = current.getFullYear();
        const month = current.getMonth() + 1;
        const day = current.getDate();
        const beginTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 9:15:00';
        const endTimeString = year + '/' + (month < 10 ? '0' : '') + month + '/' + (day < 10 ? '0' : '') + day + ' 15:00:00';
        return (current >= new Date(beginTimeString) && current <= new Date(endTimeString));
    }
}