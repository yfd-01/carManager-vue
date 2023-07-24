<template>
  <el-card class="card" shadow="never">
    <template #header>
      <div class="card_head">
        <div class="sketchHeaderTitle">
          <slot name="title"></slot>
        </div>
        <div class="sketchHeaderType">
          <slot name="type"></slot>
        </div>
      </div>
    </template>

    <div class="sketchBody">
      <div class="sketchBodyRow">
        <div class="sketchBodyRowIcon">
          <el-icon><user /></el-icon>
          申请人
        </div>
        <slot name="appPerson"></slot>
      </div>

      <div class="sketchBodyRow">
        <div class="sketchBodyRowIcon">
          <el-icon><van /></el-icon>
          申请车辆
        </div>
        <slot name="appVehicle"></slot>
      </div>

      <div class="sketchBodyRow">
        <div class="sketchBodyRowIcon">
          <el-icon><timer /></el-icon>
          申请时间
        </div>
        <slot name="appTime"></slot>
      </div>

      <el-button text type="primary" @click="jumpToDetail">查看详情</el-button>
    </div>
  </el-card>
</template>


<script setup>
import { User, Van } from "@element-plus/icons-vue";
</script>

<script>
export default {
  name: "AppItemSketch",
  props: ["appId", "detailType"],
  computed: {},
  methods: {
    jumpToDetail() {
      this.$router.push({
        name: "approvalDetail",
        query: {
          app_id: this.appId,
          detail_type: this.detailType,
          is_summary: 0,
        },
      });
    },
  },
};
</script>

<style scoped>
.el-card {
  margin-bottom: 6px;
  min-width: 350px;
  width: 100%;
}

.card_head {
  display: flex;
  justify-content: space-between;
}

.sketchHeaderTitle {
  font-size: 16px;
  font-weight: bolder;
}

.sketchHeaderType {
  font-size: 18px;
  font-weight: bolder;
  color: rgb(69, 130, 211);
}

.sketchBodyRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 14px;
}

.sketchBodyRowIcon {
  width: 90px;
  text-align: left;
  color: rgb(189, 189, 189);
}
</style>