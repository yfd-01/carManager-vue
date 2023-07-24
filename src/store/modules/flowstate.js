const getters = {
    flowState (){
        return {
            OFFICER_REVIEW: '待审核',
            REJECT_APP: '申请被驳回',
            LEADER_REVIEW: '待批准',
            INFO_UPLOAD: '待上传资料',
            INFO_CHECK: '待查验资料',
            FULFILL_INFO: '待完善资料',
            DONE: '已完成',
            WITHDRAW: '撤回',
        }
    },
}
export default {
    getters
}