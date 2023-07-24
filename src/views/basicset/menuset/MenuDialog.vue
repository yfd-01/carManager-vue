<template>
  <el-dialog
    :title="dlgTitle"
    width="360px"
    center
    v-model="visible"
    @close="close"
  >
    <el-form
      :model="formData"
      :rules="rules"
      label-width="100px"
      ref="formData"
      v-loading="loadingStatus"
    >
      <el-form-item label="菜单名称" prop="menu_name">
        <el-input
          autocomplete="off"
          v-model.trim="formData.menu_name"
        />
      </el-form-item>
      <el-form-item label="父菜单ID" prop="parent_menu_id">
        <el-input
          autocomplete="off"
          v-model.trim="formData.parent_menu_id"
          disabled
        />
      </el-form-item>
      <el-form-item label="菜单别名" prop="menu_path">
        <el-input autocomplete="off" v-model.trim="formData.menu_path" />
      </el-form-item>
      <el-form-item label="备注" prop="menu_memo">
        <el-input autocomplete="off" v-model.trim="formData.menu_memo" />
      </el-form-item>
    </el-form>
    <div class="btns">
      <el-button  @click="resetForm('formData')">重置</el-button>
      <el-button type="primary" @click="dataFormSubmit('formData')"
        >确 定</el-button
      >
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "MenuDialog",
  props: {
    visible: { default: false },
    dialogType: Number,
    form: Object,
  },
  emits: ["dialog-close", "getmenuList"],
  data() {
    return {
      dlgTitle: "新增一级菜单",
      loadingStatus:false,
      formData: {},
      rules: {
        menu_name: [
          {
            required: true,
            message: "请输入菜单名称",
            trigger: "blur",
          },
        ],
        menu_path: [
          {
            required: true,
            message: "请输入菜单路由别名",
            trigger: "blur",
          },
        ],
      },
    };
  },

  watch: {
    dialogType(newValue, oldValue) {
      if (newValue === 1) {
        this.dlgTitle = "新增一级菜单";
      } else if (newValue === 2) {
        this.dlgTitle = "新增子菜单";
      } else if (newValue === 3) {
        this.dlgTitle = "编辑菜单";
      }
    },
    form(newValue, oldValue) {
      this.formData = JSON.parse(JSON.stringify(newValue)); //js深度拷贝
    },
  },

  methods: {
    close() {
      this.$emit("dialog-close");
    },

    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    dataFormSubmit(formData) {
      this.$refs[formData].validate(async (valid) => {
        if (!valid) return this.$message.error("校验失败");

        //编辑菜单
        if (this.dialogType == 3) {
          this.loadingStatus = true;
          const { data: res } = await this.$http.put(
            `api/menus/${this.formData.menu_id}`,
            this.formData
          );
          this.loadingStatus = false;
          if (res.flag !== true)
            return this.$message.error("修改失败" + res.msg);
          this.$emit("getmenuList");
          return this.$message.success("修改成功");
        } else {
          //新增菜单
          this.loadingStatus = true;
          const { data: res } = await this.$http.post(
            "api/menus/",
            this.formData
          );
          this.loadingStatus = false;
          if (res.flag !== true)
            return this.$message.error("添加失败" + res.msg);
          this.$emit("getmenuList");
          return this.$message.success("添加成功");
        }
      });
    },
  },
};
</script>

<style>
.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>