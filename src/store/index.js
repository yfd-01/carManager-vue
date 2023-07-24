import { createStore } from 'vuex'
import moduleUser from './modules/user'
import userDevice from './modules/device'
import flowState from './modules/flowstate'
//应用Vuex插件

export default createStore({
  modules: {
    moduleUser,
    userDevice,
    flowState
  }
})

