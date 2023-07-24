<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="加油统计"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="加油统计" />
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
          style="min-width: 100px"
        />
        <el-select
          v-model="ref_self"
          placeholder="加油对象"
          style="min-width: 100px;max-width: 100px"
        >
          <el-option
            v-for="item in refSelf"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="main-header-content">
        <el-date-picker
          :style="{ 'max-width': isMobile ? '100%' : '240px' }"
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
          @click="searchApp"
          style="margin-left: 3px"
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
        <el-table-column type="index" prop="type" label="序号" show-overflow-tooltip width="60px" />
        <el-table-column prop="appPerson" label="申请人" show-overflow-tooltip width="90px" />
        <el-table-column prop="palteNumber" label="车牌号" show-overflow-tooltip width="120px" />
        <el-table-column
          prop="appEnd"
          label="完成时间"
          width="120px"
          show-overflow-tooltip
        />
        >
        <el-table-column
          prop="cardNumber"
          label="加油卡号"
          show-overflow-tooltip
          width="120px"
        />
        <el-table-column
          prop="refAddr"
          label="加油地点"
          show-overflow-tooltip
          width="120px"
        />
        <el-table-column prop="refPrice" label="单价(元/升)" show-overflow-tooltip width="120px" />
        <el-table-column prop="refVolume" label="加油量(升)" show-overflow-tooltip width="120px" />
        <el-table-column prop="refCost" label="消费金额(元)" show-overflow-tooltip width="120px" />
        <el-table-column prop="refMile" label="里程表(公里)" show-overflow-tooltip width="120px" />
        <el-table-column prop="refSelf" label="加油对象" show-overflow-tooltip width="120px" />
        <el-table-column
          prop="refMemo"
          label="备注"
          show-overflow-tooltip
          min-width="120px"
        />
        <el-table-column label="操作" align="center" show-overflow-tooltip width="80px">
          <template #default="scope">
            <el-button
              text
              type="primary"
              size="small"
              style="margin: 0; padding: 0"
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
  name: "RefuelSum",
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

      ref_self: 1,
      refSelf: [
        {
          label: "本车加油",
          value: 1,
        },
        {
          label: "其它加油",
          value: 0,
        },
        {
          label: "所有加油",
          value: -1,
        },
      ],

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
      click:true,
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

      if(!this.TimeFilter) this.TimeFilter = [];

      const { data: res } = await this.$http.get(
        `/api/applications/types_sum/${this.selectedUnitId}`,
        {
          params: {
            // query: this.searchText === "" ? null : this.searchText,
            type_id: 3,
            start_time: this.TimeFilter[0],
            end_time: this.TimeFilter[1] === undefined ? undefined : this.TimeFilter[1] + " 23:59:59",
            is_export: isExport,
            car_id: this.car_id,
            ref_self: this.ref_self,
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
            cardNumber:app.car.card_number,

            refAddr: app.data.ref_addr,
            refVolume: app.data.ref_volume,
            refPrice: app.data.ref_price,
            refMemo: app.data.ref_memo,
            refCost: app.data.ref_cost,
            refMile: app.data.ref_mile,
            refSelf: app.data.ref_self == 1 ? '本车': '其它',
          };
        });

        this.totalNum = res.total
      } else if (isExport) {
        if (res.path) {
          window.open(`${this.$http.defaults.baseURL}${res.path}`, "_blank");
        } else this.$message.error("下载失败: " + res.msg);
      }
    },
    // getSummaries(param) {
    //   const { columns, data } = param;
    //   const sums = [];
    //   let usedFuel = 0; //已使用的油料
    //   let averageFuel = 0; //平均油耗，每百公里
    //   columns.forEach((column, index) => {
    //     if (index === 0) {
    //       sums[index] = "合计";
    //     } else if (index == 8) {
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
    //     } else if (index == 7) {
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
    //         usedFuel = sums[index] - Number(values.pop()); //使用了多少升
    //         sums[index] = parseFloat(sums[index]).toFixed(2);
    //         sums[index] += " 升";
    //       }
    //     } else if (index == 8) {
    //       const values = data.map((item) => Number(item[column.property]));
    //       if (values.length > 1 && this.ref_self == 1 && this.car_id != "") {
    //         let last = Number(values.pop());
    //         let first = Number(values[0]);
    //         if (!isNaN(last) && !isNaN(first)) {
    //           sums[index] = last - first;
    //           averageFuel = parseFloat((usedFuel * 100) / sums[index]).toFixed(
    //             1
    //           );

    //           sums[index] = parseFloat(sums[index]).toFixed(1) + "公里";
    //         } else {
    //           sums[index] = "";
    //         }
    //       } else {
    //         sums[index] = "";
    //       }
    //     } else if (index == 9) {
    //       if (averageFuel > 0) sums[index] = averageFuel + "升/百公里";
    //       else sums[index] = "";
    //     } else {
    //       sums[index] = "";
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