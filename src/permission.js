import router from "@/router"
import store from '@/store'
import axios from "axios"
import NProgress from "nprogress"
import { ElMessage } from "element-plus"
import { toNumber } from "@vue/shared"

const whiteList = ["login", "findpsw", "changepsw", "404", "500"]

// 自动适配移动端和pc端
// function checkTerminal(to, from, next){
//     if (store.getters.isMobile) {//移动端
//         if (to.name.indexOf('m_') !== -1) next();
//         else {
//             next({name:'m_' + to.name})
//         }
//     }
//     else {//pc端
//         if (to.name.indexOf('m_') === -1) next();
//         else {
//             next('/home')//先定位到主页，不影响pc端后续路由
//         }
//     }
// }

// dashboard在移动端重定向到m_dashboard
function checkTerminal(to, from, next){
    if (store.getters.isMobile) {//移动端
        if (to.name == 'dashboard') next({name:'m_dashboard'});
        else {
            next();
        }
    }
    else {
        if (to.name == 'm_dashboard') next({name:'dashboard'});
        else {
            next();
        }
    }
}

router.beforeEach((to, from, next) => {
    NProgress.start()

    // 白名单检查
    if (whiteList.indexOf(to.name) !== -1) {
        next()
        return
    }

    if (!store.getters.userExisted) {
        // 本地无用户信息
        let token = window.localStorage.getItem('token')

        if (token !== null) {
            axios.get("api/users/user_token_unpack", {
                params: {
                    token: window.localStorage.getItem('token')
                }
            }).then(res => {
                let data = res.data

                if (data.flag) {
                    // 更新本地用户信息
                    store.commit("setUserInfo", data.data)

                    //  next()
                    checkTerminal(to, from, next)
                } else {
                    ElMessage.error("请重新登录: " + data.msg)
                    next({name:'login'})
                }
            }).catch(err => {
                next({name:'login'})
            })
        } else {
            next({name:'login'})
        }
    }

    // else next()
    else{
        checkTerminal(to, from, next)
        // next()
    }
})

// 进度条结束
router.afterEach(() => {
    NProgress.done()
})


export { router, store }
