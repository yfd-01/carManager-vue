<template>
  <div class="app-container">
    <el-form
      ref="formName"
      :model="RepairData"
      label-width="110px"
      :rules="rules"
    >
      <el-form-item label="维修项目" prop="rp_item">
        <el-input
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="维修项目"
          v-model.trim="RepairData.rp_item"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>
      <!-- 维修时间 -->
      <el-form-item label="维修时间" prop="rp_time">
        <el-date-picker
          style="width: 100%"
          type="datetime"
          :disabled="isDisabled"
          v-model="RepairData.rp_time"
          placeholder="点击选择时间"
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :editable="false"
        />
      </el-form-item>
      <!-- 维修地点 -->
      <el-form-item label="维修地点" prop="rp_addr">
        <el-input
          class="addrInput"
          type="textarea"
          autosize
          :disabled="isDisabled"
          placeholder="维修地点"
          v-model.trim="RepairData.rp_addr"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>
      <!-- 维修时公里数 -->
      <el-form-item label="里程表(公里)" prop="rp_mile">
        <div class="AppTypeTitle"></div>
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="mileInput"
          :disabled="isDisabled"
          placeholder="当前总里程"
          :precision="1"
          :min="0"
          v-model="RepairData.rp_mile"
        />
      </el-form-item>
      <!-- 维修花费 -->
      <el-form-item label="维修费用(元)" prop="rp_cost">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="costInput"
          :disabled="isDisabled"
          :precision="2"
          :min="0"
          placeholder="维修实付金额"
          v-model="RepairData.rp_cost"
        />
      </el-form-item>
      <el-form-item label="备注" prop="rp_memo">
        <el-input
          class="itemInput"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="备注"
          v-model.trim="RepairData.rp_memo"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AppRepair",
  props: {
    getRepair: Object,
    handleSuccess: Function, //调用父组件的函数handleSuccess
    isDisabled: "", //在某些状态是不能编辑的
    app_id: "",
    type_id: "",
  },
  data() {
    return {
      RepairData: {
        rp_item: this.getRepair.rp_item,
        rp_cost: this.getRepair.rp_cost,
        rp_time: this.getRepair.rp_time,
        rp_addr: this.getRepair.rp_addr,
        rp_mile: this.getRepair.rp_mile,
        rp_memo: this.getRepair.rp_memo,
        type_id: this.type_id,
      },

      rules: {
        rp_addr: [
          { required: true, message: "维修地点不能为空", trigger: "blur" },
        ],
        rp_mile: [
          { required: true, message: "里程表不能为空", trigger: "blur" },
        ],
        rp_item: [
          { required: true, message: "维修项目不能为空", trigger: "blur" },
        ],
        rp_time: [
          { required: true, message: "维修时间不能为空", trigger: "blur" },
        ],
        rp_cost: [
          { required: true, message: "维修费用不能为空", trigger: "blur" },
        ],
      },
    };
  },

  methods: {
    submit() {
      if (this.RepairData.rp_time)
        //从后端返回的值包含T和时分秒，只保留日期
        this.RepairData.rp_time = this.RepairData.rp_time.replace("T", " ");

      this.$refs.formName.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            `api/rp_data/${this.app_id}`,
            this.RepairData
          );
          if (!res.flag) {
            return this.$message.error("数据输入不合法,提交失败！");
          } else {
            this.handleSuccess(res.data);
          }
        } else {
          this.$message.error("校验失败！");
        }
      });
    },
  },
};
</script>

<style scoped>
@import "./AppStyle.css";
</style>