<template>
  <div id="main">
    <!-- 侧边栏菜单区域 -->
    <el-menu
      :default-active="activeIndex"
      :ellipsis="false"
      :unique-opened="true"
      active-text-color="#337ecc"
    >
      <!-- 无子节点，显示为item -->
      <el-menu-item
        v-show="!item.children.length"
        v-for="item in menulist"
        :index="item.menu_id + ''"
        :key="item.menu_id"
        @click="menuItemClicked(item)"
      >
        <svg-icon
          :icon-class="item.menu_path"
          style="margin-right: 10px"
        ></svg-icon>
        <span style="">{{ item.menu_name }}</span>
      </el-menu-item>

      <!-- 有子节点，显示为submenu -->
      <el-sub-menu
        v-show="item.children.length"
        v-for="item in menulist"
        :index="item.menu_id + ''"
        :key="item.menu_id"
        active-text-color="#FF6C16"
      >
        <!-- 一级菜单模板区域 -->
        <template #title>
          <svg-icon
            :icon-class="item.menu_path"
            style="margin-right: 10px"
          ></svg-icon>
          <span>{{ item.menu_name }}</span>
        </template>
        <!-- 二级菜单 -->
        <el-menu-item
          v-for="subItem in item.children"
          :index="subItem.menu_id + ''"
          :key="subItem.menu_id"
          @click="menuItemClicked(subItem)"
        >
          <router-link :to="{ name: subItem.menu_path }">
            <svg-icon
              :icon-class="subItem.menu_path"
              style="margin-right: 10px"
            ></svg-icon>
            <span>{{ subItem.menu_name }}</span>
          </router-link>
        </el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "Sidebar",
  components: {},

  props: {},

  data() {
    return {
      activeIndex: "0",
      // 左侧菜单数据
      menulist: [],
    };
  },
  created() {
    this.getMenuList();
  },
  methods: {
    menuItemClicked(item) {
      this.$router.push({ name: item.menu_path });
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("api/murs/");

      if (!res.flag) return this.$message.error("服务器错误："+res.msg);
      this.menulist = res.data;
      
    },
  },
};
</script>

<style  scoped>
.style {
  padding: 0;
}

.main {
  background-color: white;
  border-radius: 4px;
  height: 100%;
}
.el-menu {
  border-right: none;
  padding: 3px;
  border-radius: 4px;
  width: 200px;
}

.el-menu-item {
  height: 46px;
  font-size: 16px;
}

.el-menu-item:hover {
  border-left: #409eff solid 4px !important;
  background-color: #e2eff9 !important;
  color: #409eff !important;
}

:deep(.el-sub-menu  .el-sub-menu__title) {
  padding-left: 0px;
  font-size: 16px;
  height: 46px;
}
:deep(.el-sub-menu .el-sub-menu__title:hover)
 {
  border-left: #409eff solid 4px !important;
  background-color: #e2eff9 !important;
  color: #409eff !important;
}

.el-menu--inline > li {
  height: 46px;
  min-width: 194px !important;
  padding-left: 46px !important;
}

/* .toggle-button {
  background-color: white;
  font-size: 10px;
  line-height: 24px;
  color: #409eff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
  font-weight: bold;
} */
</style>