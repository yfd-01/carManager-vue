<template>
  <div class="tree">
    <el-cascader
      :options="treeData"
      :props="defaultProps"
      v-model="selectedArr"
      :show-all-levels="false"
      @change="handleNodeClick"
      placeholder="请选择单位部门"
      ref="unitCas"
    />
  </div>
</template>

<script>
export default {
  name: "Unit_Tree",
  emits: ["getUnitInfo"],

  data() {
    return {
      treeData: [],
      selectedArr: [], //保存用户点击过的选项
      defaultProps: {
        checkStrictly: true,
        value: "unit_id",
        label: "unit_name",
        children: "children",
      },
    };
  },

  activated() {
    //使用本组件，且使用keepalive的父组件在切换回来的时候可以激活，向父组件发送getUnitInfo信号
    this.getUnitTree()
  },

  methods: {
    //   获取所有单位的树
    async getUnitTree() {
      const { data: res } = await this.$http.get("api/units/");
      if (!res.flag) return this.$message.error("获取单位数据失败：" + res.msg);
      this.treeData = res.data.units;

      //如果只有一项，默认选中之
      if (res.data.units.length === 1) {
        this.selectedArr = [];
        this.selectedArr.push(res.data.units[0].unit_id);

        let unit_name = res.data.units[0].unit_name;
        let unit_id = res.data.units[0].unit_id;

        let unitInfo = { unit_name, unit_id};
        this.$emit("getUnitInfo", unitInfo);
      }
    },

    // 发布用户点击的租户树节点数据
    handleNodeClick(arr) {
      let unit_name = this.$refs["unitCas"].getCheckedNodes()[0].label; //获取label值
      
      let unit_id = arr[arr.length - 1]; //select的value保存在数组中，第1级选中的value是第0个元素的值
      this.selectedArr = arr;

      let unitInfo = { unit_name, unit_id };
      this.$emit("getUnitInfo", unitInfo);

      this.$refs["unitCas"].togglePopperVisible(false);
    },
  },
};
</script>

<style scoped>
.tree {
  min-width: 150px;
  max-width: 150px;
}
</style>