<template>
  <el-form ref="formName" :model="extraInfos" label-width="90px">
    <el-form-item label="保养内容:" prop="mt_item">
      <span>{{ extraInfos.mt_item }}</span>
    </el-form-item>
    <el-form-item label="保养地点:" prop="mt_addr">
      <span>{{ extraInfos.mt_addr }}</span>
    </el-form-item>

    <el-form-item label="保养时间:" prop="mt_time">
      <span>{{ extraInfos.mt_time.replace("T", " ") }}</span>
    </el-form-item>
    <el-form-item label="里程表:" prop="mt_mile">
      <span>{{ extraInfos.mt_mile }}公里</span>
    </el-form-item>
    <el-form-item label="维修费用:" prop="mt_cost">
      <span>{{ extraInfos.mt_cost }}元</span>
    </el-form-item>
    <el-form-item label="备注:" prop="mt_memo">
      <span>{{ extraInfos.mt_memo }}</span>
    </el-form-item>
    <el-form-item v-if="app_time_end" label="完成时间:" prop="app_time_end">
      <span>{{ app_time_end.replace("T", " ") }}</span>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "MaintainForm",
  props: ["extraInfos","app_time_end"],
};
</script>

<style scoped>
</style>