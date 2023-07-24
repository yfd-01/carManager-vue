// Deprecated - 在main.js中已绑定axios请求

// import axios from "axios"
// import qs from "qs"
// import NProgress from 'nprogress'

// export default function request(target, method="GET", data={}){
//     const instance = axios.create({
//         baseURL:"http://192.168.1.101:3000"
//     })
//
//     instance.interceptors.request.use(config => {
//         NProgress.start()
//         config.method = method
//         config.headers["Content-Type"] = (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH" ?
//             "application/x-www-form-urlencoded" : "application/json")
//         config.data = qs.stringify(data)
// // export default function request(target, method="GET", data={}){
// //     const instance = axios.create({
// //         baseURL:"http://192.168.1.101:3000"
// //     })
// // s
// //     instance.interceptors.request.use(config => {
// //         NProgress.start()
//
// //         config.method = method
// //         // config.headers["Content-Type"] = (method === "POST" || method === "DELETE" || method === "PATCH" ?
// //         //     "application/x-www-form-urlencoded" : "application/json")
// //         config.headers["Content-Type"] = "application/json"
// //         // config.data = qs.stringify(data)
//
// //         return config
// //     }, err => {
// //     })
//
// //     instance.interceptors.response.use(res => {
// //         NProgress.done()
//
// //         return res.data
// //     },err => {
// //     })
//
// //     return instance(target)
//     }
// }
