<template>
  <div class="tree">
    <el-cascader
      :options="treeData"
      :props="defaultProps"
      :show-all-levels="false"
      v-model="selectedArr"
      @change="handleNodeClick"
      placeholder="请选择单位部门"
      ref="unitCas"
    />
  </div>
</template>

<script>
import pubsub from "pubsub-js";

export default {
  name: "UnitTree", //父组件需要保存units树，需要在父组件展示units的内容

  data() {
    return {
      pubId: "",
      treeData: [],
      selectedArr: [], //保存用户点击过的选项
      defaultProps: {
        checkStrictly: true,
        label: "unit_name",
        value: "unit_id",
        children: "children",
      },
      unit_name: "",
      unit_id: 0,
    };
  },
  methods: {
    // 发布用户点击的租户树节点数据
    handleNodeClick(arr) {
      let unit_name = this.$refs["unitCas"].getCheckedNodes()[0].label; //获取label值
      this.unit_name = unit_name;
      let unit_id = arr[arr.length - 1]; //select的value保存在数组中，第1级选中的value是第0个元素的值
      this.unit_id = unit_id;
      this.selectedArr = arr;

      let unitInfo = { unit_name, unit_id };
      pubsub.publish("unitInfo", unitInfo);

      this.$refs["unitCas"].togglePopperVisible(false);
    },

    //订阅租户树赋值
    handleSubscript(msgName, data) {
      this.treeData = data;

      //如果只有一项，默认选中之
      if (data.length == 1) {
        this.selectedArr = [];
        this.selectedArr.push(data[0].unit_id);

        let unit_name = data[0].unit_name;
        let unit_id = data[0].unit_id;

        // 发布选中的选项
        let unitInfo = { unit_name, unit_id };
        pubsub.publish("unitInfo", unitInfo);
      } else {
        this.selectedArr = [];
        this.selectedArr.push(this.unit_id);

        let unit_name = this.unit_name;
        let unit_id = this.unit_id;

        let unitInfo = { unit_name, unit_id };
        pubsub.publish("unitInfo", unitInfo);
      }
    },
  },

  mounted() {
    //订阅租户树
    this.pubId = pubsub.subscribe("unitTree", this.handleSubscript);
  },
  beforeUnmount() {
    //销毁则取消订阅租户树
    pubsub.unsubscribe(this.pubId);
  },
};
</script>

<style scoped>
.tree {
  min-width: 150px;
  max-width: 150px;
}
</style>