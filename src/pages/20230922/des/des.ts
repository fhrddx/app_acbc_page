import '../../../static/css/des.scss'
import { emBase } from 'emglobaljs/dist/emGlobal'
import $ from 'jquery'

emBase.Ready(function () {
    $(".header-back").click(function(){
        window.history.go(-1);
    })
})