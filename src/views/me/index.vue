<template>
  <div class="app-container">
    <el-col
      :sm="{ span: 24, offset: 0 }"
      :md="{ span: 18, offset: 3 }"
      :lg="{ span: 12, offset: 6 }"
    >
      <router-view />
    </el-col>
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

  methods: {},

  created() {},

  mounted() {},
};
</script>

<style scoped>
</style>