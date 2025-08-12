import '../../../static/css/juxing.scss'
import { emBase } from 'emglobaljs/dist/emGlobal'
import { StatusHeight } from 'emglobaljs/dist/emRuntime'
import $ from 'jquery'

emBase.Ready(function () {
    $(".header-back").click(function(){
        window.history.go(-1);
    })
    page.init()
})

var page = {
    state: {
       isEditing: false,
       boxs: []
    },
    init(){
        let _this = this

        $('.button').click(function(){
            _this.state.isEditing = true
            document.body.style.cursor = 'crosshair';
        })

        let container = document.getElementById('panel');

        container?.addEventListener('mousedown', function(e){
            if(!_this.state.isEditing){
                return
            }
            let id = 'area' + (new Date().getTime());
            _this.state.boxs.push({
                id: id,
                x: e.offsetX,
                y: e.offsetY,
                fix: false
            });
            let zIndex = _this.state.boxs.length + 100;
            let box = `<div id=${id} class="box" style="position:absolute;top:${e.offsetY}px;left:${e.offsetX}px;width:0;height:0;z-index:${zIndex}"></div>`
            $('#panel').append(box)
        })

        container?.addEventListener('mousemove', function(e){
            if(!_this.state.isEditing){
                return
            }
            let boxLength = _this.state.boxs.length;
            if(boxLength == 0){
                return
            }
            let currentBox = _this.state.boxs[boxLength - 1];
            if(currentBox.fix){
                return
            }
            let id = currentBox.id

            let width = e.offsetX - currentBox.x;
            $('#' + id).css('width', width)
          
            let height = e.offsetY - currentBox.y
            $('#' + id).css('height', height)
        })

        container?.addEventListener('mouseup', function(e){
            $('.box').html('')
            if(!_this.state.isEditing){
                return
            }
            _this.state.isEditing = false
            _this.state.boxs[_this.state.boxs.length - 1].fix = true
            document.body.style.cursor = 'pointer';
            _this.bindDragEvent(_this.state.boxs[_this.state.boxs.length - 1].id)
        })
    },
    bindDragEvent(id: string){
        var panel: any = document.getElementById('panel');
        var marginTop = panel.offsetTop

        var drag: any = document.getElementById(id);
        // 点击某物体时，用drag对象即可，move和up是全局区域，
        // 也就是整个文档通用，应该使用document对象而不是drag对象(否则，采用drag对象时物体只能往右方或下方移动)  
        drag.onmousedown = function(event: any){
            var event = event || window.event;  //兼容IE浏览器
            //鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
            var diffX = event.clientX - drag.offsetLeft;
            var diffY = event.clientY - drag.offsetTop;

            var oldWidth = drag.offsetWidth;
            var oldLeft = drag.offsetLeft;
            var oldClientX = event.clientX
            var oldHeight = drag.offsetHeight
            var oldClientY = event.clientY
            var oldTop = drag.offsetTop

            var isMove = false
            if(typeof drag.setCapture !== 'undefined'){
                drag.setCapture(); 
            }
            document.onmousemove = function(event){
                isMove = true
                var event = event || window.event;
                var moveX = event.clientX - diffX;
                var moveY = event.clientY - diffY;
                if(moveX < 0){
                    moveX = 0
                }else if(moveX > window.innerWidth - drag.offsetWidth){
                    moveX = window.innerWidth - drag.offsetWidth
                }
                if(moveY < 0){
                    moveY = 0
                }else if(moveY > window.innerHeight - drag.offsetHeight){
                    moveY =  window.innerHeight - drag.offsetHeight
                }
                let dragLeft = diffX < 30;
                let dragRight = oldLeft + oldWidth - oldClientX < 30
                let dragTop = diffY - marginTop < 30
                let dragBottom = oldTop + oldHeight + marginTop - oldClientY < 30
                //拖动左边框的情况
                if(dragLeft){
                    drag.style.left = moveX + 'px';
                    drag.style.width = oldWidth + (oldClientX - event.clientX) + 'px';
                    if(dragTop){
                        drag.style.top = moveY + 'px';
                        drag.style.height = oldHeight + (oldClientY - event.clientY) + 'px';
                    }else if(dragBottom){
                        drag.style.height = oldHeight + (event.clientY -oldClientY) + 'px';
                    }
                    return
                }
                //拖动右边的情况
                if(dragRight){
                    drag.style.width = oldWidth + (event.clientX -oldClientX) + 'px';
                    if(dragTop){
                        drag.style.top = moveY + 'px';
                        drag.style.height = oldHeight + (oldClientY - event.clientY) + 'px';
                    }else if(dragBottom){
                        drag.style.height = oldHeight + (event.clientY -oldClientY) + 'px';
                    }
                    return
                }
                //拖动上边框
                if(dragTop){
                    drag.style.top = moveY + 'px';
                    drag.style.height = oldHeight + (oldClientY - event.clientY) + 'px';
                    return
                }
                //拖动下边框
                if(dragBottom){
                    drag.style.height = oldHeight + (event.clientY -oldClientY) + 'px';
                    return
                }
                //其他情况
                drag.style.left = moveX + 'px';
                drag.style.top = moveY + 'px'
            }
            document.onmouseup = function(e){

                //e.stopPropagation();

                this.onmousemove = null;
                this.onmouseup = null;
                //修复低版本ie bug  
                if(typeof drag.releaseCapture!='undefined'){  
                    drag.releaseCapture();  
                }
                //oldClientX = e.clientX
                if(!isMove){
                   //console.log('纯click事件');
                    const element = drag;
                    const rect = element.getBoundingClientRect();
                    const elemLeft = rect.left;
                    const elemTop = rect.top;

                    let top = `<div class='top-border'><span class='circle'></span></div>`
                    $('#'+id).append(top)
                    let bottom = `<div class='bottom-border'><span class='circle'></span></div>`
                    $('#'+id).append(bottom)
                    let left = `<div class='left-border'><span class='circle top'></span><span class='circle middle'></span><span class='circle bottom'></span></div>`
                    $('#'+id).append(left)
                    let right = `<div class='right-border'><span class='circle top'></span><span class='circle middle'></span><span class='circle bottom'></span></div>`
                    $('#'+id).append(right)
                }
                isMove = false
            }
        }
    }
}