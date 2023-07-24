<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="所有申请"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="所有申请" />
    <div
      class="main-header"
      :class="[isMobile ? 'main-header-mobile' : 'main-header-pc']"
    >
      <div class="main-header-content">
        <!-- UnitTree组件有activated回调函数， 使得使用keepalive的组件在切换回来的时候可以激活-->
        <keep-alive>
          <UnitTree @getUnitInfo="getUnitInfo" />
        </keep-alive>
        <el-select
          class="selectedClass"
          v-model="selectedTypeId"
          placeholder="申请类型"
          :style="{ width: isMobile ? '100px' : '10%' }"
          @change="typeChange"
        >
          <el-option
            v-for="item in typeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="main-header-content">
        <el-input
          class="searchInput"
          placeholder="搜索"
          v-model.trim="searchText"
          @keyup.enter="searchApp"
          :disabled="selectedUnitId === -1"
        />
        <el-button
          :disabled="searchBtnDisabled"
          type="primary"
          @click="searchApp"
          style="margin-left: 3px"
          >搜索</el-button
        >
      </div>
    </div>
    <div class="tableWrap" ref="tableWrap">
      <div
        class="wrapper"
        ref="wrapper"
        :style="{ height: tableHeight - 2 + 'px' }"
      >
        <el-table
          :data="list"
          :height="tableHeight"
          :cell-style="{ padding: '0px' }"
          :header-row-style="{ height: '40px' }"
          :row-style="{ height: (tableHeight - 40) / pageSize + 'px' }"
          v-loading="dataLoading"
          :element-loading-text="loadingText"
        >
          <el-table-column
            prop="appPerson"
            label="申请人"
            show-overflow-tooltip
            width="80px"
          />
          <el-table-column
            prop="title"
            label="申请类型"
            show-overflow-tooltip
            width="90px"
            v-if="!isMobile"
          />
          <el-table-column
            prop="appTime"
            label="申请时间"
            show-overflow-tooltip
          />
          <el-table-column
            prop="stateName"
            label="状态"
            width="100px"
            show-overflow-tooltip
            :filters="[
              { text: '已完成', value: '已完成' },
              { text: '待审核', value: '待审核' },
              { text: '申请被驳回', value: '申请被驳回' },
              { text: '待批准', value: '待批准' },
              { text: '待上传资料', value: '待上传资料' },
              { text: '待查验资料', value: '待查验资料' },
              { text: '待完善资料', value: '待完善资料' },
              { text: '撤回', value: '撤回' },
            ]"
            :filter-method="filterHandler"
          />

          >
          <el-table-column
            prop="appVehicle[1]"
            label="车牌号"
            width="120px"
            show-overflow-tooltip
          />
          <el-table-column
            prop="appVehicle[0]"
            label="车辆品牌"
            width="120px"
            show-overflow-tooltip
            v-if="!isMobile"
          />
          <el-table-column
            prop="appVehicle[2]"
            label="车辆类型"
            width="100px"
            show-overflow-tooltip
            v-if="!isMobile"
          />
          <el-table-column
            prop="appQuick"
            label="快速申请"
            width="80px"
            show-overflow-tooltip
          />
          <el-table-column
            label="操作"
            align="center"
            show-overflow-tooltip
            width="100px"
          >
            <template #default="scope">
              <el-button
                text
                type="primary"
                size="small"
                style="margin: 0 6px 0 0; padding: 0"
                @click="jumpToDetail(scope.$index, scope.row)"
                >详情</el-button
              >
              <el-button
                text
                type="primary"
                size="small"
                style="margin: 0; padding: 0"
                :disabled="scope.row.stateName === '已完成' ? false : true"
                @click="printApp(scope.$index, scope.row)"
                >下载</el-button
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
import { onMounted, ref } from "vue";
import BScroll from "better-scroll";

export default {
  name: "ApplicationSum",
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,

      selectedUnitId: -1,
      selectedTypeId: 0,
      typeList: [
        { label: "所有类型", value: 0 },
        { label: "保养申请", value: 1 },
        { label: "充值申请", value: 2 },
        { label: "加油申请", value: 3 },
        { label: "维修申请", value: 4 },
      ],

      list: [],
      searchText: "",
      oldSearchText: "",

      dataLoading: false,
      loadingText: "",

      pageSize: 14,
      currentPage: 1,
      totalNum: 0,

      searchBtnDisabled: false,
      paginationDisabled: false,
    };
  },
  setup() {
    const tableWrap = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = tableWrap.value.offsetHeight - 2;
    });
    return {
      tableWrap,
      tableHeight,
    };
  },
  components: {
    UnitTree,
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

    async searchApp() {
      let searchText = this.searchText.trim();
      if (this.oldSearchText === searchText) return;

      this.searchBtnDisabled = true;
      await this.loadApps();
      this.searchBtnDisabled = false;
    },

    getUnitInfo(data) {
      this.selectedUnitId = data.unit_id;
      this.loadApps();
    },

    typeChange(val) {
      this.selectedTypeId = val;
      this.loadApps();
    },
    async loadApps() {
      if (this.selectedUnitId === -1) return;

      this.dataLoading = true;
      this.loadingText = null;
      const { data: res } = await this.$http.get(
        `/api/applications/app_sum/${this.selectedUnitId}`,
        {
          params: {
            query: this.searchText === "" ? null : this.searchText,
            type_id: this.selectedTypeId,
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

      this.list = res.data.map((app) => {
        return {
          title: app.type_memo,
          stateName: this.$store.getters.flowState[app.flowstate_title_copy],
          appPerson: app.name_copy,
          appVehicle: [app.car_brand, app.palte_number, app.car_type],
          appTime: app.app_time_start.replace("T", " "),
          appId: app.app_id,
          typeId: app.type_id,
          appQuick: app.app_quick == 0 ? "否" : "是",
        };
      });
      this.totalNum = res.total;

      if (this.searchText !== null) {
        this.oldSearchText = this.searchText;
      }
    },

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
          is_done: row.stateName,
        },
      });
    },

    filterHandler(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    async printApp(index, row) {
      this.dataLoading = true;
      this.loadingText = "打印文件生成中...";

      const { data: res } = await this.$http.get(
        `api/applications/app_print/${row["appId"]}`
      );

      this.dataLoading = false;

      if (res.flag) {
        window.open(`${this.$http.defaults.baseURL}${res.path}`, "_blank");
      } else this.$message.error("下载失败: " + res.msg);
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
}

.tableWrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
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