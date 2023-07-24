<template>
  <el-page-header
    v-if="isMobile"
    title="后退"
    content="已完成"
    @back="goBack"
  />
  <el-page-header v-else icon="house" title="已完成" />
  <el-empty description="暂无数据" v-if="isEmpty" />
  <template v-else>
    <div class="tableWrap" ref="tableWrap">
      <div
        class="wrapper"
        ref="wrapper"
        :style="{ height: tableHeight - 2 + 'px' }"
      >
        <el-table
          :height="tableHeight"
          :data="app_list"
          :cell-style="{ padding: '0px' }"
          :header-row-style="{ height: '40px' }"
          :row-style="{ height: (tableHeight - 40) / pageSize + 'px' }"
          v-loading="loading"
        >
          <el-table-column
            label="申请类型"
            prop="type_memo"
            show-overflow-tooltip
            width="100px"
          />
          <el-table-column
            label="处理结果"
            prop="result"
            show-overflow-tooltip
            width="80px"
          />
          <el-table-column
            label="申请人"
            prop="name_copy"
            show-overflow-tooltip
            width="80px"
          />
          <el-table-column
            label="申请车辆"
            prop="palte_number"
            show-overflow-tooltip
            width="120px"
          />
          <el-table-column
            label="完成时间"
            prop="app_time_end"
            show-overflow-tooltip
          />
          <el-table-column label="详情" show-overflow-tooltip width="60px">
            <template #default="scope">
              <el-button
                size="small"
                style="margin: 0; padding: 0"
                text
                type="primary"
                @click="toDetail(scope.row)"
                >查看</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 分页区域 -->
    <div class="page">
      <el-pagination
        v-if="showpage"
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :total="totalNum"
        @current-change="pageChange"
      />
    </div>
  </template>
</template>

<script>
import { ref, onMounted } from "vue";
import BScroll from "better-scroll";

export default {
  name: "MAppDone",
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,

      loading: false,
      isEmpty: false,
      app_list: [],
      // 分页
      showpage: false,
      pageSize: 12,
      currentPage: 1,
      totalNum: 0, //总数据条数
    };
  },

  setup() {
    const tableWrap = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = tableWrap.value.offsetHeight - 8; //减去padding
    });
    return {
      tableWrap,
      tableHeight,
    };
  },

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  activated() {
    this.getAllApp();
  },

  watch: {
    //当使用模拟数据时，在渲染页面的时候就获得了模拟数据，然后调用就可以滚动了
    //当使用异步数据时，在数据发生变化的时候，就调用函数里面的$nextTick，然后进行刷新滚动的方法
    app_list: function () {
      this.$nextTick(() => {
        this.bs.refresh();
      });
    },
  },

  mounted() {
    let wrapper = this.$refs.wrapper;
    this.bs = new BScroll(wrapper, {
      click: true,
      eventPassthrough: "horizontal",
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
    //获取申请信息
    async getAllApp() {
      this.loading = true;
      const { data: res } = await this.$http.get("api/applications/done", {
        params: {
          offset: this.pageSize * (this.currentPage - 1),
          limit: this.pageSize,
        },
      });
      this.loading = false;

      if (!res.flag) return this.$message.error("获取已完成申请失败！");
      this.app_list = res.data.rets;

      // 如果长度为空
      if (this.app_list.length === 0) return (this.isEmpty = true);
      // 页码处理 待修改
      this.totalNum = res.data.total;
      this.showpage = true;

      res.data.rets.forEach((app) => {
        app.app_time_end = app.app_time_end.replace("T", " ");
        if (app.flowstate_title_copy == "WITHDRAW") app.result = "撤回";
        else if (app.flowstate_title_copy == "DONE") app.result = "通过";
      });
    },
    pageChange(current_page) {
      this.currentPage = current_page;
      this.getAllApp();
    },
    toDetail(item) {
      this.$router.push({
        name: "appdetail",
        params: {
          app_id: item.app_id,
        },
      });
    },
  },
};
</script>

<style scoped>
.tableWrap {
  flex-grow: 1;
  padding-top: 6px;
}

.wrapper {
  height: 10px;
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
  color: rgb(69, 130, 211);
}
</style>