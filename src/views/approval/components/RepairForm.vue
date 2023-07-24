<template>
  <el-form ref="formName" :model="extraInfos" label-width="90px">
    <el-form-item label="维修项目:" prop="rp_item">
      <span>{{ extraInfos.rp_item }}</span>
    </el-form-item>
    <el-form-item label="维修时间:" prop="rp_time">
      <span>{{ extraInfos.rp_time.replace("T"," ") }}</span>
    </el-form-item>
    <el-form-item label="维修地点:" prop="rp_addr">
      <span>{{ extraInfos.rp_addr }}</span>
    </el-form-item>
    <el-form-item label="里程表:" prop="rp_mile">
      <span>{{ extraInfos.rp_mile }}公里</span>
    </el-form-item>
    <el-form-item label="维修费用:" prop="rp_cost">
      <span>{{ extraInfos.rp_cost }}元</span>
    </el-form-item>
    <el-form-item label="备注:" prop="rp_memo">
      <span>{{ extraInfos.rp_memo }}</span>
    </el-form-item>    
    <el-form-item v-if="app_time_end" label="完成时间:" prop="app_time_end">
      <span>{{ app_time_end.replace("T", " ") }}</span>
    </el-form-item>  
  </el-form>
</template>

<script>
export default {
  name: "RepairForm",
  props: ["extraInfos","app_time_end"],
};
</script>

<style scoped>
</style>