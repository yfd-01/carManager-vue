<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="系统日志"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="系统日志" />
    <div class="head-row">
      <el-col :span="30">
        <el-input placeholder="请输入查询内容" v-model.trim="search" clearable />
      </el-col>
      <el-button type="primary" style="margin-left: 6px">查询日志</el-button>
    </div>
    <!-- table表格区域 -->
    <div class="tableWrap" ref="tableWrap" v-loading="loadingStatus">
      <el-table :data="logsList" :height="tableHeight">
        <el-table-column
          label="uurID"
          prop="uur_id"
          width="70px"
        ></el-table-column>
        <el-table-column
          label="操作时间"
          prop="log_time"
          width="160px"
        ></el-table-column>
        <el-table-column
          width="100px"
          label="操作类型"
          prop="log_operation"
          :filters="[
            { text: '添加', value: '添加' },
            { text: '删除', value: '删除' },
            { text: '修改', value: '修改' },
            { text: '打印', value: '打印' },
          ]"
          :filter-method="filterOperation"
        ></el-table-column>
        <el-table-column
          class="content"
          label="操作内容"
          prop="log_content"
          show-overflow-tooltip
        />
        <el-table-column
          label="访问地址"
          prop="log_url"
          width="120px"
        ></el-table-column>
        <el-table-column
          label="是否成功"
          prop="operation_res"
          width="80px"
        ></el-table-column>
      </el-table>
    </div>
    <!-- 分页区域 -->
    <div class="page" ref="bottomPage">
      <el-pagination
        v-if="showpage"
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :total="totalNum"
        @current-change="pageChange"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
export default {
  setup() {
    const tableWrap = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = tableWrap.value.offsetHeight -2;
    });
    return {
      tableWrap,
      tableHeight,
    };
  },

  data() {
    return {
      loadingStatus: false,
      showpage: false,
      pageSize: 20,
      currentPage: 1,
      totalNum: 0, //总数据条数

      search: "",
      // 查询参数对象
      logsList: [],
    };
  },
  created() {
    this.getLogsList();
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async getLogsList() {
      this.loadingStatus = true;
      const { data: res } = await this.$http.get("api/logs/", {
        params: {
          offset: this.pageSize * (this.currentPage - 1),
          limit: this.pageSize,
        },
      });
      this.loadingStatus = false;
      if (!res.flag)
        return this.$message.error("获取日志列表失败:" + res.error);

      this.totalNum = res.data.total;
      this.showpage = true;

      this.logsList = res.data.logs;
    },
    pageChange(current_page) {
      this.currentPage = current_page;
      this.getLogsList();
    },
    filterOperation(value, row) {
      return row.log_operation === value;
    },
  },
};
</script>

<style scoped>
/* 放到style/index.scss */
/* .head-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
} */

.tableWrap {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}
</style>
