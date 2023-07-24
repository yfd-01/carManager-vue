<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="角色管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="角色管理" />

    <div class="tableHeader">
      <el-button type="primary" @click="append()"> 新增角色</el-button>
    </div>

    <el-table :data="roleTableData" v-loading="loadingStatus">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column
        prop="role_name"
        label="角色名称"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column
        prop="role_memo"
        label="备注"
        show-overflow-tooltip
      ></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="scope">
          <el-button
            size="small"
            text
            type="warning"
            style="margin: 0 6px 0 0; padding: 0"
            @click="edit(scope.row)"
            >修改</el-button
          >
          <el-button
            size="small"
            text
            type="danger"
            style="margin: 0; padding: 0"
            @click="onDelRole(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dlgTitle"
      width="360px"
      center
      @close="close"
    >
      <el-form
        :model="formData"
        :rules="rules"
        ref="formData"
        label-width="100px"
        v-loading="loadingStatus"
      >
        <el-form-item label="角色名称" prop="role_name">
          <el-input
            placeholder="角色英文名称"
            autocomplete="off"
            type="text"
            v-model.trim="formData.role_name"
          />
        </el-form-item>
        <el-form-item label="备注" prop="role_memo">
          <el-input
            placeholder="角色中文名称"
            autocomplete="off"
            type="text"
            v-model.trim="formData.role_memo"
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button @click="resetForm('formData')">重置</el-button>
        <el-button type="primary" @click="dataFormSubmit('formData')"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>


<script>
export default {
  name: "RoleSet",
  data() {
    return {
      loadingStatus: false,
      dialogType: "",
      dlgTitle: "",
      dialogVisible: false,

      roleTableData: [],
      formData: {}, //表单对象

      rules: {
        role_name: [
          {
            required: true,
            message: "请输入角色英文名称",
            trigger: "blur",
          },
        ],
        role_memo: [
          {
            required: true,
            message: "请输入角色中文名称",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getRoleList();
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

    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    /*********************************************************
     *@Description: 关闭对话框
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 11:51:27
     ***********************************************************/
    close() {
      this.formData = {}; //清空表单对象
      this.dialogVisible = false;
    },

    async getRoleList() {
      this.loadingStatus = true;
      const { data: res } = await this.$http.get("api/roles/");
      this.loadingStatus = false;
      if (!res.flag) return this.$message.error("请求角色数据失败：" + res.msg);
      this.roleTableData = res.data;
    },

    /*********************************************************
     *@Description: 显示新增角色对话框
     *@MethodAuthor: revised by hfsun
     *@version: 修改
     *@Date: 2022-04-24 11:38:25
     ***********************************************************/
    append() {
      this.dlgTitle = "新增角色";
      this.dialogType = "append";
      this.dialogVisible = true;
    },

    /*********************************************************
     *@Description: 显示修改角色对话框
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 11:41:35
     ***********************************************************/
    edit(data) {
      this.dlgTitle = "修改角色";
      this.dialogType = "edit";
      this.formData = data;

      this.dialogVisible = true;
    },

    /*********************************************************
     *@Description: 刪除
     *@MethodAuthor:  revised by hfsun
     *@version:
     *@Date: 2022-04-24 11:43:47
     ***********************************************************/
    onDelRole(data) {
      this.$confirm(`是否删除【${data.role_name}】角色?`, "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.doDel(data);
      });
    },
    async doDel(data) {
      this.loadingStatus = true;
      const { data: res } = await this.$http.delete(
        `api/roles/${data.role_id}`
      );
      this.loadingStatus = false;
      if (!res.flag) return this.$message.error("删除失败：" + res.msg);
      else {
        this.getRoleList();
        return this.$message.success("删除成功!");
      }
    },

    /*********************************************************
     *@Description: 对话框表单提交
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 11:46:47
     ***********************************************************/
    dataFormSubmit(formData) {
      this.$refs[formData].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          let res_ = null;
          if (this.dialogType == "append") {
            const { data: res } = await this.$http.post(
              "api/roles/",
              this.formData
            );
            res_ = res;
          } else {
            const { data: res } = await this.$http.put(
              `api/roles/${this.formData.role_id}`,
              this.formData
            );
            res_ = res;
          }
          this.loadingStatus = false;
          if (res_.flag !== true)
            return this.$message.error("操作失败：" + res.msg);
          else this.getRoleList();
          return this.$message.success("操作成功");
        } else {
          return this.$message.error("校验失败");
        }
      });
    },
  },
};
</script>

<style >
.tableHeader {
  margin-top: 6px;
  display: flex;
  justify-content: right;
}
.el-table {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}
.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>