<template>
  <router-view />
</template>

<script>
export default {
  methods: {
    _isMobile() {
      let flag = navigator.userAgent.match(
        /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
      );
      return flag;
    },
  },
  mounted() {
    if (this._isMobile()) {
      this.$store.commit("SET_DEVICE_MOBILE");
      // this.$router.replace({name:'m_home'});
    } else {
      // this.$router.replace({name:'home'});
    }
  },
};
</script>

<style>
</style>
