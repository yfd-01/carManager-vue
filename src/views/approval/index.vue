<template>
  <div class="app-container">
    <el-col
      :xs="{ span: 24, offset: 0 }"
      :sm="{ span: 22, offset: 1 }"
      :md="{ span: 20, offset: 2 }"
      :lg="{ span: 18, offset: 3 }"
      :xl="{ span: 16, offset: 4 }"
    >
      <!-- 需要页面缓存 -->
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component
            :is="Component"
            :key="$route.name"
            v-if="$route.meta.keepAlive"
          />
        </keep-alive>
        <component :is="Component" v-if="!$route.meta.keepAlive" />
      </router-view>
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
.el-col {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
</style>