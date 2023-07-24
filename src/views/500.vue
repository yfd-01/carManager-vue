<template>
  <div class="app-container">
    <img class="image" src="@/assets/error500.png" alt="服务错误" />
    <h3>服务器错误</h3>
    <div class="info">
      <el-button class="backbtn" text type="primary" @click="goBack"
        ><div class="arror-left" />
        返回</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  props: {},

  data() {
    return {};
  },

  watch: {},

  computed: {},

  methods: {
    goBack() {
      this.$router.push({name:'home'});
    },
  },

  created() {},

  mounted() {},
};
</script>

<style scoped>
.app-container {
  justify-content: center;
  align-items: center;
}
.image {
  width: 200px;
  height: 200px;
}
.info {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>