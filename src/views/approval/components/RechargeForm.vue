<template>
  <el-form ref="formName" :model="extraInfos" label-width="90px">
    <el-form-item label="充值时间:" prop="rc_time">
      <span>{{ extraInfos.rc_time.replace("T", " ") }}</span>
    </el-form-item>
    <el-form-item label="充值金额:" prop="rc_value">
      <span>{{ extraInfos.rc_value }}元</span>
    </el-form-item>
    <el-form-item label="备注:" prop="rc_memo">
      <span>{{ extraInfos.rc_memo }}</span>
    </el-form-item>
    <el-form-item v-if="app_time_end" label="完成时间:" prop="app_time_end">
      <span>{{ app_time_end.replace("T", " ") }}</span>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "RechargeForm",
  props: ["extraInfos","app_time_end"],
};
</script>

<style scoped>
</style>