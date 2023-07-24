<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="车辆管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="车辆管理" />
    <div :class="[isMobile ? 'main-header-mobile' : 'main-header-pc']">
      <div class="main-header-content">
        <keep-alive>
          <UnitTree @getUnitInfo="getUnitInfo" />
        </keep-alive>

        <el-button
          class="newBtn"
          type="primary"
          @click="newVehicle()"
          v-if="showNewBtn"
          >添加车辆</el-button
        >
      </div>

      <div class="main-header-content" v-if="showSearch">
        <el-input
          class="searchInput"
          placeholder="全局搜索车牌号码"
          v-model.trim="inputSearch"
          clearable
        />
        <el-button type="primary" class="newBtn" @click="searchCar"
          >搜索车辆</el-button
        >
      </div>
    </div>
    <div class="tableWrap" ref="tableWrap">
      <div class="wrapper" ref="wrapper" :style="{ height: tableHeight - 2 + 'px' }">
        <el-table
          :data="tableData"
          :height="tableHeight"
          :cell-style="{ padding: '0px' }"
          :header-row-style="{ height: '40px' }"
          :row-style="{ height: (tableHeight - 40) / pageSize + 'px' }"
          v-loading="loading"
        >
          <el-table-column prop="palte_number" label="车辆牌号" width="120px" />
          <el-table-column prop="car_type" label="车辆类型" width="100px" />
          <el-table-column prop="car_brand" label="车辆品牌" width="90px" />
          <el-table-column prop="card_number" label="加油卡号" width="120px" />
          <el-table-column
            prop="capital_balance"
            label="油卡余额(元)"
            width="110px"
          />
          <el-table-column prop="gas_type" label="油品型号" width="90px" />
          <el-table-column
            prop="tank_capacity"
            label="油箱容积(升)"
            width="110px"
          />

          <el-table-column
            prop="car_state"
            :formatter="judgeState"
            label="车辆状态"
            width="90px"
          />
          <el-table-column
            v-if="isSystem"
            prop="unit_id"
            label="所属单位"
            width="90px"
          />
          <el-table-column
            prop="car_memo"
            label="备注"
            min-width="90px"
            show-overflow-tooltip
          />
          <el-table-column label="操作" width="120px" v-if="showOperation">
            <template #default="scope">
              <el-button
                size="small"
                style="margin: 0; padding: 0"
                text
                type="primary"
                @click="handleEdit(scope.$index, scope.row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                style="margin: 0 6px; padding: 0"
                text
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="page" ref="bottomPage">
      <el-pagination
        v-if="showpage"
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :total="totalNum"
        @current-change="pageChange"
        :disabled="paginationDisabled"
      />
    </div>
    <VehicleEdit
      :form="rowObj"
      :dlgVehicleEdit="dlgVehicleEdit"
      @updateVehicle="getUnitCar"
      @dlgClosed="dlgEditClosed"
    />

    <VehicleAdd
      :detail="detail"
      :dlgVehicleAdd="dlgVehicleAdd"
      @updateVehicle="getUnitCar"
      @dlgClosed="dlgAddClosed"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import UnitTree from "@/components/common/UnitTree";
import VehicleAdd from "./VehicleAdd.vue";
import VehicleEdit from "./VehicleEdit.vue";
import BScroll from "better-scroll";

export default {
  name: "VehicleAll",
  components: { UnitTree, VehicleAdd, VehicleEdit },
  props: {},

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

  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,

      loading: false,
      showpage: false,
      pageSize: 14,
      currentPage: 1,
      totalNum: 0, //总数据条数
      showNewBtn: false,
      unit_id: 0,
      unit_name: "",
      inputSearch: "",
      detail: {}, //给新增车辆子组件传递的对象
      rawData: [], //车辆信息原始数组
      tableData: [], //在页面显示的车辆信息数组(车辆状态内容不同了)
      rowObj: {}, //车辆信息原始数组所在编辑行的原始对象
      dlgVehicleAdd: false,
      dlgVehicleEdit: false,
      paginationDisabled: false,
    };
  },

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    showSearch() {
      if (this.$store.getters.userRole === "system") return true;
    },
    showOperation() {
      if (
        this.$store.getters.userRole === "system" ||
        this.$store.getters.userRole === "unit_manager"
      )
        return true;
    },
    isSystem() {
      return this.$store.getters.userRole === "system";
    },
  },

    watch: {
    //当使用模拟数据时，在渲染页面的时候就获得了模拟数据，然后调用就可以滚动了
    //当使用异步数据时，在数据发生变化的时候，就调用函数里面的$nextTick，然后进行刷新滚动的方法
    tableData: function () {
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
      this.getUnitCar();
      this.bs.finishPullDown();
    },

    goBack() {
      this.$router.go(-1);
    },

    /*********************************************************
     *@Description: 增加车辆对话框打开和关闭
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-25 20:13:53
     ***********************************************************/
    newVehicle() {
      // 初始化车辆信息对象
      this.detail = {
        unit_name: this.unit_name,
        unit_id: this.unit_id,
        car_state: 1,
      };
      this.dlgVehicleAdd = true;
    },
    dlgAddClosed() {
      this.dlgVehicleAdd = false;
      this.detail = {}; //关闭添加车辆对话框后，初始化detail对象为空，再次打开添加车辆的对话框则旧信息不存在
    },

    /*********************************************************
     *@Description:编辑车辆对话框打开和关闭
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-25 20:14:20
     ***********************************************************/
    handleEdit(index, row) {
      this.rowObj = this.rawData[index];
      this.dlgVehicleEdit = true;
    },
    handleDelete(index, row) {
      this.$confirm("此操作将从本单位删除该车辆, 是否继续?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        //确定删除
        this.postDelete(index, row);
      });
    },
    async postDelete(index, row) {
      this.loading = true;
      const { data: res } = await this.$http.delete("api/cars/" + row.car_id);
      this.loading = false;
      if (res.flag !== true) this.$message.error("删除车辆失败！" + res.msg);
      else {
        this.getUnitCar();
        this.$message.success("删除车辆成功！");
      }
    },
    dlgEditClosed() {
      this.dlgVehicleEdit = false;
    },

    // 按单位树选择的节点获取车辆信息
    getUnitInfo(data) {
      this.unit_name = data.unit_name;
      this.unit_id = data.unit_id;
      this.inputSearch = ""; //按单位获取车辆信息，清空搜索框

      this.getUnitCar();
      if (this.showOperation) {
        this.showNewBtn = true;
      }
    },

    // 获取单位车辆信息
    async getUnitCar() {
      if (!this.unit_id) return;
      if (this.inputSearch != "") {
        return this.searchCar();
      }

      this.loading = true;
      const { data: res } = await this.$http.get(
        "api/cars/unit/" + this.unit_id,
        {
          params: {
            offset: this.pageSize * (this.currentPage - 1),
            limit: this.pageSize,
          },
        }
      );
      this.loading = false;

      if (!res.flag) return this.$message.error("获取车辆信息失败：" + res.msg);

      this.totalNum = res.data.total;
      this.showpage = true;

      this.rawData = res.data.cars;
      this.tableData = JSON.parse(JSON.stringify(res.data.cars)); //js深度拷贝
    },

    judgeState(data) {
      return data.car_state ? "正常" : "已报废";
    },

    pageChange(current_page) {
      this.paginationDisabled = true;
      this.currentPage = current_page;
      this.getUnitCar();

      this.paginationDisabled = false;
    },

    //
    // 按照车牌号搜索
    //
    searchCar() {
      if (!this.inputSearch) {
        if (!this.unit_id)
          return this.$message.warning("没有选择单位不能空搜索");
        this.getUnitCar();
      } else this.getDataByPlate();
    },

    async getDataByPlate() {
      this.loading = true;

      const { data: res } = await this.$http.get(
        "api/cars/plate/" + this.inputSearch
      );
      this.loading = false;

      if (!res.flag) return this.$message.error("获取车辆数据失败：" + res.msg);
      if (res.data.cars.length === 0) {
        return this.$message.info("没有查询到该车牌号码");
      }
      this.rawData = res.data.cars;
      this.tableData = JSON.parse(JSON.stringify(res.data.cars));
    },
  },
};
</script>

<style scoped>
.main-header-pc {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-header-mobile {
  display: flex;
  flex-direction: column;
}

.main-header-content {
  margin-top: 6px;
  display: flex;
  align-items: center;
}

.tableWrap {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}


/* page样式放在styles/index.scss */

.newBtn {
  margin-left: 6px;
}
.searchInput {
  width: 170px;
}
</style>