/**
 * build配置
 * 格式保持不变，自动适配系统升级
 */
var embuildconfig = {
    //JS第三方模块抽离值(包含CSS和JS) OK
    ThirdJSPartValue: 2,
    //JS第三方模块抽离大小，单位字节(包含CSS和JS) OK
    ThirdJSPartSize: 10,
    //JS第三方模块抽文件名 OK
    ThirdJSPartFileName: "vendor",
    //JS公用方模块抽离值(包含CSS和JS) OK
    CommonJSPartValue: 2,
    //JS公用方模块抽离大小，单位字节(包含CSS和JS) OK
    CommonJSPartSize: 10,
    //JS公用方模块抽文件名 OK
    CommonJSPartFileName: "common",
    //拷贝目录(相对跟目录){from: "src/static/app",to: "dist/app"}  OK
    CopyDir: [
        { from: "src/static/service-worker.js", to: "dist" },
        { from: "src/static/service-worker.txt", to: "dist" }
    ],
    //DEV启动路径 OK
    DevStartPath: "emh5page",
    //DEV启动文件 OK
    DevStartFile: "001/nav.html",
    //DEV启动端口 默认8088 OK
    DevStartPort: 10092,
    //DEV打包目录（相对pages目录）OK
    DevPackBlocks: [],
    //Build打包目录（相对pages目录）OK
    LinePackBlocks: [],
    //打包输出目录 （相对跟目录，默认dist）OK
    BuildPackTo: "dist",
    //编译目录(相对node_modules) OK
    Compile: [/emf/, /qrcode/, /src/, /dom7|swiper|ssr-window/],
    //是否生成落地包配置 OK
    IsLoaclPack: true,
    //是否启用vconsole调试（老Android此组件报错，可以设置false关闭此组件）
    EnableVConsole: true,
    //图片相对路径前缀
    ImagePathPrefix: "../../../../",
    //HTML页面目录剔除（会把html页面直接打包在跟目录下，单页面可以使用，多页面要保持所有页面名称不能相同,修改此参数请修改启动目录和导航页面地址）
    RemoveHtmlFilePath: false,
    //入口JS文件类型 JS或TS
    InterFileType: "TS",
    //ServiceWorker配置 22-08-17 OK
    ServiceWorker: {
        //本地开发环境启用ServiceWorker，会自动启用localhost主机（ServiceWorker必须https或者http下的loaclhost调式）
        EnableForDev: false,
        //正式环境，启用ServiceWorker缓存机制，当前只缓存static下静态文件
        EnableForOnline: false,
    }
}
module.exports = embuildconfig
