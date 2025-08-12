/**
 * 跟CLI更新，请勿擅自修改！！
 * Beisea：2022-01-13
 */
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const build = require("./webpack.build")

const config = {
    entry: build.GetEnterJS(),
    output: {
        //页面中相对路径（相对JS，图片等资源）
        publicPath: build.buildconfig.RemoveHtmlFilePath ? "./" : "../",
        //输出文件名，[name]表示入口文件js名
        filename: "static/script/[name].js?v=" + build.buildconfig.buildTime,
        //输出文件路径
        path: path.join(__dirname, build.buildconfig.BuildPackTo),
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json'
    },
    module: {
        rules: [ //loader
            {
                test: /\.ts?$/,
                use: {
                    loader: 'ts-loader',
                    options: { allowTsInNodeModules: true }
                }
            },
            {
                test: /\.art$/,
                use: ['art-template-loader']
            },
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        esModule: false,
                        name: '[name].[ext]?v=' + build.buildconfig.buildTime,
                        //输出到images文件夹
                        outputPath: "./static/images/",
                        //是把小于500B的文件打成Base64的格式，写入JS
                        limit: 500,
                    }
                }]
            },
            {
                test: /\.js$/,
                include: build.buildconfig.Compile,
                // exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    //开发模式不抽离css，用来热更新
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //CSS中相对路径（主要是相对图片等资源）
                            publicPath: build.buildconfig.ImagePathPrefix,
                            //仅dev环境启用HMR功能
                            hmr: 'devMode',
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                test: /\.ttf$/,
                use: ['url-loader']//处理ttf文件
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    plugins: build.GetPlug(),
    //webpack内部插件
    optimization: {
        minimize: true,//代码压缩，开启后tree shaking才起效
        usedExports: true,//tree shaking,生产模式默认开启，这里可以不加此配置
        //sideEffects: false,//无副作用代码去除，默认true，不去除，false为去除
        splitChunks: {
            cacheGroups: {
                commons: {
                    //抽离自己写的公共代码（包含JS和css）
                    test: /[\\/]src[\\/]/,
                    //抽离模块方式
                    chunks: "initial",
                    // 打包后的文件名，任意命名
                    name: build.buildconfig.CommonJSPartFileName,
                    //最小引用2次
                    minChunks: build.buildconfig.CommonJSPartValue,
                    // 只要超出0字节就生成一个新包
                    minSize: build.buildconfig.CommonJSPartSize,
                    //抽离顺序（这里是5，vendor为10，先抽离vendor后抽离commons）
                    priority: 5
                },
                vendor: {
                    // 抽离第三方插件
                    test: /[\\/]node_modules[\\/]/,
                    //抽离模块方式
                    chunks: "all",
                    //打包后的文件名，任意命名
                    name: build.buildconfig.ThirdJSPartFileName,
                    //最小引用2次
                    minChunks: build.buildconfig.ThirdJSPartValue,
                    //只要超出0字节就生成一个新包
                    minSize: build.buildconfig.ThirdJSPartSize,
                    //设置优先级，防止和自定义的公共代码提取时被覆盖
                    priority: 10
                },
            }
        }
    },
    mode: build.buildconfig.isBuild ? "production" : "development",
    //Android5.1 Dev模式不支持evl，只能用source-map
    devtool: build.buildconfig.isBuild ? "" : "cheap-module-eval-source-map",
    devServer: {
        openPage: `${build.buildconfig.DevStartPath}/${build.buildconfig.DevStartFile}`,
        // 启动压缩
        compress: false,
        //热更新
        hot: true,
        //更新模式
        inline: true,
        //控制台仅输出错误信息
        stats: 'errors-only',
        //关闭打包时 控制台上面的输出
        clientLogLevel: 'none',
        host: build.GetLocalIp(),
        port: build.buildconfig.DevStartPort,
        contentBase: './src',
        publicPath: build.buildconfig.DevStartPath ? `/${build.buildconfig.DevStartPath}/` : '',
    },
    performance: {
        //关闭性能提示
        hints: false,
    }
};
module.exports = config;
