<template>
  <el-dialog
    v-model="dlgVehicleAdd"
    title="添加车辆"
    width="380px"
    center
    destroy-on-close
    @close="closedlg"
    draggable
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form :model="detail" :rules="rules" ref="detail" label-width="110px">
        <el-form-item class="info" label="车辆牌号" prop="palte_number">
          <el-input v-model.trim="detail.palte_number" />
        </el-form-item>
        <el-form-item class="info" label="车辆类型" prop="car_type">
          <el-input v-model.trim="detail.car_type" />
        </el-form-item>
        <el-form-item class="info" label="车辆品牌" prop="car_brand">
          <el-input v-model.trim="detail.car_brand" />
        </el-form-item>
        <el-form-item class="info" label="加油卡号" prop="card_number">
          <el-input v-model.trim="detail.card_number" />
        </el-form-item>
        <!-- <el-form-item class="info" label="油卡余额(元)">
          <el-input-number
            @mousewheel.prevent
            @DOMMouseScroll.prevent
            :precision="2"
            :min="0"
            placeholder="0"
            disabled
          />
        </el-form-item>         -->
        <el-form-item class="info" label="油品型号" prop="gas_type">
          <el-input v-model.trim="detail.gas_type" />
        </el-form-item>
        <el-form-item class="info" label="油箱容积(升)" prop="tank_capacity">
          <el-input-number
            @mousewheel.prevent
            @DOMMouseScroll.prevent
            :precision="1"
            :min="0"
            v-model="detail.tank_capacity"
          />
        </el-form-item>

        <el-form-item class="info" label="备注" prop="car_memo">
          <el-input
            type="textarea"
            v-model.trim="detail.car_memo"
            maxlength="30"
            show-word-limit
            :rows="1"
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button @click="resetForm('detail')"> 重置 </el-button>
        <el-button type="primary" @click="submitForm('detail')">提交</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { checkMoney, checkTank } from "@/common/utils";
export default {
  name: "VehicleAdd",
  props: {
    dlgVehicleAdd: { default: false },
    detail: Object,
  },
  emits: ["updateVehicle", "dlgClosed"],
  data() {
    return {
      loadingStatus: false,
      pubId: "",
      rules: {
        palte_number: [
          { required: true, message: "请输入车牌号", trigger: "blur" },
        ],
        // tank_capacity: [{ validator: checkTank, trigger: "blur" }],
        card_number: [
          { required: true, message: "请输入油卡号", trigger: "blur" },
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
    resetForm(formData) {
      this.$refs[formData].resetFields();
    },

    submitForm(formData) {
      if (!this.detail.unit_id) {
        return this.$message.error("请先选择单位！");
      }
      this.$refs[formData].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          await this.$http
            .post("api/cars/", this.detail)
            .then((response) => {
              const { data: res } = response;
              if (res.flag) {
                this.$emit("updateVehicle");

                if (res.msg === "exists") {
                  this.$message.warning("添加成功！但该车牌号已经注册");
                } else this.$message.success("车辆添加成功！");

                this.clsForm();
              } else {
                this.$message.error("添加失败：" + res.msg);
              }
            })
            .catch((error) => {
              this.$message.error("添加异常：" + error);
            });

          this.loadingStatus = false;
        } else {
          this.$message.error("身份校验失败！");
        }
      });
    },

    clsForm() {
      this.detail.unit_name = null;
      this.detail.palte_number = null;
      this.detail.car_type = null;
      this.detail.car_brand = null;
      this.detail.gas_type = null;
      this.detail.tank_capacity = null;
      this.detail.car_state = null;
      this.detail.car_memo = null;
      this.detail.card_number = null;
    },

    closedlg() {
      this.$emit("dlgClosed");
    },
  },
};
</script >

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