<template>
  <el-row>
    <div class="logo"></div>
    <div class="banner"><span>欢迎使用</span></div>
    <div></div>
    <!-- <el-col :span="6"><div class="grid-content"></div></el-col>
    <el-col :span="18"><div class="grid-content"></div></el-col> -->
  </el-row>
</template>

<script>
export default {
  name: "Top",
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  height: 100%;
}
.grid-content {
  background-color: white;
}
</style>