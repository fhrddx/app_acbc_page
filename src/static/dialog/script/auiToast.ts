
var auiToast: any = function () {
};

auiToast.prototype = {
    create: function (params: any, callback: any) {
        var self = this;
        var toastHtml = '';
        var iconHtml = '';
        switch (params.type) {
            case "success":
                iconHtml = '<i class="aui-iconfont aui-icon-correct"></i>';
                break;
            case "fail":
                iconHtml = '<i class="aui-iconfont aui-icon-close"></i>';
                break;
            case "custom":
                iconHtml = (params.html) as string;
                break;
            case "loading":
                iconHtml = '<div class="aui-toast-loading"></div>';
                break;
        }
        var titleHtml = params.title ? '<div class="aui-toast-content">' + params.title + '</div>' : '';
        toastHtml = '<div class="aui-toast">' + iconHtml + titleHtml + '</div>';
        if (document.querySelector(".aui-toast")) return;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
        var duration = params.duration ? params.duration : "2000";
        self.show();
        if (params.type == 'loading') {
            if (callback) {
                callback({
                    status: "success"
                });
            };
        } else {
            setTimeout(function () {
                self.hide();
            }, duration)
        }
    },
    show: function () {
        var toastDiv: any = document.querySelector(".aui-toast");
        if(toastDiv){
            toastDiv.style.display = "block";
            toastDiv.style.marginTop = "-" + Math.round(toastDiv.offsetHeight / 2) + "px";
        }
    },
    hide: function () {
        var toastDiv: any = document.querySelector(".aui-toast");
        if (toastDiv) {
            toastDiv.parentNode.removeChild(toastDiv);
        }
    },
    remove: function () {
        var maskDiv: any = document.querySelector(".aui-mask");
        var toastDiv: any = document.querySelector(".aui-toast");
        if(toastDiv){
            toastDiv.parentNode.removeChild(toastDiv);
        }
        if(maskDiv){
            maskDiv.classList.remove("aui-mask-in");
            maskDiv.classList.add("aui-mask-out");
        }
        return true;
    },
    success: function (params: any, callback: any) {
        var self = this;
        params.type = "success";
        return self.create(params, callback);
    },
    fail: function (params: any, callback: any) {
        var self = this;
        params.type = "fail";
        return self.create(params, callback);
    },
    custom: function (params: any, callback: any) {
        var self = this;
        params.type = "custom";
        return self.create(params, callback);
    },
    loading: function (params: any, callback: any) {
        var self = this;
        params.type = "loading";
        return self.create(params, callback);
    }
};

export default auiToast;