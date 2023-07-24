<template>
  <div>
    <el-form :model="chooseForm" label-width="0px" v-loading="loadingStatus">
      <el-form-item>
        <el-input
          v-model.trim="chooseForm.mobile"
          :prefix-icon="Phone"
          disabled
        />
      </el-form-item>

      <el-form-item>
        <el-input v-model="chooseForm.name" :prefix-icon="User" disabled />
      </el-form-item>

      <el-form-item>
        <el-select
          v-model="chooseForm.selectedUurId"
          placeholder="选择登录角色"
        >
          <el-option-group
            v-for="group in chooseForm.uursCandidate"
            :key="group.label"
            :label="group.label"
          >
            <el-option
              v-for="item in group.options"
              :key="item.role_memo"
              :label="item.role_memo"
              :value="item.uur_id"
            />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item class="btns">
        <el-button type="primary" @click="roleChoose" style="margin-left: auto"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { User, Message, Phone } from "@element-plus/icons-vue";
</script>

<script>
export default {
  name: "ChooseForm",
  props: ["chooseForm"],
  data() {
    return {
      loadingStatus: false,
    };
  },
  methods: {
    async roleChoose() {
      if (this.chooseForm.selectedUurId === null) {
        return this.$message.info("请选择一个角色登录");
      }

      // 1.将登录成功之后的 token，保存到客户端的 sessionStorage 中
      //   1.1项目中除了登录之外的其它api接口，必须在登录之后才能访问
      //   1.2token长期间生效，所以将 token保存在 localStorage 中
      // 2.通过编程式导航跳转到后台主页，路由地址是 /home
      this.loadingStatus = true;

      const { data: res } = await this.$http.get("/api/users/role_choose", {
        params: {
          uur_id: this.chooseForm.selectedUurId,
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
    },
  },
  created() {
    if (!this.chooseForm.uursCandidate.length) {
      return this.$message.error("抱歉！您在本系统不属于任何单位");
    }
  },
};
</script>

<style scoped>
.btns {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
}
</style>