<template>
  <div class="app-container">
    <el-header>
      <Navbar />
    </el-header>
    <el-col 
    :md="{ span: 24, offset: 0 }" 
    :lg="{ span: 20, offset: 2 }"
    >
      <Sidebar class="aside" />
      <el-main>
            <!-- 路由需要keepAlive的组件，需要在该组件的父组件设置keep-alive -->
        <router-view />
      </el-main>
    </el-col>
  </div>
</template>


<script>
import Sidebar from "./components/Sidebar.vue";
import Navbar from "@/components/home/common/Navbar.vue";
export default {
  name: "PCLayout",
  components: {
    Navbar,
    Sidebar,
  },

  data() {
    return {
      // 是否折叠
      isCollapse: false,
    };
  },

  methods: {
    // 点击按钮，切换按钮的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
  },
  mounted(){
  }
};
</script>

<style  scoped>
.el-col {
  margin-top: 9px;
  flex-grow: 1;
  display: flex;
  flex-direction: row;
}
.aside {
  height: 100%;
  background-color: white;
  border-radius: 4px;
}

.el-main {
  margin: 0 9px 9px 9px;
  min-width: 500px;
  padding: 0;
  flex-grow: 1;
  border-radius: 4px;
}
</style>