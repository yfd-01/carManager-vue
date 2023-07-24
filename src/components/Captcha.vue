<template>
  <img class="image" :src="src" @click="refreshCaptcha" />
</template>

<script>
import axios from "axios";

export default {
  name: "Captcha",
  props: ["refresh"],
  data() {
    return {
      src: "",
    };
  },
  methods: {
    refreshCaptcha() {
      this.src = `${axios.defaults.baseURL}api/captcha?${Math.random()}`;
    },
  },
  watch: {
    refresh() {
      this.refreshCaptcha();
    },
  },
  mounted() {
    this.refreshCaptcha();
  },
};
</script>

<style scoped>
.image {
  width: 80px;
  cursor: pointer;
}
</style>