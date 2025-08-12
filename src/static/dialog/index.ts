import auiDialog  from "./script/auiDialog";
import auiToast from "./script/auiToast";

let dialog = {
    myDialog: new auiDialog({}),
    myTost: new auiToast({}),
    alert(content: string){
        this.myDialog.alert({
            title: "提示",
            msg: content,
            buttons: ['确定']
        });
    },
    message(title: string, content: string){
        this.myDialog.alert({
            title: title,
            msg: content,
            buttons: ['确定']
        });
    },
    success(title: string){
        this.myTost.success({
            title: title,
            duration: 2000
        });
    },
    error(title: string){
        this.myTost.fail({
            title: title,
            duration: 4000
        });
    },
    confirm(title: string, content: string, callback: any){
        title = title || "提示";
        this.myDialog.alert({
            title: title,
            msg: content,
            buttons: ['取消','确定']
        },function(ret: any){
            if(ret){
                var index = ret.buttonIndex;
                if(index == 2 && callback && ("function" == typeof callback)){
                    callback();
                }
            }
        })
    },
    callback(title: string, content: string, callback: any){
        title = title || "提示";
        this.myDialog.alert({
            title: title,
            msg: content,
            buttons: ['确定']
        },function(){
            if(callback && ("function" == typeof callback)){
                callback();
            }
        })
    },
    loading(title: string){
        var maskDiv: any = document.querySelector(".aui-mask");
        if(!maskDiv){
            var maskHtml = '<div class="aui-mask aui-mask-in"></div>';
            document.body.insertAdjacentHTML('beforeend', maskHtml);
            maskDiv = document.querySelector(".aui-mask");
        }else{
            maskDiv.classList.remove("aui-mask-out");
            maskDiv.classList.add("aui-mask-in");
        }
        maskDiv.addEventListener("touchmove", function(e: any){
            e.preventDefault();
        });
        this.myTost.loading({
            title: title
        });
    },
    removeLoading(){
        this.myTost.remove();
    }
};

export default dialog;