<template>
  <el-page-header
    v-if="isMobile"
    title="后退"
    :content="title"
    @back="goBack"
  />
  <el-page-header v-else icon="house" :title="title" />
</template>

<script>
export default {
  name: "ViewTop",
  components: {},

  props: {
      title:''
  },

  data() {
    return {};
  },

  watch: {},

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },

  methods: {
    goBack(){
      this.$router.go(-1);
    }
  },

  created() {},

  mounted() {},
};
</script>

<style scoped>
</style>