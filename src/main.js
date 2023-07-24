import { createApp } from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import App from './App.vue'
// import router from './router'
import { router } from './permission'
import { store } from './permission'

import axios from "axios"
// 引入签名模板插件
import vueEsign from 'vue-esign'

import ElementPlus from 'element-plus'
import "element-plus/dist/index.css"
import { ElMessage } from "element-plus";
import * as ElIcons from '@element-plus/icons-vue'
//设置element plus为中文
import 'dayjs/locale/zh-cn'
import locale from 'element-plus/lib/locale/lang/zh-cn'

import '@/assets/icons'

import '@/assets/styles/index.scss' // global css

import "font-awesome/css/font-awesome.min.css"

import NProgress from 'nprogress' // 进度条
import 'nprogress/nprogress.css' // 引入样式

const app = createApp(App);
app.use(vueEsign)

import SvgIcon from '@/components/svgIcon' 
app.component('svg-icon', SvgIcon)

for (const name in ElIcons) {
    app.component(name, ElIcons[name])
}

NProgress.inc(0.2)
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })


// 配置请求的根路径
axios.defaults.baseURL = window.serverAddress.baseUrl
axios.defaults.withCredentials = true

function errmsg(error) {
    NProgress.done() // 加载进度条结束
    router.push({name:'500'});
    ElMessage({
        message: "服务器错误："+ error,
        type: "error",
        duration: 2000,
    });
}

// axios 请求拦截器
axios.interceptors.request.use(
    config => {
        NProgress.start() // 加载进度条开始

        config.headers["Content-Type"] = "application/json"
        config.data = JSON.stringify(config.data)
        let token = window.localStorage.getItem('token');
        if (token)
            config.headers["Authorization"] = "Bearer " + token

        return config
    },
    error => {
        errmsg(error)
        return Promise.reject(error)
    }
)

// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(
    response => {
        NProgress.done() // 加载进度条结束
        // if (response.status !== 200) {
        //     errmsg("访问失败！")
        //     return;
        // }
        return response

    },
    error => {
        errmsg(error)
        return Promise.reject(error)
    }
)

app.config.globalProperties.$http = axios;


app.use(store).use(router).use(ElementPlus,{locale}).mount('#app')
