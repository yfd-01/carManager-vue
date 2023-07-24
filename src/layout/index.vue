<template>
  <div class="app-container" v-if="isMobile">
      <MLayout/>
  </div>
  <div class="app-container" v-else>
      <PCLayout/>
  </div>
</template>

<script>
import PCLayout from "./layout_pc/index.vue";
import MLayout from "./layout_m/index.vue";
export default {
  components: { PCLayout, MLayout },

  props: {},

  data() {
    return {};
  },

  watch: {},

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },

  methods: {},

  created() {},

  mounted() {},
};
</script>

<style scoped>
</style>