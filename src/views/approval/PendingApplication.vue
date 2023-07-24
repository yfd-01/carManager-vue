<template>
  <div class="app-container">
    <ViewTop title="待审核列表" />
    <!-- <div class="main-header"> -->
      <keep-alive>
        <UnitTree v-show="treeIf" @getUnitInfo="getUnitInfo" />
      </keep-alive>

       <!-- <div class="searchInputWrapper" v-if="showSearch">
        <el-input
          class="searchInput"
          autocomplete="off"
          placeholder="搜索(类型、申请人、车牌号、时间)"
          v-model.trim="searchText"
          @keyup.enter="searchApp"
        />
        <el-button type="primary" @click="searchApp">搜索</el-button>
      </div>  -->
    <!-- </div> -->
    <div
      class="scroll-wrap"
      ref="mainBody"
      v-if="hasData"
      v-loading="sketchDataLoading"
    >
      <el-scrollbar :max-height="scrollbarHeight">
        <div
          class="wrapper"
          :style="{ height: scrollbarHeight + 'px' }"
          ref="wrapper"
        >
          <div class="content">
            <AppItemSketch
              v-for="item in list"
              :appId="item.appId"
              :detailType="detailType"
              :key="item.appId"
            >
              <template v-slot:title>{{ item.title }}</template>
              <template v-slot:type>{{ item.type }}</template>
              <template v-slot:appPerson>{{ item.appPerson }}</template>
              <template v-slot:appVehicle>
                <span v-for="(item_, index_) in item.appVehicle" :key="index_">
                  {{ item_ }}
                  <el-divider
                    v-if="index_ < item.appVehicle.length - 1"
                    direction="vertical"
                  />
                </span>
              </template>
              <template v-slot:appTime>{{ item.appTime }}</template>
            </AppItemSketch>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-empty v-else description="暂无数据" />
  </div>
</template>


<script>
import { ref, onMounted } from "vue";
import BScroll from "better-scroll";

import ViewTop from "@/components/common/ViewTop.vue";
import AppItemSketch from "@/components/apps/AppItemSketch";
import UnitTree from "@/components/common/UnitTree";

export default {
  name: "PendingApplication",
  components: {
    ViewTop,
    AppItemSketch,
    UnitTree,
  },
  data() {
    return {
      rawTree: [],
      treeIf: false,
      hasData: true,
      showSearch: false,

      selectedUnitId: -1,
      list: [], // 列表数据绑定
      sketchDataLoading: false, // 数据加载中

      headerContent: "待审核列表",
      searchText: "",
      oldSearchText: "",

      appVehicleKeysLength: 0, // 申请车辆一行纵向分割条条数
      detailType: 1,
    };
  },
  setup() {
    const mainBody = ref(null);
    const scrollbarHeight = ref();
    onMounted(() => {
      scrollbarHeight.value = mainBody.value.offsetHeight - 2; //减去padding
    });
    return {
      mainBody,
      scrollbarHeight,
    };
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },

  watch: {
    //当使用模拟数据时，在渲染页面的时候就获得了模拟数据，然后调用就可以滚动了
    //当使用异步数据时，在数据发生变化的时候，就调用函数里面的$nextTick，然后进行刷新滚动的方法
    list: function () {
      this.$nextTick(() => {
        this.bs.refresh();
      });
    },
  },

  mounted() {
    let wrapper = this.$refs.wrapper;
    this.bs = new BScroll(wrapper, {
      scrollY: true, //纵向鼠标滚动
      click: true,
      // eventPassthrough: "horizontal", //横线拖动
      disableTouch: false,
      pullDownRefresh: {
        threshold: 50,
        stop: 30,
      },
    });
    /* 下拉刷新事件 */
    this.bs.on("pullingDown", this.pullDown);
  },
  beforeDestroy() {
    this.bs.destroy();
  },

  methods: {
    pullDown() {
      this.loadApps();
      this.bs.finishPullDown();
    },

    searchApp() {
      let searchText = this.searchText.trim();
      if (this.oldSearchText === searchText) return;

      this.loadApps(searchText);
    },
    async loadApps(query = null) {
      this.sketchDataLoading = true;
      const { data: res } = await this.$http.get(
        "/api/applications/pending_application",
        {
          params: {
            query: query,
            unit_id: this.selectedUnitId,
          },
        }
      );

      if (!res.flag) {
        if (res.errCode === 104) this.$message.error("无权访问");
        await this.$router.push({ name: "dashboard" });

        return;
      }

      if (res.data.length === 0) return (this.hasData = false);
      else this.hasData = true;

      this.showSearch = true;

      this.list = res.data.map((app) => {
        return {
          title: app.type_memo,
          type: "待办",
          appPerson: app.name_copy,
          appVehicle: [app.car_brand, app.palte_number, app.car_type],
          appTime: app.app_time_start.replace("T", " "),
          appId: app.app_id,
        };
      });

      this.sketchDataLoading = false;
      if (query !== null) {
        this.oldSearchText = query;
      }
    },

    getUnitInfo(data) {
      this.selectedUnitId = data.unit_id;
      this.loadApps();
    },
  },
  created() {
    this.treeIf = this.$store.getters.userInfo["role"] === "system";

    if (this.$store.getters.userInfo["role"] !== "system") {
      this.sketchDataLoading = true;
      this.loadApps();
    }
  },
};
</script>

<style scoped>
.main-header {
  margin-top: 6px;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
}
.searchInputWrapper {
  display: flex;
}

.searchInput {
  max-width: 240px;
  min-width: 240px;
  border-radius: 3px;
  margin-right: 6px;
}
.scroll-wrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
}
</style>