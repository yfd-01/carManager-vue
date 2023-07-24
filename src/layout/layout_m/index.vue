<template>
  <!-- 移动端的home -->
  <div class="app-container">
    <el-container>
      <el-main>
        <!-- 路由需要keepAlive的组件，需要在该组件的父组件设置keep-alive -->
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" :key="$route.name" v-if="$route.meta.keepAlive" />
          </keep-alive>
          <component :is="Component" v-if="!$route.meta.keepAlive" />
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "MLayout",
  components: {},

  props: {},

  data() {
    return {};
  },

  watch: {},

  computed: {},

  methods: {},

  created() {},

  mounted() {
  },
};
</script>

<style scoped>
.el-main {
  margin: 0;
  padding: 0;
}
</style>