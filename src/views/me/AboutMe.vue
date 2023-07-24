<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      @back="goBack"
      content="我的信息"
    />
    <el-page-header v-else icon="house" title="我的信息" />
    <div class="list">
      <div class="row">
        <span>姓名</span>
        <div class="name">{{ userName }}</div>
        <div></div>
      </div>
      <el-divider />
      <div class="row">
        <span>手机</span>
        <div class="mobile">{{ mobile }}</div>
        <div></div>
      </div>
      <el-divider />
      <div class="row hover" @click="handleMail()">
        <span>邮箱</span>
        <div>{{ mail }}</div>
        <div class="arror" />
      </div>
      <el-divider />
      <div class="row hover" @click="handlePwd()">
        <span>密码</span>
        <div class="arror" />
      </div>
      <el-divider />

      <div class="row hover" @click="handleSign()">
        <span>签名模板</span>
        <div class="arror" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "AboutMe",
  data() {
    return {};
  },

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    userName() {
      return this.$store.getters.userInfo.name;
    },
    mobile() {
      return this.$store.getters.userInfo.mobile;
    },
    mail() {
      return this.$store.getters.userInfo.user_mail;
    },
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    handlePwd() {
      this.$router.push({
        name: "updatepwd",
      });
    },
    handleMail() {
      this.$router.push({
        name: "updateMail",
      });
    },
    handleSign(msg) {
      this.$router.push({
        name: "signature",
      });
    },
  },
  created() {},
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
  padding: 0 12px;
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
.hover:hover {
  border-radius: 3px;
  padding-left: 2px;
  cursor: pointer;
  background-color: #e2eff9;
}

.el-divider {
  margin: 0;
  padding: 0;
}

.arror {
  width: 10px;
  height: 10px;
  border-top: 2px solid grey;
  border-right: 2px solid grey;
  transform: rotate(45deg);
}
</style>