<template>
  <!-- 移动端由于界面小,路由到其它页面不需要再显示navibar和菜单,因此把navibar和菜单放在dashboard里 -->
  <div class="app-container">
    <!-- header部分 -->
    <el-header>
      <Navbar />
    </el-header>
    <!-- 横向滚动条 -->
    <!-- 限制菜单高度 -->
    <el-scrollbar :native="true">
      <!-- 菜单 -->
      <el-menu mode="horizontal" :ellipsis="false" @select="handleSelect">
        <!-- 菜单项 -->
        <el-menu-item
          v-for="(item, index) in menulist"
          :index="index + ''"
          :key="item.menu_id"
          active-text-color="#ffd04b"
          ellipsis="false"
          router
        >
          <span>{{ item.menu_name }}</span>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
    <!-- 子菜单，放在一行 -->
    <!-- 每个子菜单为一列 -->
    <div class="submenu-wrap">
      <div class="submenu" v-for="subitem in children" :key="subitem.menu_id">
        <!-- 子菜单的路由 -->
        <router-link :to="{ name: subitem.menu_path }">
          <div class="child-item">
            <svg-icon :icon-class="subitem.menu_path + '_m'" class="svgicon" />
            <span ref="subitem">{{ subitem.menu_name }}</span>
          </div>
        </router-link>
      </div>
    </div>
    <div class="dashboard">
      <DashBoard />
    </div>
  </div>
</template>
<script setup>
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
</script>

<script>
import Navbar from "@/components/home/common/Navbar.vue";
import DashBoard from "@/views/dashboard/";
export default {
  name: "MobileMenu",
  components: {
    Navbar,
    DashBoard,
  },
  data() {
    return {
      menulist: [],
      children: [], //保存二级菜单
    };
  },
  methods: {
    handleSelect(index) {
      this.children = this.menulist[index].children;

      if (this.children.length == 0) {
        let name = this.menulist[index].menu_path;
        this.$router.push({ name: name });
      }
    },

    async getMenuList() {
      const { data: res } = await this.$http.get("api/murs/");
      if (!res.flag) return this.$message.error(res.msg);
      this.menulist = res.data;
    },
  },
  created() {
    this.getMenuList();
  },
};
</script>

<style scoped>
.scroll-wrap {
  margin-top: 1px;
  background-color: #fff;
}

.el-scrollbar {
  margin-top: 1px;
  height: 60px;
  padding: 0;
  display: flex;
}
.el-menu-item,
.el-menu {
  background-color: white;
}

.el-menu {
  border-bottom: solid 1px whitesmoke;
}

.submenu-wrap {
  padding-top: 12px;
  display: flex;
  height: 80px;
  background-color: #fff;
}

.submenu {
  margin-left: 12px;
}

.svgicon {
  height: 30px;
  width: 30px;
  margin-bottom: 5px;
}

.child-item {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #909399;
  min-width: 50px;
}

.dashboard {
  flex-grow: 1;
}
</style>