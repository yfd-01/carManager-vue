<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <span>{{ !isRoleChoose ? "欢迎使用车辆油料管理系统" : "角色选择" }}</span>
      </div>
    </template>

    <LoginForm v-if="!isRoleChoose" @showRoleChooseForm="showRoleChooseForm" />
    <ChooseForm v-else :chooseForm="chooseInfos" ref="chooseFormRef"/>
  </el-card>
</template>


<script>
import LoginForm from "./LoginForm";
import ChooseForm from "./ChooseForm";

export default {
  components: { LoginForm, ChooseForm },
  name: "Login",

  data() {
    return {
      isRoleChoose: false,
      chooseInfos: null,
    };
  },
  methods: {
    async showRoleChooseForm(chooseInfos) {
      if (
        chooseInfos.uursCandidate.length === 1 &&
        chooseInfos.uursCandidate[0].options.length === 1
      ) {
        const { data: res } = await this.$http.get("/api/users/role_choose", {
          params: {
            uur_id: chooseInfos.uursCandidate[0].options[0].uur_id,
          },
        });
        this.loadingStatus = false;

        if (res.flag) {
          window.localStorage.setItem("token", res.data.access_token);
          window.localStorage.setItem("refreshToken", res.data.refresh_token);

          await this.$router.push("/home");
        } else {
          return this.$message.error("角色登录失败");
        }

        return;
      }

      this.chooseInfos = chooseInfos;
      this.isRoleChoose = true;
    },
  },
};
</script>

<style scoped>
.el-card{
  min-width: 350px;
  width: 350px;
}
.card-header {
  text-align: center;
}
</style>