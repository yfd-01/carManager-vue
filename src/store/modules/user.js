// import { resetRouter } from '@/router'

const getDefaultState = () => {
    return {
        u_id: null,
        mobile: null,
        name: null,
        user_sign: null,
        user_mail: null,
        user_memo: null,
        role_id: null,
        role: null,
        role_memo:null,
        unit_id: null,
        unit_name:null
    }
}

const state = getDefaultState()
const mutations = {
    RESET_STATE: (state) => {
        Object.assign(state, getDefaultState())
    },
    setUserInfo(state, userInfo) {
        state.u_id = userInfo.u_id
        state.mobile = userInfo.mobile
        state.name = userInfo.name
        state.user_sign = userInfo.user_sign
        state.user_mail = userInfo.user_mail
        state.user_memo = userInfo.user_memo
        state.role_id = userInfo.role_id
        state.role = userInfo.role
        state.role_memo = userInfo.role_memo
        state.unit_id = userInfo.unit_id
        state.unit_name = userInfo.unit_name
    }
}

const getters = {
    userExisted(state) {
        return state.u_id !== null && state.mobile !== null && state.name !== null
    },
    userRole(state){
        return state.role;
    },
    userInfo(state){
        return {
            u_id: state.u_id,
            mobile: state.mobile,
            name: state.name,
            user_sign: state.user_sign,
            user_mail: state.user_mail,
            user_memo: state.user_memo,
            role_id: state.role_id,
            role: state.role,
            role_memo: state.role_memo,
            unit_id: state.unit_id,
            unit_name:state.unit_name
        }
    },
    unitName(state){
        return state.unit_name
    },
    unitId(state){
        return state.unit_id
    },
    uId(state){
        return state.u_id
    }
}

export default {
    state,
    mutations,
    getters
}
