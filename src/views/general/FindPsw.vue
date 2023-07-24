<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <div class="item-wrap">
          <el-button class="backbtn" text type="primary" @click="goBack"
            ><div class="arror-left" />
            返回</el-button
          >
        </div>
        <div class="title">
          <span>找回密码</span>
        </div>
        <div class="item-wrap"></div>
      </div>
    </template>
    <div class="reset-container" v-loading="loadingStatus">
      <el-form :model="detail" :rules="rules" ref="form" label-width="90px">
        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model.trim="detail.mobile" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha" class="form-item">
          <el-input
            v-model.trim="detail.captcha"
            placeholder="请输入验证码"
            @keyup.enter="sendEmail('form')"
            style="width: 60%"
          />
          <Captcha :refresh="captchaRefresh" />
        </el-form-item>
      </el-form>
      <div class="buttonWrapper">
        <el-button
          type="primary"
          @click="sendEmail('form')"
          :disabled="disableBtn"
          >{{ btnText }}</el-button
        >
      </div>
    </div>
  </el-card>
</template>

<script>
import Captcha from "@/components/Captcha";
import { checkMobile } from "@/common/utils";

export default {
  name: "FindPsw",
  components: {
    Captcha,
  },
  data() {
    return {
      loadingStatus: false,
      detail: { mobile: "", captcha: "" },
      rules: {
        mobile: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          //   { validator: checkMobile, trigger: "blur" },
        ],
        captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },

      captchaRefresh: -1,
      disableBtn: false,
      coolDownTimes: 60,
      coolDownTimer: null,
    };
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
    async sendEmail(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.disableBtn = true;
          this.coolDownTimer = setInterval(() => {
            this.coolDownTimes--;
            if (this.coolDownTimes === 0) {
              this.disableBtn = false;
              this.coolDownTimes = 20;
              clearInterval(this.coolDownTimer);
            }
          }, 1000);

          this.loadingStatus = true;
          const { data: res } = await this.$http.patch(
            "api/users/psw_reset_email",
            this.detail
          );
          this.loadingStatus = false;

          this.captchaRefresh = Math.random();

          if (res.flag) {
            return this.$message.success("重置邮件已发送，请尽快查收");
          } else {
            clearInterval(this.coolDownTimer);
            this.coolDownTimes = 60;
            this.disableBtn = false;

            if (res.msg === "captcha error")
              return this.$message.error("验证码错误");
            if (res.msg === "the user does not exist")
              return this.$message.error(`没有 ${this.phone} 用户`);
            if (res.msg === "the user has no email info")
              return this.$message.error("尚未绑定邮箱");
            else {
              this.$message.error("格式错误：" + res.msg);
            }
          }
        } else {
          this.$message.error("校验失败！");
        }
      });
    },
  },
  computed: {
    btnText() {
      if (!this.disableBtn) return "下一步";
      else return this.coolDownTimes;
    },
  },
};
</script>

<style scoped>
.el-card {
  min-width: 350px;
  width: 350px;
}

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

.reset-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-item {
  display: flex;
}

.buttonWrapper {
  width: 100%;
  margin-top: 10%;
}

.buttonWrapper > .el-button {
  width: 100%;
}
</style>