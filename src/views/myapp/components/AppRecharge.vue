<template>
  <div class="rechargeStyle">
    <el-form
      ref="formName"
      :model="RechargeData"
      label-width="110px"
      :rules="rules"
    >
      <!-- 充值时间 -->
      <el-form-item label="充值时间" prop="rc_time">
        <el-date-picker
          style="width: 100%"
          type="datetime"
          :disabled="isDisabled"
          v-model="RechargeData.rc_time"
          placeholder="点击选择充值日期和时间"
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :editable="false"
        />
      </el-form-item>
      <!-- 充值金额 -->
      <!-- 阻止浏览器鼠标滑动时金额变化 -->
      <el-form-item label="充值金额(元)" prop="rc_value">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="valueInput"
          :disabled="isDisabled"
          placeholder="输入充值金额"
          :precision="2"
          :min="0"
          v-model="RechargeData.rc_value"
        />
      </el-form-item>
      <el-form-item label="备注" prop="rc_memo">
        <el-input
          class="itemInput"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="备注"
          v-model.trim="RechargeData.rc_memo"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AppRecharge",
  props: {
    getRecharge: Object,
    handleSuccess: Function,
    isDisabled: "",
    app_id: "",
    type_id: "",
  },
  data() {
    return {
      RechargeData: {
        rc_value: this.getRecharge.rc_value,
        rc_time: this.getRecharge.rc_time,
        rc_memo: this.getRecharge.rc_memo,
        type_id: this.type_id,
      },
      rules: {
        rc_time: [
          { required: true, message: "充值日期不能为空", trigger: "blur" },
        ],
        rc_value: [
          { required: true, message: "充值金额不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 提交申请类型对应的表单，父组件点击下一步按钮的时候调用
    submit() {
      if (this.RechargeData.rc_time)
        //修改从后端返回的值包含T和时分秒，只保留日期
        this.RechargeData.rc_time = this.RechargeData.rc_time.replace("T", " ");

      this.$refs.formName.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            `api/rc_data/${this.app_id}`,
            this.RechargeData
          );
          if (!res.flag) {
            return this.$message.error("数据输入不合法,提交失败！");
          } else {
            this.handleSuccess(res.data); //调用父组件的方法
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