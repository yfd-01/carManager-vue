<template>
  <div class="refuelStyle">
    <el-form
      ref="formName"
      :model="refuelData"
      label-width="110px"
      :rules="rules"
    >
      <!-- 是否为本车加油 -->
      <el-form-item label="加油对象" prop="ref_self">
        <el-select
          :disabled="isDisabled"
          style="width: 100%"
          v-model="refuelData.ref_self"
          placeholder="是否为本车加油"
        >
          <el-option
            v-for="item in refSelf"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <!-- 剩余油量 -->
      <el-form-item label="剩余油量" prop="ref_remainder">
        <el-input
          type="textarea"
          autosize
          :disabled="isDisabled"
          placeholder="剩余油量刻度(如:三分之一)"
          v-model.trim="refuelData.ref_remainder"
        />
      </el-form-item>
      <!-- 加油后油量刻度 -->
      <el-form-item label="加油后油量" prop="ref_finished_scale">
        <el-input
          type="textarea"
          autosize
          :disabled="isDisabled"
          placeholder="加油后油量(如:三分之一、半箱、加满)"
          v-model.trim="refuelData.ref_finished_scale"
        />
      </el-form-item>
      <!-- 加油时间 -->
      <el-form-item label="加油时间" prop="ref_time">
        <el-date-picker
          style="width: 100%"
          :disabled="isDisabled"
          type="datetime"
          v-model="refuelData.ref_time"
          placeholder="点击选择加油时间"
          format="YYYY/MM/DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :editable="false"
        />
      </el-form-item>
      <!-- 加油地点 -->
      <el-form-item label="加油地点" prop="ref_addr">
        <el-input
          class="addrInput"
          type="textarea"
          autosize
          :disabled="isDisabled"
          placeholder="加油地点"
          v-model.trim="refuelData.ref_addr"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
      <!-- 油品标号 -->
      <el-form-item label="油品标号" prop="ref_gas_type">
        <el-input
          class="gasTypeInput"
          placeholder="油品标号"
          :disabled="isDisabled"
          v-model.trim="refuelData.ref_gas_type"
          maxlength="16"
          show-word-limit
        />
      </el-form-item>
      <!-- 加油时里程表 -->
      <el-form-item
        label="里程表(公里)"
        prop="ref_mile"
        :rules="
          refuelData.ref_self === 0
            ? rules.ref_mile
            : [
                {
                  required: true,
                  message: '加油时里程表不能为空',
                  trigger: 'blur',
                },
              ]
        "
      >
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="mileInput"
          placeholder="加油时的里程表"
          :precision="1"
          :min="0"
          v-model="refuelData.ref_mile"
          :disabled="isDisabled"
        />
      </el-form-item>
      <!-- 加油单价 -->
      <el-form-item label="油价(元/升)" prop="ref_price">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="priceInput"
          placeholder="加油时的油价"
          :precision="2"
          :min="0"
          v-model="refuelData.ref_price"
          :disabled="isDisabled"
        />
      </el-form-item>
      <!-- 加油量(升) -->
      <el-form-item label="加油量(升)" prop="ref_volume">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="volumeInput"
          placeholder="加油量"
          :precision="2"
          :min="0"
          :disabled="isDisabled"
          v-model="refuelData.ref_volume"
        />
      </el-form-item>
      <!-- 加油金额 -->
      <el-form-item label="加油金额(元)" prop="ref_cost">
        <el-input-number
          @mousewheel.prevent
          @DOMMouseScroll.prevent
          class="costInput"
          placeholder="加油实付金额"
          :precision="2"
          :min="0"
          v-model="refuelData.ref_cost"
          :disabled="isDisabled"
        />
      </el-form-item>
      <!-- 加油备注 -->
      <el-form-item label="备注" prop="ref_memo">
        <el-input
          class="addrInput"
          type="textarea"
          :autosize="{ minRows: 2 }"
          :disabled="isDisabled"
          placeholder="备注"
          v-model.trim="refuelData.ref_memo"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "AppRefuel",
  props: {
    getRefuel: Object,
    handleSuccess: Function, //调用父组件的函数handleSuccess
    isDisabled: "", //在某些状态是不能编辑的
    app_id: "",
    type_id: "",
  },
  data() {
    return {
      refSelf: [
        {
          label: "为本车加油",
          value: 1,
        },
        {
          label: "不为本车加油",
          value: 0,
        },
      ],
      refuelData: {
        ref_self: this.getRefuel.ref_self,
        ref_price: this.getRefuel.ref_price,
        ref_volume: this.getRefuel.ref_volume,
        ref_cost: this.getRefuel.ref_cost,
        ref_remainder: this.getRefuel.ref_remainder,
        ref_finished_scale: this.getRefuel.ref_finished_scale,
        ref_time: this.getRefuel.ref_time,
        ref_addr: this.getRefuel.ref_addr,
        ref_gas_type: this.getRefuel.ref_gas_type,
        ref_mile: this.getRefuel.ref_mile,
        ref_memo: this.getRefuel.ref_memo,
        type_id: this.type_id,
      },
      rules: {
        ref_self: [{ required: true, message: "必选一项", trigger: "blur" }],
        ref_time: [
          { required: true, message: "加油时间不能为空", trigger: "blur" },
        ],
        ref_addr: [
          { required: true, message: "加油地点不能为空", trigger: "blur" },
        ],
        ref_price: [
          { required: true, message: "油价不能为空", trigger: "blur" },
        ],
        ref_volume: [
          { required: true, message: "加油量不能为空", trigger: "blur" },
        ],
        ref_cost: [
          { required: true, message: "消费金额不能为空", trigger: "blur" },
        ],
      },
    };
  },
  mounted() {
    if (JSON.stringify(this.getRefuel) == "{}") this.refuelData.ref_self = 1;
  },
  computed: {
    ref_price() {
      return this.refuelData.ref_price;
    },
    ref_volume() {
      return this.refuelData.ref_volume;
    },
  },
  watch: {
    ref_price() {
      this.refuelData.ref_cost =
        Math.round((this.refuelData.ref_price * this.refuelData.ref_volume) *
          100) /
        100;
    },
    ref_volume() {
      this.refuelData.ref_cost =
        Math.round((this.refuelData.ref_price * this.refuelData.ref_volume) *
          100) /
        100;
    },
  },
  methods: {
    // 提交申请类型对应的表单，父组件点击下一步按钮的时候调用
    submit() {
      if (this.refuelData.ref_time)
        //从后端返回的值包含T和时分秒，只保留日期
        this.refuelData.ref_time = this.refuelData.ref_time.replace("T", " ");

      this.$refs.formName.validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            `api/ref_data/${this.app_id}`,
            this.refuelData
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