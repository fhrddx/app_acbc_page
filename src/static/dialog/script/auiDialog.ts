import '../css/aui.css'

var auiDialog: any = function() {};

auiDialog.prototype = {
    params: {
        title: '',
        msg: '',
        buttons: ['取消','确定'],
        input: false
    },
    create: function(params: any, callback: any) {
        //如果目前界面上已经存在活跃的对话框，禁止再创建新的对话框
        var existActiveDialog = (document.querySelectorAll(".aui-dialog-in").length > 0);
        if(existActiveDialog){
            return;
        }
        var self = this;
        var dialogHtml = '';
        var buttonsHtml = '';
        var headerHtml = params.title ? '<div class="aui-dialog-header">' + params.title + '</div>' : '<div class="aui-dialog-header">' + self.params.title + '</div>';
        if(params.input){
            params.text = params.text ? params.text : '';
            var msgHtml = '<div class="aui-dialog-body"><input type="text" placeholder="' + params.text + '"></div>';
        }else{
            var msgHtml = params.msg ? '<div class="aui-dialog-body">' + params.msg + '</div>' : '<div class="aui-dialog-body">' + self.params.msg + '</div>';
        }
        var buttons = params.buttons ? params.buttons : self.params.buttons;
        if (buttons && buttons.length > 0) {
            for (var i = 0; i < buttons.length; i++) {
                buttonsHtml += '<div class="aui-dialog-btn" tapmode button-index="' + i + '">' + buttons[i] + '</div>';
            }
        }
        var footerHtml = '<div class="aui-dialog-footer">' + buttonsHtml + '</div>';
        dialogHtml = '<div class="aui-dialog">' + headerHtml + msgHtml + footerHtml + '</div>';
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
        var dialogButtons: any = document.querySelectorAll(".aui-dialog-btn");
        if(dialogButtons && dialogButtons.length > 0){
            for(var ii = 0; ii < dialogButtons.length; ii++){
                (dialogButtons[ii]).onclick = function(){
                    if(callback){
                        if(params.input){
                            callback({
                                buttonIndex: parseInt(this.getAttribute("button-index")) + 1,
                                text: (document.querySelector("input")?.value) || ''
                            });
                        }else{
                            callback({
                                buttonIndex: parseInt(this.getAttribute("button-index")) + 1
                            });
                        }
                    };
                    self.close();
                    return;
                }
            }
        }
        self.open();
    },
    open: function(){
        var dialogDiv: any = document.querySelector(".aui-dialog");
        var maskDiv: any = document.querySelector(".aui-mask");
        if(!dialogDiv){
            return;
        }
        dialogDiv.style.marginTop =  "-" + Math.round(dialogDiv.offsetHeight / 2) + "px";
        if(!maskDiv){
            var maskHtml = '<div class="aui-mask"></div>';
            document.body.insertAdjacentHTML('beforeend', maskHtml);
            maskDiv = document.querySelector(".aui-mask");
        }else{
            maskDiv.classList.remove("aui-mask-out");
        }
        setTimeout(function(){
            maskDiv.classList.add("aui-mask-in");
            dialogDiv.classList.add("aui-dialog-in");
        }, 10);
        if(maskDiv){
            maskDiv.addEventListener("touchmove", function(e: any){
                e.preventDefault();
            });
        }
        dialogDiv.addEventListener("touchmove", function(e: any){
            e.preventDefault();
        })
        return;
    },
    close: function(){
        var self = this;
        var dialogDiv: any = document.querySelector(".aui-dialog");
        var maskDiv: any = document.querySelector(".aui-mask");
        if(maskDiv){
            maskDiv.classList.remove("aui-mask-in");
        }
        if(dialogDiv){
            dialogDiv.classList.remove("aui-dialog-in");
            dialogDiv.classList.remove("aui-dialog-out");
        }
        if (document.querySelector(".aui-dialog:not(.aui-dialog-out)")) {
            setTimeout(function(){
                if(dialogDiv){
                    dialogDiv.parentNode.removeChild(dialogDiv);
                }
                self.open();
                return true;
            }, 200)
        }else{
            maskDiv.classList.add("aui-mask-out");
            dialogDiv.addEventListener("webkitTransitionEnd", function(){
                self.remove();
            })
            dialogDiv.addEventListener("transitionend", function(){
                self.remove();
            })
        }
    },
    remove: function(){
        var dialogDiv: any = document.querySelector(".aui-dialog");
        if(dialogDiv){
            dialogDiv.parentNode.removeChild(dialogDiv);
        }
        var maskDiv = document.querySelector(".aui-mask");
        if(maskDiv){
            maskDiv.classList.remove("aui-mask-out");
        }
        return true;
    },
    alert: function(params: any,callback: any){
        var self = this;
        return self.create(params,callback);
    },
    prompt: function(params: any,callback: any){
        var self = this;
        params.input = true;
        return self.create(params,callback);
    }
};

export default auiDialog;