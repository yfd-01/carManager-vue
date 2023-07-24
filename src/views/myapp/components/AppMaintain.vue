<template>
  <div class="maintainStyle">
    <el-form
      ref="formName"
      :model="maintainData"
      label-width="110px"
      :rules="rules"
    >
      <!-- 保养内容 -->
      <el-form-item label="保养内容" prop="mt_item">
        <el-input
          class="itemInput"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="保养内容"
          v-model.trim="maintainData.mt_item"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <!-- 保养地点 -->
      <el-form-item label="保养地点" prop="mt_addr">
        <el-input
          class="addrInput"
          autosize
          :disabled="isDisabled"
          type="textarea"
          placeholder="保养地点"
          v-model.trim="maintainData.mt_addr"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <!-- 保养时间 -->
      <el-form-item label="保养时间" prop="mt_time">
        <el-date-picker
          :disabled="isDisabled"
          style="width: 100%"
          type="datetime"
          v-model="maintainData.mt_time"
          placeholder="选择时间"
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :editable="false"
        />
      </el-form-item>
      <!-- 保养时的里程表 -->
      <el-form-item label="里程表(公里)" prop="mt_mile">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          :disabled="isDisabled"
          placeholder="当前总里程"
          class="mileInput"
          :precision="1"
          :min="0"
          v-model="maintainData.mt_mile"
        />
      </el-form-item>
      <!-- 保养开销 -->
      <el-form-item label="保养费用(元)" prop="mt_cost">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          :disabled="isDisabled"
          placeholder="保养消费实付金额"
          class="costInput"
          :precision="2"
          :min="0"
          v-model="maintainData.mt_cost"
        />
      </el-form-item>
      <el-form-item label="备注" prop="mt_memo">
        <el-input
          class="itemInput"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="备注"
          v-model.trim="maintainData.mt_memo"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AppMaintain",
  props: {
    getMaintain: Object,
    handleSuccess: Function, //调用父组件的函数handleSuccess
    isDisabled: "", //在某些状态是不能编辑的
    app_id: "",
    type_id: "",
  },
  data() {
    return {
      maintainData: {
        mt_addr: this.getMaintain.mt_addr,
        mt_time: this.getMaintain.mt_time,
        mt_item: this.getMaintain.mt_item,
        mt_mile: this.getMaintain.mt_mile,
        mt_cost: this.getMaintain.mt_cost,
        mt_memo: this.getMaintain.mt_memo,
        type_id: this.type_id,
      },

      rules: {
        mt_item: [
          { required: true, message: "保养项目不能为空", trigger: "blur" },
        ],
        mt_addr: [
          { required: true, message: "保养地点不能为空", trigger: "blur" },
        ],
        mt_time: [
          {
            required: true,
            message: "保养时间不能为空",
            trigger: "blur",
          },
        ],

        mt_mile: [
          { required: true, message: "保养里程不能为空", trigger: "blur" },
        ],
        mt_cost: [
          { required: true, message: "维修费用不能为空", trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    // 提交申请类型对应的表单，父组件点击下一步按钮的时候调用
    submit() {
      if (this.maintainData.mt_time)
        //从后端返回的值包含T和时分秒，只保留日期
        this.maintainData.mt_time = this.maintainData.mt_time.replace("T", " ");

      this.$refs.formName.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            `api/mt_data/${this.app_id}`,
            this.maintainData
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