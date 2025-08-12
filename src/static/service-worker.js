let CacheKey = "EM_DEMO_CACHE_V10"//怎么改变这个key清楚老缓存呢TODO
console.log(CacheKey)
// 监听 service worker 的 install 事件
this.addEventListener('install', function (event) {
    console.log("ServiceWorker安装... ");
    self.skipWaiting()
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    // event.waitUntil(
    // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
    //caches.open(CacheKey).then(function (cache) {
    // 通过 cache 缓存对象的 addAll 方法添加 precache 缓存
    // return cache.addAll([
    //     '/collect/single/static/script/hxnc_pc/index/index.js',
    //     '/collect/single/hxnc_pc/index.html',
    // ]);
    //})
    //);
});

this.addEventListener("activate", function (event) {
    console.log("ServiceWorker激活... ");
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (key, i) {
                if (key !== CacheKey) {
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

this.addEventListener('fetch', function (event) {
    console.log("ServiceWorker激活... ");
    let tempp = event.request.url.split('?')[0].split('.')
    let temppp = tempp[tempp.length - 1].toLowerCase()
    //只拦截css，js，png，jpg
    // if (temppp != "css" && temppp != "js" && temppp != "png" && temppp != "jpg")
    //     return;
    if (event.request.url.toLowerCase().indexOf("/static/") <= 0) {
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function (response) {
            console.log("ServiceWorker拦截... " + temppp);
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            if (response) {
                return response;
            }
            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            var request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {
                // http请求的返回已被抓到，可以处置了。
                // 请求失败了，直接返回失败的结果就好了。。
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }
                // 请求成功的话，将请求缓存起来。
                var responseClone = httpRes.clone();
                caches.open(CacheKey).then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return httpRes;
            });
        })
    );
});

// self.addEventListener('activate', event => {
//     // 已激活，成功控制客户端
//     // 如果activate足够快，clients.claim的调用在请求之前，就能保证第一次请求页面也能拦截请求
//     clients.claim();
//     // event.waitUntil(
//     //     // 可以在这里清除旧的缓存
//     // );
// });

// self.addEventListener('fetch', event => {
//     const url = new URL(event.request.url);
//     debugger
//     // 拦截/api/user接口的请求，返回自定义的response
//     if (url.pathname == '/api/user') {
//         event.respondWith(
//             // response body只能接受String, FormData, Blob等类型，所以这里序列化
//             new Response(JSON.stringify({
//                 name: 'Javen'
//             }), {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             })
//         );
//     }
// });
