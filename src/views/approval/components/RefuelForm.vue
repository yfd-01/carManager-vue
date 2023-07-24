<template>
  <el-form ref="formName" :model="extraInfos" label-width="100px">
    <el-form-item label="加油对象:" prop="ref_self">
      <span>{{  extraInfos.ref_self == 1?"为本车加油":"不为本车加油"}}</span>
    </el-form-item>    
    <el-form-item label="剩余油量:" prop="ref_remainder">
      <span>{{ extraInfos.ref_remainder }}</span>
    </el-form-item>
    <el-form-item label="加油后油量:" prop="ref_finished_scale">
      <span>{{ extraInfos.ref_finished_scale }}</span>
    </el-form-item>
    <el-form-item label="加油时间:" prop="ref_time">
      <span>{{ extraInfos.ref_time.replace("T", " ") }}</span>
    </el-form-item>
    <el-form-item label="加油地点:" prop="ref_time">
      <span>{{ extraInfos.ref_addr }}</span>
    </el-form-item>
    <el-form-item label="油品标号:" prop="ref_gas_type">
      <span>{{ extraInfos.ref_gas_type }}</span>
    </el-form-item>
    <el-form-item label="里程表:" prop="ref_mile">
      <span>{{ extraInfos.ref_mile }}公里</span>
    </el-form-item>
    <el-form-item label="加油单价:" prop="ref_price">
      <span>{{ extraInfos.ref_price }}元</span>
    </el-form-item>
    <el-form-item label="加油量:" prop="ref_volume">
      <span>{{ extraInfos.ref_volume }}升</span>
    </el-form-item>
    <el-form-item label="加油金额:" prop="ref_cost">
      <span>{{ extraInfos.ref_cost }}元</span>
    </el-form-item>
    <el-form-item label="备注:" prop="ref_memo">
      <span>{{ extraInfos.ref_memo }}</span>
    </el-form-item>  
    <el-form-item v-if="app_time_end" label="完成时间:" prop="app_time_end">
      <span>{{ app_time_end.replace("T", " ") }}</span>
    </el-form-item>  
  </el-form>
</template>

<script>
export default {
  name: "RefuelForm",
  props: ["extraInfos","app_time_end"],
};
</script>

<style scoped>
</style>