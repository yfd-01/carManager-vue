<template>
  <div class="app-container" v-loading="loading">
    <div class="mainBody" ref="mainBody">
      <div
        class="wrapper"
        ref="wrapper"
        :style="{ height: bodyHeight - 1 + 'px' }"
      >
        <div class="content">
          <div class="welcome_name">
            <span>{{ welcomeName }}</span>
          </div>

          <div class="welcome_id">
            <span>{{ welcomeIdentify }}</span>
          </div>
          <div class="tips" v-if="total <= 0">您当前没有任务需要处理</div>
          <div class="tips" v-if="total > 0">
            您当前有{{ total }}个任务，
            <el-button text type="primary" @click="toProcessApp"
              >点击此处处理</el-button
            >
          </div>
          <div class="pic-wrap">
            <svg-icon icon-class="bigcar" class="dashboard_pic"></svg-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import BScroll from "better-scroll";

export default {
  name: "Dashboard",
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,
      init_total: 0,
      loading: false,
      total: null,
    };
  },

  setup() {
    const mainBody = ref(null);
    const bodyHeight = ref();
    onMounted(() => {
      bodyHeight.value = mainBody.value.offsetHeight; //
    });
    return {
      mainBody,
      bodyHeight,
    };
  },

  watch: {},

  computed: {
    welcomeName() {
      return "欢迎" + this.$store.getters.userInfo.name;
    },
    welcomeIdentify() {
      return (
        "您的身份是" +
        this.$store.getters.userInfo.unit_name +
        "的" +
        this.$store.getters.userInfo.role_memo
      );
    },
  },

  mounted() {
    let wrapper = this.$refs.wrapper;
    this.bs = new BScroll(wrapper, {
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
    callJsFunction(str) {
      let token = window.localStorage.getItem('token');
      if(token == null) return -1;//如果没有登录，返回-1

      this.getAllApp();
      return this.init_total;
    },
    callJsBaseUrl(str){//安卓调用baseurl
      return this.$http.defaults.baseURL;
    },    

    pullDown() {
      this.getAllApp();
      this.bs.finishPullDown();
    },

    toProcessApp() {
      this.$router.push({
        name: "processApp",
      });
    },
    //获取所有申请
    async getAllApp() {
      this.loading = true;
      const { data: res } = await this.$http.get("api/applications/todoList", {
        params: {
          car_need: 0,
        },
      });
      if (!res.flag) return this.$message.error("获取待办任务失败：" + res.msg);
      this.app_list = res.data;
      this.total = this.app_list.length;
      this.init_total = this.total;
      this.loading = false;
    },
  },

  created() {
    window.callJsFunction = this.callJsFunction;
    window.callJsBaseUrl = this.callJsBaseUrl;
    if (!this.$store.getters.isMobile) {
      this.getAllApp();
    }
  },

  activated() {
    this.getAllApp();
  },
};
</script>

<style scoped>
.mainBody {
  flex-grow: 1;
}

.wrapper {
  overflow: hidden;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1px;

  background-color: #fff;
}

.welcome_name {
  padding: 28px;
  font-size: 14pt;
  color: grey;
}

.welcome_id {
  margin: 12px 32px;
  font-size: 12pt;
  color: grey;
}

.tips {
  margin: 12px 32px;
  font-size: 12pt;
  color: grey;
}

.pic-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dashboard_pic {
  margin: auto 0 120px 0;
  width: 40%;
  height: 30%;
}
</style>