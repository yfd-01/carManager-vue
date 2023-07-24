<template>
  <div class="app-container">
    <el-timeline>
      <el-timeline-item
        v-for="(item, index) in timelineList"
        :key="index"
        :icon="item.icon"
        :type="item.type"
        :color="item.color"
        :size="item.size"
        :hollow="item.hollow"
        :timestamp="item.timestamp"
      >
        <div class="contentWrapper">
          <div class="contentWrapperLeft">
            <div>
              {{ item.content }}
            </div>
            <div>
              {{ item.operator }}
            </div>
            <div>
              {{ getComment(item.comment) }}
            </div>
          </div>

          <div v-show="item.duration" class="contentWrapperRight">
            耗时：{{ item.duration }}
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  name: "AppTimeLine",
  props: ["flows"],
  data() {
    return {
      timelineList: [],

      event_trans: {
        SUBMIT: "提交",
        OFFICER_APPROVAL: "审核",//干部
        LEADER_APPROVAL: "审批",//领导
        UPLOAD_INFO: "上传资料",
        LEADER_PASS: "核验通过",//干部
        OFFICER_DISMISS: "审核驳回",//干部
        LEADER_DISMISS: "审批驳回",//领导
        MODIFIED_SUBMIT: "修改后提交",//员工
        STAFF_WITHDRAW: "撤回申请",//员工
        STAFF_UPDATE_INFO: "更新资料",//员工
        LEADER_PASS_FAIL: "核验未通过",//干部
        APP_DONE_BACK: "完成后回退",
        EMERGENCY_APP_FLY: "快速申请"
      },

      type_def: {
        //          颜色           中空        大小           类型
        START: ["#fff", true, "large", "primary"],
        SUCCESS: ["#0bbd87", false, "large", undefined],
        FAILURE: ["#e36049", false, "large", undefined],
        END: ["#409eff", false, "large", undefined],
        OPERATION: ["#e4e7ed", false, "large", undefined],
      },
    };
  },
  watch: {
    flows() {
      this.timelineList = this.flows.map((flow) => {
        let flow_type = this.getType(flow);
        return {
          content: this.event_trans[flow.flowstate_event],
          timestamp: flow.flowstate_time.replace("T", " "),
          color: flow_type[0],
          hollow: flow_type[1],
          size: flow_type[2],
          type: flow_type[3],
          duration: flow.flowstate_spendtime,
          comment: flow.comment,
          operator: "操作者：" + flow.operator_role_name_copy,
        };
      });
    },
  },
  computed: {
    getType() {
      return (flow) => {
        switch (flow.flowstate_event) {
          case "SUBMIT":
            return this.type_def.START;

          case "STAFF_WITHDRAW":
          case "LEADER_PASS":
            return this.type_def.END;

          case "OFFICER_APPROVAL":
          case "LEADER_APPROVAL":
            return this.type_def.SUCCESS;

          case "OFFICER_DISMISS":
          case "LEADER_DISMISS":
          case "LEADER_PASS_FAIL":
            return this.type_def.FAILURE;

          default:
            return this.type_def.OPERATION;
        }
      };
    },

    getComment() {
      return (comment_) => {
        return comment_ === null || comment_.trim() === ""
          ? ""
          : `${"意见：" + comment_}`;
      };
    },
  },
};
</script>

<style scoped>
.contentWrapper {
  display: flex;
  width: 90%;
}

.contentWrapperLeft {
  width: 75%;
}
</style>