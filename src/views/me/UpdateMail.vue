<template>
  <div class="app-container">
    <el-page-header @back="goBack" content="修改邮箱" />
    <div class="list" v-loading="loadingStatus">
      <el-form
        status-icon
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item label="姓名">
          <el-input
            text
            type="primary"
            v-model="userName"
            disabled
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="user_mail">
          <el-input
            v-model.trim="ruleForm.user_mail"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button @click="resetForm('ruleForm')">重置</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')"
          >提交</el-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import { checkEmail } from "@/common/utils";
export default {
  name: "UpdateMail",
  data() {
    return {
      ruleForm: {
        user_mail: "",
      },
      loadingStatus: false,
      rules: {
        user_mail: [
          { required: false, message: "请电子邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          await this.$http
            .patch("api/users/email_update", this.ruleForm)
            .then((response) => {
              const { data: res } = response;
              if (res.flag !== true)
                this.$message.error("更新邮件失败：" + res.msg);
              else {
                this.$message.success("更新邮件成功！");
              }
            })
            .catch( (error)=> {
              this.$message.error("网络异常："+ error.message);
            });
          this.loadingStatus = false;
        } else {
          this.$message.error("校验失败！");
        }
      });
    },
    resetForm(formName) {
      // this.$refs[formName].resetFields();
      this.ruleForm.user_mail = this.$store.getters.userInfo.user_mail;
    },
  },
  computed: {
    userName() {
      return this.$store.getters.userInfo.name;
    },
  },
  mounted() {
    this.ruleForm.user_mail = this.$store.getters.userInfo.user_mail;
  },
};
</script>
<style scoped>
.el-page-header {
  height: 50px;
  background-color: #fff;
  border-radius: 3px;
  display: flex;
  align-items: center;
}

.list {
  margin-top: 6px;
  padding: 12px 12px;
  background-color: #fff;
  border-radius: 3px;
}

.row {
  line-height: 50px;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  min-width: 100px;
}

.btns {
  padding: 8px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
}

/* 水平时的按钮位置放在签名的sign div元素的右下角 */
.btns-hori {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>