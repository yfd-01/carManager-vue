<template>
  <div class="app-container">
    <el-page-header 
      v-if="isMobile"
      title="后退"
      content="进行中"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="进行中" />
    <el-empty description="暂无数据" v-if="isEmpty" />
    <div class="scrollbarWrap" ref="mainBody" v-else v-loading="loading">
      <el-scrollbar :max-height="scrollbarHeight" >
        <div class="wrapper" :style="{height:scrollbarHeight + 'px'}" ref="wrapper">
          <div class="content">
            <el-card
              class="card"
              shadow="never"
              v-for="(item, index) in app_list"
              :key="index"
            >
              <template #header>
                <div class="card_head">
                  <div class="head_type">{{ item.type_memo }}</div>
                  <div class="app_state">{{ item.state_name }}</div>
                </div>
              </template>
              <div class="appInfo">
                <div>
                  <el-icon> <User /> </el-icon>申请人
                </div>
                <div>{{ item.name_copy }}</div>
              </div>
              <div class="appInfo">
                <div>
                  <el-icon> <Van /> </el-icon>申请车辆
                </div>
                <div>{{ item.palte_number }}</div>
              </div>
              <div class="appInfo">
                <div>
                  <el-icon> <Timer /> </el-icon>申请时间
                </div>
                <div>{{ item.app_time_start }}</div>
              </div>
              <el-button text type="primary" @click="toDetail(item)"
                >查看详情</el-button
              >
            </el-card>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import BScroll from "better-scroll";


export default {
  name: "MAppOn",
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,
      loading: false,
      isEmpty: false,
      app_list: [],
    };
  },
  setup() {
    const mainBody = ref(null);
    const scrollbarHeight = ref();
    onMounted(() => {
      scrollbarHeight.value = mainBody.value.offsetHeight - 7; //减去padding
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
  created() {
    this.getAllApp();
  },

  watch: {
    //当使用模拟数据时，在渲染页面的时候就获得了模拟数据，然后调用就可以滚动了
    //当使用异步数据时，在数据发生变化的时候，就调用函数里面的$nextTick，然后进行刷新滚动的方法
    app_list: function () {
      this.$nextTick(() => {
        this.bs.refresh()
      })
    }
  },

  mounted() {
    let wrapper = this.$refs.wrapper;
    this.bs = new BScroll(wrapper, {
      scrollY: true,//纵向鼠标滚动
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
      this.getAllApp();
      this.bs.finishPullDown();
    },

    goBack() {
      this.$router.go(-1);
    },
    //获取所有申请
    async getAllApp() {
      this.loading = true;
      const { data: res } = await this.$http.get("api/applications/handling");
      if (!res.flag) return this.$message.error("获取申请信息失败：" + res.msg);
      this.app_list = res.data;

      this.app_list.forEach((app) => {
        let title = app.flowstate_title_copy;
        app.state_name = this.$store.getters.flowState[title];
        app.app_time_start = app.app_time_start.replace("T", " ");
      });
      if (this.app_list.length === 0) this.isEmpty = true;
      this.loading = false;
    },
    toDetail(item) {
      //路由传参，删除会导致detail接受不到app_id
      if (this.$route.path.split("/").reverse()[0].substring(0, 2) !== "m_") {
        this.$router.push({
          name: "appdetail",
          params: {
            app_id: item.app_id,
          },
        });
      } else if (
        this.$route.path.split("/").reverse()[0].substring(0, 2) === "m_"
      ) {
        this.$router.push({
          name: "m_appdetail",
          params: {
            app_id: item.app_id,
          },
        });
      }
    },
  },
};
</script>

<style scoped>
.scrollbarWrap {
  flex-grow: 1;
  padding-top: 6px;
}


.card {
  margin-bottom: 6px;
  min-width: 350px;
}

.appInfo {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 14px;
}
.appInfo > div:first-child {
  width: 90px;
  text-align: left;
  color: rgb(189, 189, 189);
}
.card_head {
  display: flex;
  justify-content: space-between;
}
.head_type {
  font-size: 16px;
  font-weight: bolder;
}

.app_state {
  font-weight: 18px;
  font-weight: bolder;
  color: #337ecc;
}
</style>