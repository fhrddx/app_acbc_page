/**
 * 跟CLI更新，请勿擅自修改！！
 * Beisea：2022-02-22
 */
const path = require('path');
const {
    env
} = require("process");
const pagepath = path.resolve(__dirname, './src/pages/');
//引入生成配置
const buildconfig = require("./config/buildconfig");
//引入业务代码配置
const runconfig = require("./config/runconfig");
//webpack模块
const webpack = require("webpack");
//HTML插件模块
const HtmlWebpackPlugin = require('html-webpack-plugin');
//打包清理插件模块(新webpack已经自动清理，忽略此插件)
//let TerserPlugin = require('terser-webpack-plugin');
//调试插件模块
const VConsolePlugin = require('vconsole-webpack-plugin');
//拷贝插件模块
const CopyPlugin = require('copy-webpack-plugin');
//样式插件模块
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
//样式优化插件模块
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ConcatSource = require('webpack-sources').ConcatSource;
let isBuild = env.npm_lifecycle_event.toLocaleLowerCase().indexOf("build") >= 0 ? true : false;
let bt = new Date();
let build = {
    BaseEnterFile: [],
    /**
     * 获取JS文件入口
     * @returns {}
     */
    GetEnterJS: function () {
        let result = {};
        if (!this.BaseEnterFile || this.BaseEnterFile.length <= 0) {
            if (isBuild && buildconfig.LinePackBlocks && buildconfig.LinePackBlocks.length > 0) {
                for (let i = 0; i < buildconfig.LinePackBlocks.length; i++) {
                    this.BaseEnterFile = [
                        ...this.BaseEnterFile,
                        ...this.FindFileByPath(`${pagepath}\\${buildconfig.LinePackBlocks[i]}`, ".html")
                    ]
                }
            } else if (!isBuild && buildconfig.DevPackBlocks && buildconfig.DevPackBlocks.length > 0) {
                for (let i = 0; i < buildconfig.DevPackBlocks.length; i++) {
                    this.BaseEnterFile = [
                        ...this.BaseEnterFile,
                        ...this.FindFileByPath(`${pagepath}\\${buildconfig.DevPackBlocks[i]}`, ".html")
                    ]
                }
            } else {
                this.BaseEnterFile = this.FindFileByPath(pagepath, ".html")
            }
        }
        if (this.BaseEnterFile && this.BaseEnterFile.length > 0) {
            for (let i = 0; i < this.BaseEnterFile.length; i++) {
                let temp = this.BaseEnterFile[i].replace(".html", "")
                let arry = temp.split("\\");
                let key = `${arry[arry.length - 3]}\\${arry[arry.length - 2]}\\${arry[arry.length - 1]}`
                if (buildconfig.RemoveHtmlFilePath) {
                    key = `${arry[arry.length - 1]}`
                }
                result[key] = `${temp}.${buildconfig.InterFileType=="JS"?"js":"ts"}`
            }
        } else {
            console.log("未找到入口JS文件")
        }
        return result
    },
    /**
     * 获取Page文件入口
     * @returns []
     */
    GetEnterPage: function () {
        let result = [];
        if (!this.BaseEnterFile || this.BaseEnterFile.length <= 0) {
            this.BaseEnterFile = this.FindFileByPath(pagepath, ".html")
        }
        if (this.BaseEnterFile && this.BaseEnterFile.length > 0) {
            for (let i = 0; i < this.BaseEnterFile.length; i++) {
                let temp = this.BaseEnterFile[i].replace(".html", "")
                let arry = temp.split("\\");
                let key = `${arry[arry.length - 3]}\\${arry[arry.length - 2]}\\${arry[arry.length - 1]}`
                let filename = `.\\${arry[arry.length - 3]}\\${arry[arry.length - 1]}.html`
                if (buildconfig.RemoveHtmlFilePath) {
                    filename = `.\\${arry[arry.length - 1]}.html`
                    key = `${arry[arry.length - 1]}`
                }
                let template = `${temp}.html`
                result.push(
                    new HtmlWebpackPlugin({ //用指定的loader生成html
                        multihtmlCache: true,
                        filename: filename, //输出文件名
                        inject: "head", //js插入到body底部
                        chunks: [build.buildconfig.ThirdJSPartFileName, build.buildconfig.CommonJSPartFileName, key], //只插入page1.js
                        template: template, //以当前目录下的index.html文件为模板生成dist/index.html文件
                    })
                )
            }
        } else {
            console.log("未找到入口HTML文件")
        }
        return result
    },
    /**
     * 获取挂载组件
     * @returns  []
     */
    GetPlug: function () {
        //挂载HTML页面
        let result = build.GetEnterPage();
        //热更新 webpack会自动引入此组件，不再显式加入
        //result.push(new webpack.HotModuleReplacementPlugin());
        //注册全局变量
        let embase = {
            pkgName: env.npm_package_name,
            pkgVersion: env.npm_package_version,
            pkgDesc: env.npm_package_description,
            buildTime: bt.getTime(),
            buildDate: bt.toLocaleString(),
            isBuild: isBuild,
        }
        result.push(new webpack.DefinePlugin({
            embase: JSON.stringify({ ...embase, ...runconfig })
        }));
        //调试模式
        if (!isBuild && buildconfig.EnableVConsole) {
            result.push(
                new VConsolePlugin({
                    enable: true
                }));
        }
        //CSS输出目录
        result.push(new MiniCssExtractPlugin({
            filename: './static/css/[name].css?v=' + this.buildconfig.buildTime,
        }))
        result.push(new OptimizeCssAssetsPlugin({
            //一个正则表达式，指示应优化\最小化的资产的名称。提供的正则表达式针对配置中ExtractTextPlugin实例导出的文件的文件名运行，而不是源CSS文件的文件名。默认为/\.css$/g
            assetNameRegExp: /\.css$/g,
            //用于优化\最小化CSS的CSS处理器，默认为cssnano。这应该是一个跟随cssnano.process接口的函数（接收CSS和选项参数并返回一个Promise）。
            cssProcessor: require('cssnano'),
            //传递给cssProcessor的选项，默认为{}
            cssProcessorOptions: {
                safe: true,
                discardComments: {
                    removeAll: true
                }
            },
            //一个布尔值，指示插件是否可以将消息打印到控制台，默认为true
            canPrint: true
        }))
        if (buildconfig.IsLoaclPack && isBuild) {
            result.push(new donePlugin())
        }
        // result.push(new repalcePlugin())
        if (buildconfig.CopyDir && buildconfig.CopyDir.length > 0) {
            for (let i = 0; i < buildconfig.CopyDir.length; i++) {
                result.push(
                    new CopyPlugin({
                        patterns: [{
                            from: path.resolve(__dirname, buildconfig.CopyDir[i].from),
                            to: path.resolve(__dirname, buildconfig.CopyDir[i].to),
                            toType: 'dir',
                            force: false,
                            cacheTransform: true,
                        }]
                    }))
            }
        }
        return result;
    },
    /**
     * 获取本机内网IP
     * @returns  string
     */
    GetLocalIp: function () {
        if (buildconfig.ServiceWorker && buildconfig.ServiceWorker.EnableForDev) {
            return "localhost"
        }
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
    },
    /**
     * 从指定文件夹迭代获取符合扩展名的文件
     * @param {*} folderPath 查找文件夹
     * @param {*} extensionName 文件扩展名 如：.html
     * @param {*} isTolower 是否转化小写后查询，默认true
     * @returns []
     */
    FindFileByPath: function (folderPath, extensionName, isTolower = false) {
        var fs = require('fs');
        var path = require('path');
        try {
            let files = []
            let dirArray = fs.readdirSync(folderPath)
            for (let d of dirArray) {
                let filePath = path.resolve(folderPath, d)
                let stat = fs.statSync(filePath)
                if (stat.isDirectory()) {
                    files = files.concat(this.FindFileByPath(filePath, extensionName))
                }
                if (stat.isFile() && path.extname(filePath) === extensionName) {
                    files.push(isTolower ? filePath.toLowerCase() : filePath)
                }
            }
            return files
        } catch (e) {
            console.log("---------------------------------ERROR INFO-------------------------------------")
            console.log(`FindFileByPath方法执行报错：参数:{folderPath：${folderPath},extensionName:${extensionName}}`);
            console.log(e)
            console.log("---------------------------------ERROR END process is end-------------------------------------")
            process.exit();
        }
    },
    /**
     * 初始化Buid配置对象(此对象在build时使用)
     * @returns {pkgName:xx,pkgVersion:xx,pkgDesc:xx,buildTime:xx,env:xx}
     */
    buildconfig: {
        pkgName: env.npm_package_name,
        pkgVersion: env.npm_package_version,
        pkgDesc: env.npm_package_description,
        buildTime: bt.getTime(),
        buildDate: bt.toLocaleString(),
        isBuild: isBuild,
        ...buildconfig
    },
}
//落地包生成类 组件
class donePlugin {
    apply(compiler) {
        compiler.plugin('done', function () {
            var mateJson = {
                //落地包标识
                keyname: env.npm_package_name,
                //项目版本号
                version: env.npm_package_version,
                //构建时间
                buildTime: new Date().toLocaleString(),
                //对应 GIT/SVN 源码版本号
                revision: "--",
            }
            let distPath = `${__dirname}\\${buildconfig.BuildPackTo}\\metadata.json`;
            let fs = require('fs');
            //如果打包后没有这个js就添加一个空js文件，这个文件是IOS用来落地包校验的，没有此JS，IOS会走在线（仅仅做文件校验）
            let indexJsFile = `${__dirname}\\${buildconfig.BuildPackTo}\\static\\js\\index.js`;
            if (!fs.existsSync(indexJsFile)) {
                fs.mkdirSync(`${__dirname}\\${buildconfig.BuildPackTo}\\static\\js`, {
                    recursive: true
                })
                fs.writeFile(indexJsFile, "//此文件为落地包校验文件，不能删除（文件内容可能为空）", function (err, data) {
                    if (err) {
                        throw err;
                    } else {
                        console.log(`static=>js=>index.校验文件已生成！KEY:${env.npm_package_name}`)
                    }
                })
            }
            fs.writeFile(
                distPath,
                JSON.stringify(mateJson, '', '\t'),
                function (err, data) {
                    if (err) {
                        throw err;
                    } else {
                        console.log(`落地包已创建！KEY:${env.npm_package_name}`)
                    }
                })
        })
    }
}
//CSS公用样式 图片引用处理组件
class repalcePlugin {
    apply(compiler) {
        compiler.hooks.compilation.tap('repalcePlugin', (compilation) => {
            compilation.hooks.optimizeChunkAssets.tap('repalcePlugin', (chunks) => {
                //console.log(chunks)
                chunks.forEach((chunk) => {
                    chunk.files.forEach((fileName) => {
                        // 判断具体要修改的文件，假设简单通过 chunk 的文件名称判断入口
                        if (fileName.indexOf(buildconfig.CommonJSPartFileName + '.css') > -1) {
                            // 在源码头尾各增加内容
                            // compilation.assets[fileName] = new ConcatSource(
                            //     `console.log('code before')`,
                            //      compilation.assets[fileName],
                            //     `console.log('code after')`,
                            // );
                            compilation.assets[fileName] = new ConcatSource(
                                compilation.assets[fileName].source().replace(new RegExp('../../../../static/images', "g"), '../images')

                            );
                        }
                    });
                });
            });
        });
    }
}
module.exports = build
