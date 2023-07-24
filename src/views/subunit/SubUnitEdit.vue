<template>
  <el-dialog
    v-model="dlgEditVisible"
    title="修改部门信息"
    width="400px"
    center
    destroy-on-close
    @close="closedlg"
    draggable
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item class="info" label="部门名称" prop="unit_name">
          <el-input v-model.trim="form.unit_name"></el-input>
        </el-form-item>
        <el-form-item class="info" label="联系人" prop="unit_contact">
          <el-input v-model.trim="form.unit_contact"></el-input>
        </el-form-item>
        <el-form-item class="info" label="联系电话" prop="unit_tel">
          <el-input v-model.trim="form.unit_tel"></el-input>
        </el-form-item>
        <el-form-item class="info" label="部门地址" prop="unit_address">
          <el-input v-model.trim="form.unit_address"></el-input>
        </el-form-item>
        <el-form-item class="info" label="使用状态" prop="unit_state">
          <el-switch
            v-model="form.unit_state"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item class="info" label="备注" prop="unit_memo">
          <el-input
            type="textarea"
            v-model.trim="form.unit_memo"
            maxlength="30"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button class="btns" @click="resetForm('form')"> 重置 </el-button>
        <el-button class="btns" type="primary" @click="submitForm('form')"
          >提交</el-button
        >
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { checkMobile } from "@/common/utils";
export default {
  name: "SubUnitEdit",

  props: {
    form: {},
    dlgEditVisible: { default: false },
  },
  emits: ["updateUnits", "dlgClosed"],

  data() {
    return {
      loadingStatus: false,
      defaultTime: new Date(2000, 1, 1, 12, 0, 0),
      rules: {
        unit_name: [
          { required: true, message: "请输入部门名称", trigger: "blur" },
        ],
        unit_tel: [{ validator: checkMobile, trigger: "blur" }],
        rent_expiretime: [
          {
            type: "datetime",
            required: true,
            message: "请选择到期日期",
            trigger: "change",
          },
        ],
        unit_regtime: [
          {
            type: "date",
            required: true,
            message: "请选择注册日期",
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          await this.$http
            .put(`api/units/${this.form.unit_id}`, this.form)
            .then((response) => {
              const { data: res } = response;

              if (res.flag !== true)
                this.$message.error("处理失败：" + res.msg);
              else {
                this.$emit("updateUnits");
                this.$message.success("更新信息成功！");
              }
            })
            .catch(function (error) {
              this.$message.error("异常：" + error);
            });

          this.loadingStatus = false;
        } else {
          return this.$message.error("校验失败！");
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
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
</style>