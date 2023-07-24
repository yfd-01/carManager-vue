<template>
  <el-dialog
    v-model="dlgEdit"
    title="修改员工信息"
    draggable
    width="360px"
    center
    destroy-on-close
    @close="closedlg"
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form
        :model="formData"
        ref="formData"
        :rules="rules"
        label-width="50px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model.trim="formData.name" autocomplete="off" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model.trim="formData.mobile" autocomplete="off" />
        </el-form-item>
        <el-form-item label="邮箱" prop="user_mail">
          <el-input v-model.trim="formData.user_mail" autocomplete="off" />
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
          <el-input
            type="textarea"
            v-model.trim="formData.uur_memo"
            autocomplete="off"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button @click="resetForm('formData')"> 重置 </el-button>
        <el-button type="primary" @click="submitForm('formData')"
          >确定</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { checkEmail, checkMobile } from "@/common/utils";

export default {
  name: "StaffEdit",
  components: {},

  props: {
    form: Object,
    allRole: Object,
    dlgEdit: { default: false },
  },

  emits: ["update", "dlgClosed"],

  data() {
    return {
      loadingStatus: false,
      formData: {}, //接收来自props的form的深度拷贝，防止指针传递造成在修改未成功时在父组件显示并没有修改成功的信息
      roleData: {}, //接收来自props的allRole的深度拷贝
      rules: {
        // 验证用户名是否合法
        name: [
          { required: true, message: "请输入用户姓名", trigger: "blur" },
          {
            min: 1,
            max: 10,
            message: "长度在 1 到 10 个字符",
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
      },
    };
  },

  methods: {
    submitForm(formData) {
      //向后端发送put请求
      this.$refs[formData].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          const { data: res } = await this.$http.put(
            `api/uurs/${this.formData.uur_id}`,
            this.formData
          );
          this.loadingStatus = false;
          if (res.flag !== true)
            return this.$message.error("修改失败：" + res.msg);
          else {
            this.$emit("update");
            return this.$message.success("修改成功！");
          }
        } else {
          return this.$message.error("校验失败！");
        }
      });
    },
    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    closedlg() {
      this.$emit("dlgClosed");
    },
  },
  watch: {
    form(newData, oldData) {
      this.formData = JSON.parse(JSON.stringify(newData)); //js深度拷贝
    },
  },
};
</script>


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