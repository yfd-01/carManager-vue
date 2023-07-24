const state = {device:'pc'}

const mutations = {
    SET_DEVICE_MOBILE:(state)=>{
        state.device = 'mobile'
    }
}

const getters ={
    isMobile(state){
        return state.device ==='pc'? false: true
    }
}

export default {
    state,
    mutations,
    getters
}