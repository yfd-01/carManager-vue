<template>
  <el-dialog
    v-model="dlgVehicleEdit"
    title="修改车辆信息"
    width="400px"
    center
    destroy-on-close
    @close="closedlg"
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form :model="form" ref="form" :rules="rules" label-width="110px">
        <el-form-item class="info" label="车辆牌号" prop="palte_number">
          <el-input v-model.trim="form.palte_number"></el-input>
        </el-form-item>
        <el-form-item class="info" label="车辆类型" prop="car_type">
          <el-input v-model.trim="form.car_type"></el-input>
        </el-form-item>
        <el-form-item class="info" label="车辆品牌" prop="car_brand">
          <el-input v-model.trim="form.car_brand"></el-input>
        </el-form-item>
        <el-form-item class="info" label="加油卡号" prop="card_number">
          <el-input v-model.trim="form.card_number"></el-input>
        </el-form-item>
        <el-form-item class="info" label="油品型号" prop="gas_type">
          <el-input v-model.trim="form.gas_type"></el-input>
        </el-form-item>
        <el-form-item class="info" label="油箱容积(升)" prop="tank_capacity">
          <el-input-number
            @mousewheel.prevent
            @DOMMouseScroll.prevent
            v-model="form.tank_capacity"
            :precision="1"
            :min="0"
          />
        </el-form-item>
        <el-form-item class="info" label="油卡余额(元)" prop="capital_balance">
          <el-input-number
            @mousewheel.prevent
            @DOMMouseScroll.prevent
            v-model="form.capital_balance"
            :precision="2"
            :min="0"
            disabled
          />
        </el-form-item>
        <el-form-item class="info" label="车辆状态" prop="car_state">
          <el-select v-model="form.car_state" style="width: 100px">
            <el-option
              v-for="item in stateoptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="info" label="备注" prop="car_memo">
          <el-input
            type="textarea"
            v-model.trim="form.car_memo"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <div class="btns">
        <el-button @click="resetForm('form')"> 重置 </el-button>
        <el-button type="primary" @click="submitForm('form')">提交</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { checkMoney, checkTank } from "@/common/utils";

export default {
  name: "VehicleEdit",
  components: {},

  props: {
    form: Object,
    dlgVehicleEdit: { default: false },
  },

  emits: ["updateVehicle", "dlgClosed"],

  data() {
    return {
      loadingStatus: false,
      rules: {
        palte_number: [
          { required: true, message: "请输入车牌号", trigger: "blur" },
        ],
        capital_balance: [
          { required: true, message: "请输入油卡余额", trigger: "blur" },
        ],
        // tank_capacity: [{ validator: checkTank, trigger: "blur" }],

        card_number: [
          { required: true, message: "请输入加油卡号", trigger: "blur" },
        ],
      },
      stateoptions: [
        {
          value: 1,
          label: "正常",
        },
        {
          value: 0,
          label: "已报废",
        },
      ],
    };
  },

  methods: {
    submitForm(formData) {
      //修改车辆信息
      this.$refs[formData].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          await this.$http
            .put(`api/cars/${this.form.car_id}`, this.form)
            .then((response) => {
              const { data: res } = response;

              if (res.flag !== true)
                this.$message.error("处理失败：" + res.msg);
              else {
                this.$emit("updateVehicle");
                if (res.msg === "exists") {
                  this.$message.warning("更新成功！但该车牌号已经注册");
                } else this.$message.success("车辆信息更新成功！");
              }
            })
            .catch(function (error) {
              this.$message.error("连接异常：" + error);
            });

          this.loadingStatus = false;
        } else {
          return this.$message.error("校验失败！");
        }
      });
    },
    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    closedlg() {
      this.$emit("dlgClosed");
    },
  },
};
</script>



<style scoped>
.dlg-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.el-form {
  padding-right: 5px;
}

.el-input-number {
  width: 100%;
}

.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>