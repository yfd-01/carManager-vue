<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="充值统计"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="充值统计" />
    <div
      class="main-header"
      :class="[isMobile ? 'main-header-mobile' : 'main-header-pc']"
    >
      <div class="main-header-content">
        <keep-alive>
          <UnitTree @getUnitInfo="getUnitInfo" />
        </keep-alive>
        <CarChoice
          :getCarId="getCarId"
          :selectedUnitId="selectedUnitId"
          style="min-width: 120px"
        />
      </div>
      <div class="main-header-content">
        <el-date-picker
          v-model="TimeFilter"
          type="daterange"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
        <el-button
          type="primary"
          style="margin-left: 3px"
          @click="searchApp"
          :disabled="searchBtnDisabled"
          >查询</el-button
        >
        <el-button
          type="primary"
          @click="exportApp"
          style="margin-left: 3px"
          :disabled="exportBtnDisabled"
          >导出</el-button
        >
      </div>
    </div>
    <div class="tableWrap" ref="tableWrap">
      <div class="wrapper" ref="wrapper" :style="{ height: tableHeight - 2 + 'px' }">
        <el-table
          :data="list"
          :height="tableHeight"
          :cell-style="{ padding: '0px' }"
          :header-row-style="{ height: '40px' }"
          :row-style="{ height: (tableHeight - 40) / pageSize + 'px' }"
          v-loading="dataLoading"
          :element-loading-text="loadingText"
        >
          <el-table-column type="index" prop="type" label="序号" width="60px" />
          <el-table-column prop="appPerson" label="申请人" show-overflow-tooltip width="90px" />
          <el-table-column prop="palteNumber" label="车牌号" show-overflow-tooltip width="120px" />
          <el-table-column
            prop="appEnd"
            label="完成时间"
            show-overflow-tooltip
            width="120px"
          />
          <el-table-column
            prop="cardNumber"
            label="加油卡号"
            show-overflow-tooltip
            width="120px"
          />
          <el-table-column
            prop="rcCost"
            label="充值金额(元)"
            show-overflow-tooltip
            width="120px"
          />
          <el-table-column prop="rcMemo" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" align="center" show-overflow-tooltip width="80px">
            <template #default="scope">
              <el-button
                text
                type="primary"
                size="small"
                style="margin: 0 ; padding: 0"
                @click="jumpToDetail(scope.$index, scope.row)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="page" ref="bottomPage">
      <el-pagination
        v-if="totalNum"
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :total="totalNum"
        @current-change="pageChange"
        :disabled="paginationDisabled"
      />
    </div>
  </div>
</template>

<script>
import UnitTree from "@/components/common/UnitTree";
import CarChoice from "@/views/unitsummary/components/CarChoice.vue";
import { onMounted, ref } from "vue";
import BScroll from "better-scroll";

export default {
  name: "RechargeSum",
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,

      selectedUnitId: -1,

      list: [],
      searchText: "",
      oldSearchText: "",

      dataLoading: false,
      loadingText: "",

      pageSize: 14,
      currentPage: 1,
      totalNum: 0,

      TimeFilter: [],
      car_id: "",

      searchBtnDisabled: false,
      exportBtnDisabled: false,
      paginationDisabled: false,
    };
  },
  setup() {
    const tableWrap = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = tableWrap.value.offsetHeight;
    });
    return {
      tableWrap,
      tableHeight,
    };
  },
  components: {
    UnitTree,
    CarChoice,
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
      this.loadApps();
      this.bs.finishPullDown();
    },

    //从子组件获取car_id
    getCarId(car_id) {
      this.car_id = car_id;
    },
    async searchApp() {
      this.searchBtnDisabled = true;
      await this.loadApps(0);
      this.searchBtnDisabled = false;
    },
    async exportApp() {
      this.exportBtnDisabled = true;
      this.loadingText = "Excel文件生成中...";
      await this.loadApps(1);

      this.exportBtnDisabled = false;
    },

    getUnitInfo(data) {
      this.selectedUnitId = data.unit_id;
      this.loadApps(0);
    },

    async loadApps(isExport) {
      // return;
      if (this.selectedUnitId === -1) return;

      this.dataLoading = true;
      this.loadingText = null;

      if (!this.TimeFilter) this.TimeFilter = [];

      const { data: res } = await this.$http.get(
        `/api/applications/types_sum/${this.selectedUnitId}`,
        {
          params: {
            // query: this.searchText === "" ? null : this.searchText,
            type_id: 2,
            start_time: this.TimeFilter[0],
            end_time:
              this.TimeFilter[1] === undefined
                ? undefined
                : this.TimeFilter[1] + " 23:59:59",
            is_export: isExport,
            car_id: this.car_id,
            offset: this.pageSize * (this.currentPage - 1),
            limit: this.pageSize,
          },
        }
      );
      this.dataLoading = false;
      if (!res.flag) {
        if (res.errCode === 104) this.$message.error("无权访问");
        await this.$router.push({ name: "dashboard" });
        return;
      }
      if (!isExport) {
        this.list = res.data.map((app) => {
          return {
            appId: app.app_id,
            typeId: app.type_id,
            appPerson: app.name_copy,
            palteNumber: app.car.palte_number,
            appEnd: app.app_time_end.replace("T", " "),
            cardNumber: app.car.card_number,

            rcMemo: app.data.rc_memo,
            rcCost: app.data.rc_value,
          };
        });

        this.totalNum = res.total;
      } else if (isExport) {
        if (res.path) {
          window.open(`${this.$http.defaults.baseURL}${res.path}`, "_blank");
        } else this.$message.error("下载失败: " + res.msg);
      }
    },
    // getSummaries(param) {
    //   const { columns, data } = param;
    //   const sums = [];
    //   columns.forEach((column, index) => {
    //     if (index === 0) {
    //       sums[index] = "合计";
    //     } else if (index !== 5) {
    //       sums[index] = "";
    //     } else {
    //       const values = data.map((item) => Number(item[column.property]));
    //       if (!values.every((value) => isNaN(value))) {
    //         sums[index] = values.reduce((prev, curr) => {
    //           const value = Number(curr);
    //           if (!isNaN(value)) {
    //             return prev + curr;
    //           } else {
    //             return prev;
    //           }
    //         }, 0);
    //         sums[index] = parseFloat(sums[index]).toFixed(2);
    //         sums[index] += " 元";
    //       }
    //     }
    //   });
    //   return sums;
    // },
    async pageChange(current_page) {
      this.paginationDisabled = true;

      this.currentPage = current_page;
      await this.loadApps();

      this.paginationDisabled = false;
    },
    goBack() {
      this.$router.go(-1);
    },
    jumpToDetail(index, row) {
      this.$router.push({
        name: "detail",
        query: {
          app_id: row.appId,
          detail_type: row.typeId,
          is_summary: 1,
          is_done: "已完成",
        },
      });
    },
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    isDisable(index, row) {
      return false;
    },
  },
};
</script>

<style scoped>
.main-header {
  margin-top: 6px;
  display: flex;
}

.main-header-pc {
  flex-direction: row;
}

.main-header-mobile {
  flex-direction: column;
}

.main-header-content {
  display: flex;
  flex-direction: row;
  margin-bottom: 1px;
}

.tableWrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 5px;
  background-color: #fff;
  border-radius: 3px;
}

.wrapper {
  overflow: hidden;
}

.selectedClass {
  min-width: 100px;
}

.searchInput {
  max-width: 240px;
  min-width: 240px;
  border-radius: 3px;
}
</style>