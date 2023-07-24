<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="租户管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="租户管理" />
    <div class="main-header">
      <UnitTree />
      <el-button type="primary" style="margin-left:6px" v-if="showAddRenterBtn" @click="newRenter()"
        >新增租户</el-button
      >
      <el-button type="primary" v-if="showAddUnitBtn" @click="newUnit()"
        >新增部门</el-button
      >
    </div>
    <div class="tableWrap" ref="tableWrap">
      <el-table :height="tableHeight" :data="tableData">
        <el-table-column label="名称" prop="unit_name" width="150px" />
        <el-table-column label="联系人" prop="unit_contact" width="100px" />
        <el-table-column label="电话" prop="unit_tel" width="120px" />
        <el-table-column label="地址" prop="unit_address" width="150px" />
        <el-table-column
          label="状态"
          prop="unit_state"
          width="100px"
          :formatter="judgeState"
        />
        <el-table-column
          label="注册时间"
          prop="unit_regtime"
          width="120px"
          show-overflow-tooltip
        />
        <el-table-column
          label="到期时间"
          prop="rent_expiretime"
          width="120px"
          show-overflow-tooltip
        />
        <el-table-column label="备注" prop="unit_memo" min-width="100px" />
        <el-table-column label="操作" width="60px">
          <template #default="scope">
            <el-button
              size="small"
              style="margin: 0; padding: 0"
              text
              type="primary"
              @click="handleEdit(scope.$index, scope.row)"
              >编辑</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
  <RenterAdd
    :dlgAddVisible="dlgAddRenterVisible"
    @updateUnits="getUnitTree"
    @dlgClosed="dlgAddRenderClosed"
  />
  <RenterEdit
    :detail="rowObj"
    :dlgEditVisible="dlgEditVisible"
    @updateUnits="getUnitTree"
    @dlgClosed="dlgEditClosed"
  />

  <SubUnitAdd
    :parent_name="unit_name"
    :detail="detail"
    :dlgAddVisible="dlgAddUnitVisible"
    @updateUnits="getUnitTree"
    @dlgClosed="dlgAddUnitClosed"
  />
</template>

<script>
import pubsub from "pubsub-js";
import UnitTree from "@/components/home/common/UnitTree.vue";
import RenterEdit from "./RenterEdit.vue";
import RenterAdd from "./RenterAdd.vue";
import SubUnitAdd from "@/views/subunit/SubUnitAdd.vue";

import { ref, onMounted } from "vue";

export default {
  name: "Renter",
  components: { UnitTree, RenterEdit, RenterAdd, SubUnitAdd },

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
      loadingStatus: false,
      showAddRenterBtn: false,
      showAddUnitBtn: false,

      dlgEditVisible: false,
      dlgAddUnitVisible: false,
      dlgAddRenterVisible: false,

      pubId: "",
      unit_id: 0, //所选树节点的unit_id
      unit_name: "", //所选树节点的unit_name
      rawTree: [], //完整公司树的原始数据
      rawData: [], //表格内容的原始数组
      detail: {}, //给新增子组件传递的对象
      rowObj: {}, //单位信息原始数组所在编辑行的原始对象
      tableData: [], //在页面显示的单位信息数组(单位状态内容不同了)
    };
  },

  created() {
    this.pubId = pubsub.subscribe("unitInfo", this.handleSubscript); //获得树上点击的unit_id
    this.getUnitTree(); //查询unitTree
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
    async getUnitTree() {
      const { data: res } = await this.$http.get("api/units/");
      if (!res.flag) return this.$message.error("获取单位信息失败：" + res.msg);
      // this.rawTree = res.data.units; //保存完整公司树
      // 增加一个虚拟的一级单位“所有租户”
      this.rawTree = [
        { unit_name: "所有租户", unit_id: 0, children: res.data.units },
      ];
      pubsub.publish("unitTree", this.rawTree);
    },

    //如果在树指定了一个节点的unit_id，在table显示这个节点的children。递归查找unit_id的children
    filterTree(treeData) {
      if (this.unit_id < 0) return; //未点选树，返回
      treeData.forEach((element) => {
        if (element.unit_id === this.unit_id) {
          this.rawData = element.children; //子公司信息的原始数组
          this.tableData = JSON.parse(JSON.stringify(this.rawData)); //js深度拷贝
          //01状态转换为中文
          // this.tableData.forEach((element) => {
          //   if (element.unit_state === 1) {
          //     element.unit_state = "正常";
          //   } else element.unit_state = "已禁用";
          // });
          return;
        } else if (element.children.length) {
          this.filterTree(element.children);
        }
      });
    },

    judgeState(data) {
      return data.unit_state ? "正常" : "已停用";
    },

    newRenter() {
      this.dlgAddRenterVisible = true;
    },
    dlgAddRenderClosed() {
      this.dlgAddRenterVisible = false;
    },

    newUnit() {
      this.dlgAddUnitVisible = true;
    },

    dlgAddUnitClosed() {
      this.dlgAddUnitVisible = false;
    },

    handleEdit(index, row) {
      this.rowObj = this.rawData[index];
      this.dlgEditVisible = true;
    },
    dlgEditClosed() {
      this.dlgEditVisible = false;
    },

    handleSubscript(msgName, data) {
      //本组件的列表
      this.unit_id = data.unit_id;
      if (data.unit_id === 0) {
        this.showAddRenterBtn = true;
        this.showAddUnitBtn = false;
      } else {
        this.showAddRenterBtn = false;
        this.showAddUnitBtn = true;
      }

      //给新增部门组件传递的对象
      this.unit_name = data.unit_name;
      this.detail.parent_unit_id = data.unit_id;
      this.detail.unit_state = 1;

      //本组件列表过滤选择的部门
      this.filterTree(this.rawTree);
    },
  },
  beforeUnmount() {
    pubsub.unsubscribe(this.pubId);
  },
};
</script>

<style scoped>
.main-header {
  margin-top: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.tableWrap {
  flex-grow: 1;
  margin-top: 6px;
  border-radius: 3px;
}

.btn {
  margin: 0;
  padding: 0;
}
</style>