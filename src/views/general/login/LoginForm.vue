<template>
  <div class="form-container" v-loading="loadingStatus">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginFormRules"
      label-width="80px"
    >
      <!-- 用户名 -->
      <el-form-item label="手机号码" prop="username">
        <el-input
          v-model.trim="loginForm.username"
          placeholder="请输入手机号码"
          :prefix-icon="Phone"
        />
      </el-form-item>
      <!-- 密码 -->
      <el-form-item label="密码" prop="password">
        <el-input
          v-model.trim="loginForm.password"
          :prefix-icon="Unlock"
          placeholder="请输入密码"
          type="password"
          @keyup.enter="login"
        />
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item label="验证码" prop="captcha" v-if="captchaVisible">
        <el-input
          v-model.trim="loginForm.captcha"
          placeholder="请输入验证码"
          style="width: 60%"
          @keyup.enter="login"
        />
        <Captcha :refresh="captchaRefresh" />
      </el-form-item>
      <!-- 重置密码 -->
      <el-form-item>
        <div class="resetLink" style="">
          <router-link :to="{ name: 'findpsw' }"
            ><span>忘记密码？</span></router-link
          >
        </div>
      </el-form-item>
    </el-form>
    <div class="btns">
      <el-button type="info" @click="resetLoginForm" style="margin-left: auto"
        >重置</el-button
      >
      <el-button type="primary" @click="login">登录</el-button>
    </div>
  </div>
</template>

<script setup>
import { Unlock, Message, Phone } from "@element-plus/icons-vue";
</script>

<script>
import Captcha from "@/components/Captcha";
import { checkMobile } from "@/common/utils";
export default {
  name: "LoginForm",
  components: {
    Captcha,
  },
  data() {
    return {
      captchaRefresh: -1,
      captchaVisible: false,
      loadingStatus: false,
      // 登录表单的数据绑定对象
      loginForm: {
        username: "",
        password: "",
        captcha: "",
      },
      // 表单的验证规则对象
      loginFormRules: {
        // 验证用户名是否合法
        username: [
          { required: true, message: "请输入手机号码", trigger: "blur" },
          // { validator: checkMobile, trigger: "blur" },
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: "请输入登录密码", trigger: "blur" },
          {
            min: 3,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        captcha: [{ required: true, message: "请输入验证码", trigger: "blur" }],
      },
    };
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("校验失败");
        }

        this.loadingStatus = true;

        const { data: res } = await this.$http.post("api/users/login", {
          mobile: this.loginForm.username,
          passwd: this.loginForm.password,
          captcha: this.loginForm.captcha,
        });
        this.loadingStatus = false;

        if (res.flag !== true) {
          this.captchaRefresh = Math.random();
          this.loginForm.captcha = null;

          if (res.msg === "login fail" || res.msg === "user does not exist")
            return this.$message.error("账号或密码有误");
          else if (res.msg === "captcha error") {
            if(!this.captchaVisible){
              this.captchaVisible = true
              return this.$message.error("请输入验证码");
            }else
              return this.$message.error("验证码有误");
          }
        } else {
          // 登录成功后选择uur
          let uursCandidate = [];

          let uurs = res.data.uurs;
          let merged_ids = [];

          while (1) {
            let tmp = uurs.find(
              (uur) =>
                merged_ids.findIndex((id) => uur["unit_id_copy"] === id) === -1
            );

            if (tmp === undefined) break;

            let merging_id = tmp["unit_id_copy"];

            uursCandidate.push({
              label: tmp["unit_name"],
              options: uurs.filter((uur) => uur["unit_id_copy"] === merging_id),
            });

            merged_ids.push(merging_id);
          }

          window.localStorage.setItem("token", res.data.token);

          this.$emit("showRoleChooseForm", {
            mobile: res.data.user.mobile,
            name: res.data.user.name,
            selectedUurId: null,
            uursCandidate: uursCandidate,
          });
        }
      });
    },
    // 点击重置按钮，重置登录表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
  },
};
</script>

<style scoped>
.form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btns {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
}

.resetLink {
  width: 100%;
  display: flex;
  justify-content: right;
}

.resetLink > a {
  text-decoration: none;
  color: #333;
}
</style>