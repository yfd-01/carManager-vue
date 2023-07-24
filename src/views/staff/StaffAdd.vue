<template>
  <el-dialog
    v-model="dlgAdd"
    title="添加员工"
    width="360px"
    center
    draggable
    :destroy-on-close="true"
    @close="closedlg"
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form
        :model="formData"
        :rules="rules"
        ref="formData"
        label-width="60px"
      >
        <el-form-item label="单位">
          <el-input v-model="formData.unit_name" disabled />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model.trim="formData.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.trim="formData.mobile" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="user_mail">
          <el-input v-model.trim="formData.user_mail" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="passwd">
          <el-input
            v-model.trim="formData.passwd"
            placeholder="初始密码不填则默认为手机号"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="角色" prop="ur_id">
          <el-select v-model="formData.ur_id" placeholder="请选择角色">
            <el-option
              v-for="role in allRole"
              :key="role.role_id"
              :label="role.role_memo"
              :value="role.ur_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="uur_memo">
          <el-input v-model.trim="formData.uur_memo" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button @click="resetForm('formData')"> 重置 </el-button>
        <el-button type="primary" @click="submitForm('formData')"
          >提交</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { checkEmail, checkMobile } from "@/common/utils";

export default {
  name: "StaffAdd",
  props: {
    dlgAdd: { default: false },
    formData: Object,
    allRole: Object,
  },
  emits: ["update", "dlgClosed"],
  data() {
    return {
      loadingStatus: false,

      rules: {
        // 验证用户名是否合法
        name: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "长度在1到10个字符",
            trigger: "blur",
          },
        ],
        // 验证邮箱是否合法
        user_mail: [
          { required: false, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        // 验证手机是否合法
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
        passwd: [
          { required: false, message: "密码长度错误", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在6到15个字符",
            trigger: "blur",
          },
        ],

        ur_id: [{ required: true, message: "请选择角色", trigger: "blur" }],
      },
    };
  },
  methods: {
    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    clsForm() {
      this.formData.name = null;
      this.formData.mobile = null;
      this.formData.user_mail = null;
      this.formData.passwd = null;
      this.formData.uur_memo = null;
    },

    submitForm(formData) {
      if (!this.formData.unit_id) {
        return this.$message.error("请先选择单位！");
      }

      //初始化表单中的其它用户信息
      if (!this.formData.passwd) {
        this.formData.passwd = this.formData.mobile;
      }

      this.$refs[formData].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          const { data: res } = await this.$http.post(
            "api/uurs/",
            this.formData
          );
          this.loadingStatus = false;
          this.$emit("update");
          if (res.flag !== true)
            return this.$message.error("添加失败：" + res.msg);
          else {
            // this.formData.passwd = null; //重置密码的显示
            this.clsForm();
            return this.$message.success("添加成功！");
          }
        } else {
          return this.$message.error("校验失败！");
        }
      });
    },

    closedlg() {
      this.$emit("dlgClosed");
    },
  },

  watch: {
    "formData.mobile"(newValue, oldValue) {
      this.formData.passwd = newValue;
    },

    "formData.unit_id"(newValue, oldValue) {
      this.clsForm();
      //单位发生变化，需要清理旧的ur_id以避免角色选择框混乱
      this.formData.ur_id = null;
    },
  },
};
</script >

<style scoped>
.dlg-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-form {
  padding-right: 5px;
}

.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>