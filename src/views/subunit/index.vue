<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="部门管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="部门管理" />
    <div class="main-header">
      <UnitTree />
      <el-button
        class="newBtn"
        type="primary"
        @click="newUnit()"
        v-if="showNewBtn && showOpe"
        >添加部门</el-button
      >
    </div>
    <div class="table" ref="tableWrap">
      <el-table :data="tableData" :height="tableHeight">
        <el-table-column label="部门名称" prop="unit_name" width="150px" />
        <el-table-column label="联系人" prop="unit_contact" width="100px" />
        <el-table-column label="联系电话" prop="unit_tel" width="120px" />
        <el-table-column
          label="部门地址"
          prop="unit_address"
          width="200px"
          show-overflow-tooltip
        />
        <el-table-column
          label="使用状态"
          prop="unit_state"
          :formatter="judgeState"
          width="100px"
        />
        <el-table-column
          label="备注"
          prop="unit_memo"
          min-width="100px"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="60px" v-if="showOpe">
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
  <!-- 编辑部门信息 -->
  <SubUnitEdit
    :form="rowObj"
    :dlgEditVisible="dlgEditVisible"
    @updateUnits="getUnitTree"
    @dlgClosed="dlgEditClosed"
  />
  <!-- 增加部门，需要将其父部门的信息传过去。增加了部门后，需要调用父组件的getTableData更新树 -->
  <SubUnitAdd
    :parent_name="unit_name"
    :detail="detail"
    :dlgAddVisible="dlgAddVisible"
    @updateUnits="getUnitTree"
    @dlgClosed="dlgAddClosed"
  />
</template>


<script>
import UnitTree from "@/components/home/common/UnitTree.vue";
import SubUnitEdit from "./SubUnitEdit.vue";
import SubUnitAdd from "./SubUnitAdd.vue";
import pubsub from "pubsub-js";
import { ref, onMounted } from "vue";

export default {
  components: { UnitTree, SubUnitEdit, SubUnitAdd },

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
      dlgEditVisible: false,
      dlgAddVisible: false,

      pubId: "",
      showNewBtn: false,
      unit_id: 0, //所选树节点的unit_id
      unit_name: "", //所选树节点的unit_name
      rawTree: [], //完整公司树的原始数据
      rawData: [], //所选单位的子单位信息原始数组
      detail: {}, //给新增子组件传递的对象
      tableData: [], //在页面显示的单位信息数组(单位状态内容不同了)
      rowObj: {}, //单位信息原始数组所在编辑行的原始对象
    };
  },

  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    showOpe() {
      return (
        this.$store.getters.userRole === "unit_manager" ||
        this.$store.getters.userRole === "system"
      );
    },
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    //   获取所有单位的树
    async getUnitTree() {
      const { data: res } = await this.$http.get("api/units/");
      if (!res.flag) return this.$message.error("获取单位信息失败：" + res.msg);
      pubsub.publish("unitTree", res.data.units);
      this.rawTree = res.data.units; //保存完整公司树
    },

    newUnit() {
      //只能给一级租户添加子部门，子部门不能继续添加
      let isFirst = false;
      this.rawTree.forEach((element) => {
        if (element.unit_id === this.unit_id) {
          this.dlgAddVisible = true;
          isFirst = true;
        }
      });
      if (isFirst) return;
      this.$message.warning("只能添加一级部门！");
    },
    dlgAddClosed() {
      this.dlgAddVisible = false;
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

      //给新增部门子组件传递的对象
      this.unit_name = data.unit_name;
      this.detail.parent_unit_id = data.unit_id;
      this.detail.unit_state = 1;

      //本组件列表过滤选择的部门
      this.filterTree(this.rawTree);
      this.showNewBtn = true;
    },

    //如果在树指定了一个节点的unit_id，在table显示这个节点的children。递归查找
    filterTree(treeData) {
      if (!this.unit_id) return;

      treeData.forEach((element) => {
        if (element.unit_id === this.unit_id) {
          this.rawData = element.children; //子公司信息的原始数组
          this.tableData = JSON.parse(JSON.stringify(this.rawData)); //js深度拷贝
          return;
        } else if (element.children.length) {
          this.filterTree(element.children);
        }
      });
    },
    judgeState(data) {
      return data.unit_state ? "正常" : "已停用";
    },
  },

  created() {
    this.pubId = pubsub.subscribe("unitInfo", this.handleSubscript); //获得树上点击的unit_id
    this.getUnitTree(); //查询unitTree
  },

  mounted() {
    this.pubId = pubsub.subscribe("unitInfo", this.handleSubscript);
  },
  beforeUnmount() {
    pubsub.unsubscribe(this.pubId);
  },
};
</script>

<style scoped>
.app-container {
  height: 100%;
}
.main-header {
  margin-top: 6px;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.newBtn{
  margin-left: 6px;
}

.table {
  flex-grow: 1;
  margin-top: 6px;
  border-radius: 3px;
}
</style>