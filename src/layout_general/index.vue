<template>
  <!-- 用于登录、找回密码、404页面等一般性的页面，与移动端的home区别是不需要包含Head和Foot -->
  <div class="app-container">
    <el-container>
      <el-main>
        <el-row>
          <router-view />
        </el-row>
      </el-main>
      <el-footer>
        <Bottom class="bottom" />
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import Bottom from "./components/Bottom";
import Top from "./components/Top";
export default {
  name: "General",
  components: { Top, Bottom },
};
</script>

<style scoped>
.el-main {
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-footer {
  padding: 0;
}
</style>