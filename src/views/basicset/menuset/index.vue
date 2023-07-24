<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="菜单管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="菜单管理" />
    <div class="main-header">
      <el-button type="primary" @click="onAddMenu()"> 新增一级菜单</el-button>
    </div>
    <div class="tableWrap" ref="mainBody" v-loading="loadingStatus">
      <el-table :data="menuTableData" :height="tableHeight" row-key="menu_id">
        <el-table-column
          label="菜单id"
          prop="menu_id"
          header-align="center"
          align="center"
          width="80px"
          show-overflow-tooltip
        />
        <el-table-column
          prop="parent_menu_id"
          label="父菜单id"
          header-align="center"
          align="center"
          show-overflow-tooltip
          width="80px"
        />
        <el-table-column
          prop="menu_name"
          label="菜单名称"
          show-overflow-tooltip
          width="120px"
        />
        <el-table-column
          prop="menu_path"
          label="菜单路径(名称)"
          show-overflow-tooltip
          width="140px"
        />
        <el-table-column prop="menu_memo" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="140px" min-width="140px">
          <template #default="scope">
            <el-button
              style="margin: 0; padding: 0"
              size="small"
              text
              type="primary"
              @click="onAddSubMenu(scope.$index, scope.row)"
              >新增</el-button
            >
            <el-button
              size="small"
              style="margin: 0 6px; padding: 0"
              text
              type="warning"
              @click="onOpenEditMenu(scope.$index, scope.row)"
              >修改</el-button
            >
            <el-button
              style="margin: 0; padding: 0"
              size="small"
              text
              type="danger"
              @click="onTabelRowDel(scope.$index, scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <MenuDialog
    :visible="visible"
    :dialogType="dialogType"
    :form="rowObj"
    @dialog-close="dialogclose()"
    @getmenuList="refresh"
  />
</template>

<script>
import MenuDialog from "./MenuDialog.vue";
import { ref, onMounted } from "vue";
export default {
  name: "menuSet",
  components: { MenuDialog },
  data() {
    return {
      loadingStatus: false,
      dialogType: 1, //对话框的类型.1是新增一级菜单，2是新增子菜单，3是编辑菜单
      visible: false, //对话框是否可见
      rowObj: {}, //选中编辑、新增的一行Obj
      menuTableData: [],
    };
  },
  setup() {
    const mainBody = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = mainBody.value.offsetHeight - 10; //减去padding
    });
    return {
      mainBody,
      tableHeight,
    };
  },
  activated() {
    this.refresh();
  },
  created() {
    this.getMenuList();
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    async getMenuList() {
      this.loadingStatus = true;
      const { data: res } = await this.$http.get("api/menus/");
      this.loadingStatus = false;
      if (!res.flag) return this.$message.error("获取菜单失败：" + res.msg);
      this.menuTableData = res.data;
    },

    onTabelRowDel(index, data) {
      this.$confirm(`是否删除【${data.menu_name}】菜单?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.del(data);
        this.m_id = 0;
      });
    },
    async del(data) {
      this.m_id = data.menu_id;
      this.loadingStatus = true;
      const { data: res } = await this.$http.delete(`api/menus/${this.m_id}`);
      this.loadingStatus = false;
      if (!res.flag) return this.$message.error("请求失败!");
      else {
        this.refresh();
        return this.$message.success("删除成功!");
      }
    },

    onAddMenu() {
      this.dialogType = 1;
      this.visible = true;
      this.rowObj = {};
    },
    onAddSubMenu(index, row) {
      this.visible = true;
      this.dialogType = 2;
      this.rowObj = { parent_menu_id: row.menu_id };
    },

    onOpenEditMenu(index, row) {
      this.visible = true;
      this.dialogType = 3;
      this.rowObj = row;
    },

    dialogclose() {
      this.visible = false;
      this.rowObj = {};
    },
    refresh() {
      this.getMenuList();
    },
  },
};
</script>

<style>
.main-header {
  margin-top: 6px;
  display: flex;
  justify-content: right;
}
.tableWrap {
  flex-grow: 1;
  padding-top: 6px;
}
.el-table {
  flex-grow: 1;
  background-color: #fff;
  border-radius: 3px;
}
</style>