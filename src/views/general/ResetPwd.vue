<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <div class="item-wrap">
          <el-button class="backbtn" text type="primary" @click="goLogin"
            ><div class="arror-left" />
            登录</el-button
          >
        </div>
        <div class="title">
          <span>重置密码</span>
        </div>
        <div class="item-wrap"></div>
      </div>
    </template>
    <div class="form-container" v-if="valid" v-loading="loadingStatus">
      <el-form :model="detail" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="手机号码" prop="mobile">
          <el-input disabled v-model="detail.mobile" />
        </el-form-item>
        <el-form-item label="输入新密码" prop="newPsw">
          <el-input
            type="password"
            v-model.trim="detail.newPsw"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPsw">
          <el-input
            type="password"
            v-model.trim="detail.confirmPsw"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <div class="buttonWrapper">
        <el-button type="primary" @click="resetPsw('form')">修改密码</el-button>
      </div>
    </div>
    <div class="change-container-form" v-else>
      <h1>请先申请重置密码</h1>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "ResetPwd",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value !== this.detail.newPsw) {
        callback(new Error("两次输入密码不一致"));
      } else {
        callback();
      }
    };
    return {
      loadingStatus: false,
      detail: { mobile: "", newPsw: "", confirmPsw: "" },
      valid: true,
      rules: {
        newPsw: [
          { required: true, message: "请输入新密码", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        confirmPsw: [
          { required: true, message: "请再次输入新密码", trigger: "blur" },
          { validator: validatePass, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    goLogin() {
      this.$router.push({name:'login'});
    },
    // 检查链接是否有效
    async checkUrlValid() {
      let sid = this.$route.query.sid;
      if (sid !== undefined && sid !== "") {
        const { data: res } = await this.$http.get(
          "api/users/psw_renew_sid_check",
          {
            params: { sid: sid },
          }
        );
        if (res.flag) {
          this.detail.mobile = res.data;
          return;
        } else this.valid = false;
      }

      this.valid = false;
      return this.$message.error("无效地址");
    },

    async resetPsw(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          const { data: res } = await this.$http.patch("api/users/psw_renew", {
            sid: this.$route.query.sid,
            newPsw: this.detail.newPsw,
          });
          this.loadingStatus = false;
          if (res.flag) {
            this.$message.success("重置密码成功");
            await this.$router.push({ name: "login" });
          } else this.$message.error("重置密码失败:" + res.msg);
        } else return this.$message.error("校验失败");
      });
    },
  },
  created() {
    this.checkUrlValid();
  },
};
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
}

.item-wrap{
  width: 50px;
}


.title {
  flex-grow: 1;
  text-align: center;
}

.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}


.buttonWrapper {
  width: 100%;
  margin-top: 10%;
}

.buttonWrapper > .el-button {
  width: 100%;
}
</style>