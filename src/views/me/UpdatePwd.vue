<template>
  <div class="app-container">
    <el-page-header @back="goBack" content="修改密码" />
    <div class="list" v-loading="loadingStatus">
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item label="姓名">
          <el-input
            type="text"
            v-model="userName"
            disabled
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="旧密码" prop="oldpass" >
          <el-input
            type="password"
            v-model.trim="ruleForm.oldpass"
            autocomplete="off"
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="pass" >
          <el-input
            type="password"
            v-model.trim="ruleForm.pass"
            autocomplete="off"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="checkPass" >
          <el-input
            type="password"
            v-model="ruleForm.checkPass"
            placeholder="请再次输入新密码"
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
export default {
  name: "UpdatePwd",
  data() {
    // 自定义校验规则
    var validatePass = (rule, value, callback) => {
      if (value !== this.ruleForm.pass) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      loadingStatus: false,
      ruleForm: {
        oldpass: "",
        pass: "",
        checkPass: "",
      },
      rules: {
        oldpass: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
        pass: [
          { required: true, message: "新密码不能为空", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        checkPass: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          { validator: validatePass, trigger: "blur" },
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
            .patch("api/users/psw_renew_login", this.ruleForm)
            .then((response) => {
              const { data: res } = response;
              if (res.flag !== true)
                this.$message.error("更新密码失败：" + res.msg);
              else {
                this.$message.success("更新密码成功！");
              }
            })
            .catch(function (error) {
               this.$message.error("网络异常：" + error.message);
            });
          this.loadingStatus = false;
        } else {
          this.$message.error("校验失败！");
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
  computed: {
    userName() {
      return this.$store.getters.userInfo.name;
    },
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

/* .row {
  line-height: 50px;
  margin-top: 2px;
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
  min-width: 100px;
} */
</style>