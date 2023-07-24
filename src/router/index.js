import { createRouter, createWebHashHistory } from 'vue-router'
// import {pa} from "element-plus/es/locale";

// 
// pc端的home页面视图，除了home外都需要在menus菜单中配置
// 
// 路径表示引入此路径中的index.vue
const Home = () => import("@/layout/")

// 单项菜单
const Dashboard = () => import("@/views/dashboard/")
const MDashboard = () => import("@/views_m/dashboard/")
const Vehicle = () => import("@/views/vehicle/")
const Renter = () => import("@/views/renter/")
const SubUnit = () => import("@/views/subunit/")
const Staff = () => import("@/views/staff/")
const SysLog = () => import("@/views/syslog/")

// err404,500
const ERR404 = () => import("@/views/404")
const ERR500 = () => import("@/views/500")


//基础信息
const BasicSet = () => import("@/views/basicset/")
const AppType = () => import("@/views/basicset/AppType")
const RoleSet = () => import("@/views/basicset/RoleSet")
const MenuSet = () => import("@/views/basicset/menuset/")
const AppSet = () => import("@/views/basicset/AppSet/")



//我的信息
const Me = () => import("@/views/me/")
const AboutMe = () => import("@/views/me/AboutMe")
const UpdateMail = () => import("@/views/me/UpdateMail")
const UpdatePwd = () => import("@/views/me/UpdatePwd")
const Signature = () => import("@/views/me/Signature")

//当前任务处理
const ProcessApp = () => import("@/views/processapp/ProcessApp")

// 我的申请
const Apps = () => import("@/views/myapp/")
const AppNew = () => import("@/views/myapp/AppNew")
const AppOn = () => import("@/views/myapp/AppOn")
const AppDone = () => import("@/views/myapp/AppDone")
const AppDetail = () => import("@/views/myapp/AppDetail")

// 审核批准
const Approval = () => import("@/views/approval/")
const PendingApplication = () => import("@/views/approval/PendingApplication")
const PendingApprove = () => import("@/views/approval/PendingApprove")
const PendingAudit = () => import("@/views/approval/PendingAudit")
const ApprovalDetail = () => import("@/views/approval/Detail")


//统计汇总
const UnitSummary = () => import("@/views/unitsummary/")
const ApplicationSum = () => import("@/views/unitsummary/ApplicationSum")
const MaintainSum = () => import("@/views/unitsummary/MaintainSum")
const RechargeSum = () => import("@/views/unitsummary/RechargeSum")
const RefuelSum = () => import("@/views/unitsummary/RefuelSum")
const RepairSum = () => import("@/views/unitsummary/RepairSum")

// 权限管理
const Authority = () => import("@/views/authority/")
const RenterRole = () => import("@/views/authority/RenterRole")
const RenterRoleMenu = () => import("@/views/authority/RenterRoleMenu")
const RenterApp = () => import("@/views/authority/RenterApp")

// 
//General views，用于登录、找回密码、404页面
// 
const General = () => import("@/layout_general/")
const Login = () => import("@/views/general/login/")
const FindPsw = () => import("@/views/general/FindPsw")
const ResetPwd = () => import("@/views/general/ResetPwd")


const routes = [
    {
        path: '',
        component: Home,
        redirect: { name: 'home' },
    },
    {
        path: '/home',
        name: 'home',
        component: Home,
        redirect: { name: 'dashboard' },
        children: [
            {
                name: 'dashboard',
                path: 'dashboard',
                component: Dashboard,
            },
            {
                name: "m_dashboard",
                path: "m_dashboard",
                component: MDashboard,//与pc端不同的组件。pc端的dashboard不包含菜单，移动端包含菜单和pc端的dashboard。
                meta: {
                    keepAlive: true // 需要被缓存
                },
            },


            {
                name: 'vehicle',
                path: 'vehicle',
                component: Vehicle,
            },

            {
                path: 'basicset',
                name: 'basicset',
                component: BasicSet,
                children: [
                    {
                        name: 'roleSet',
                        path: 'roleSet',
                        component: RoleSet,
                    },
                    {
                        name: 'appType',
                        path: 'appType',
                        component: AppType,
                        props: true
                    },
                    {
                        name: 'menuSet',
                        path: 'menuSet',
                        component: MenuSet,
                        props: true
                    },
                    {
                        name: 'appSet',
                        path: 'appSet',
                        component: AppSet,
                    },                    
                ]
            },

            {
                name: 'processApp',
                path: 'processApp',
                component: ProcessApp,
            },
            {
                name: 'apps',
                path: 'apps',
                component: Apps,
                children: [
                    {
                        name: 'appnew',
                        path: 'appnew',
                        component: AppNew,
                    },
                    {
                        name: 'appon',
                        path: 'appon',
                        component: AppOn,
                    },
                    {
                        name: 'appdone',
                        path: 'appdone',
                        component: AppDone,
                        meta: {
                            keepAlive: true // 有列表，从详情回来前需要被缓存
                        },
                    },
                    {
                        name: 'appdetail',
                        path: 'appdetail/:app_id',
                        component: AppDetail,
                    },
                ]
            },


            {
                name: "approval",
                path: "approval",
                component: Approval,
                redirect: {
                    name: 'pendingApplication'
                },
                children: [
                    {
                        name: "pendingApplication",
                        path: "pendingApp",
                        component: PendingApplication,
                    },
                    {
                        name: "pendingApprove",
                        path: "approve",
                        component: PendingApprove,
                    },
                    {
                        name: "pendingAudit",
                        path: "audit",
                        component: PendingAudit,
                    },
                    {
                        name: "approvalDetail",
                        path: "approvalDetail",
                        component: ApprovalDetail
                    }
                ]
            },

            {
                path: 'renter',
                name: 'renter',
                component: Renter,
            },
            {
                path: 'me',
                name: 'me',
                component: Me,
                redirect: { name: 'aboutme' },
                children: [
                    {
                        name: 'aboutme',
                        path: 'aboutme',
                        component: AboutMe,
                    },
                    {
                        name: 'updatepwd',
                        path: 'updatepwd',
                        component: UpdatePwd,
                    },
                    {
                        name: 'updateMail',
                        path: 'updateMail',
                        component: UpdateMail,
                    },
                    {
                        name: 'signature',
                        path: 'signature',
                        component: Signature,
                    }
                ]
            },


            {
                name: 'staff',
                path: 'staff',
                component: Staff,
            },

            {
                name: 'subunit',
                path: 'subunit',
                component: SubUnit
            },
            {
                name: 'syslog',
                path: 'syslog',
                component: SysLog
            },


            {
                name: 'unitsummary',
                path: 'unitsummary',
                component: UnitSummary,
                children: [
                    {
                        name: 'applicationsum',
                        path: 'applicationsum',
                        component: ApplicationSum,
                        meta: {
                            keepAlive: true // 需要被缓存
                        },
                    },
                    //只有在本级目录下的keepalive缓存才会生效，因此需要在本级目录下新增使用到的ApprovalDetail组件

                    {
                        name: 'maintainsum',
                        path: 'maintainsum',
                        component: MaintainSum,
                        meta: {
                            keepAlive: true // 需要被缓存
                        },
                    },
                    {
                        name: 'rechargesum',
                        path: 'rechargesum',
                        component: RechargeSum,
                        meta: {
                            keepAlive: true // 需要被缓存
                        },
                    },
                    {
                        name: 'refuelsum',
                        path: 'refuelsum',
                        component: RefuelSum,
                        meta: {
                            keepAlive: true // 需要被缓存
                        },
                    },
                    {
                        name: 'repairsum',
                        path: 'repairsum',
                        component: RepairSum,
                        meta: {
                            keepAlive: true // 需要被缓存
                        },
                    },
                    {
                        name: 'detail',
                        path: 'detail',
                        component: ApprovalDetail
                    },
                ]
            },
            {
                name: 'authority',
                path: 'authority',
                component: Authority,
                children: [
                    {
                        name: 'renterRole',
                        path: 'renterRole',
                        component: RenterRole,
                    },
                    {
                        name: 'renterRoleMenu',
                        path: 'renterRoleMenu',
                        component: RenterRoleMenu,
                    },
                    {
                        name: 'renterApp',
                        path: 'renterApp',
                        component: RenterApp,
                    }
                ]
            },


        ]
    },

    // *********************************
    // 此处往下是General，general是响应式布局，不需要区分pc和移动端
    // 
    // *********************************
    {
        path: "/general",
        name: 'general',
        component: General,
        children: [
            {
                path: 'login',
                name: 'login',
                component: Login
            },
            {
                path: "findpsw",
                name: "findpsw",
                component: FindPsw
            },
            {
                path: "changepsw",
                name: "changepsw",
                component: ResetPwd
            },

        ]
    },


    {
        path: "/500",
        name: "500",
        component: ERR500,
        hidden: true
    },

    {
        path: "/404",
        name: "404",
        component: ERR404,
        hidden: true
    },
    // 404 page must be placed at the end !!!
    { path: '/:pathMatch(.*)', redirect: { name: '404' }, hidden: true },

]

const router = createRouter({
    history: createWebHashHistory(process.env.BASE_URL),
    routes
})

export default router