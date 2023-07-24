<template>
  <el-form ref="formName" label-width="90px">
    <el-form-item label="申请人员:">
      <span>{{ name_copy }}</span>
    </el-form-item>
    <el-form-item label="申请类型:">
      <span>{{ type_memo }}</span>
    </el-form-item>
    <el-form-item label="车牌号码:">
      <span>{{ palte_number }}</span>
    </el-form-item>
    <el-form-item v-if="type_id === 3 || type_id ==2" label="加油卡号:">
      <span>{{ card_number }}</span>
    </el-form-item>
    <el-form-item v-if="type_id === 3 || type_id ==2" label="油卡余额:">
      <span>{{ capital_balance }}元</span>
    </el-form-item>
    <el-form-item label="申请时间:">
      <span>{{ apptime }} </span>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "AppDetailMsg",
  props: {
    name_copy: "",
    type_memo: "",
    palte_number: "",
    capital_balance: "",
    app_time_start: "",
    card_number:"",
    type_id:"",
  },
  data() {
    return {
      apptime:"",
    }
  },
  watch: {
    app_time_start(newValue, oldValue) {
      this.apptime = newValue.replace("T", " ");
    },
  },
};
</script>

<style scoped>
</style>