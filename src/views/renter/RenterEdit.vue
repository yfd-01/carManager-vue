<template>
  <el-dialog
    v-model="dlgEditVisible"
    :title="titleName"
    width="400px"
    center
    destroy-on-close
    @close="closedlg"
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form :model="detail" :rules="rules" ref="detail" label-width="100px">
        <el-form-item class="info" label="名称" prop="unit_name">
          <el-input v-model.trim="detail.unit_name"></el-input>
        </el-form-item>
        <el-form-item class="info" label="联系人" prop="unit_contact">
          <el-input v-model.trim="detail.unit_contact"></el-input>
        </el-form-item>
        <el-form-item class="info" label="电话" prop="unit_tel">
          <el-input v-model.trim="detail.unit_tel"></el-input>
        </el-form-item>
        <el-form-item class="info" label="地址" prop="unit_address">
          <el-input v-model.trim="detail.unit_address"></el-input>
        </el-form-item>
        <el-form-item class="info" label="到期时间" >
          <el-form-item prop="rent_expiretime">
            <el-date-picker
              type="datetime"
              v-model="detail.rent_expiretime"
              placeholder="选择日期时间"
              :default-time="defaultTime"
              format="YYYY/MM/DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :editable="false"
            />
          </el-form-item>
        </el-form-item>
        <el-form-item class="info" label="注册时间">
          <el-form-item prop="unit_regtime">
            <el-date-picker
              disabled
              class="datepicker"
              type="datetime"
              v-model="detail.unit_regtime"
              placeholder="选择日期时间"
              format="YYYY/MM/DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :editable="false"
            />
          </el-form-item>
        </el-form-item>
        <el-form-item class="info" label="状态" prop="unit_state">
          <el-switch
            v-model="detail.unit_state"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item class="info" label="备注" prop="unit_memo">
          <el-input
            type="textarea"
            v-model.trim="detail.unit_memo"
            maxlength="60"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <div class="btns">
        <el-button class="btns" type="primary" @click="submitForm('detail')"
          >提交</el-button
        >
        <el-button class="btns" @click="resetForm('detail')"> 重置 </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "RenterEdit",
  props: {
    detail: Object,
    dlgEditVisible: { default: false },
  },
  emits: ["updateUnits", "dlgClosed"],

  data() {
    return {
      titleName: "",
      loadingStatus: false,
      defaultTime: new Date(2000, 1, 1, 12, 0, 0),
      rules: {
        unit_name: [
          { required: true, message: "请输入租户名称", trigger: "blur" },
        ],
        rent_expiretime: [
          {
            type: "datetime",
            required: true,
            message: "请选择到期日期",
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
            .put(`api/units/${this.detail.unit_id}`, this.detail)
            .then((response) => {
              const { data: res } = response;
              this.loadingStatus = false;
              if (res.flag !== true)
                this.$message.error("处理失败：" + res.msg);
              else {
                this.$emit("updateUnits");
                this.$message.success("更新信息成功！");
              }
            })
            .catch(function (error) {
              this.$message.error("处理异常！" + error);
            });
          this.loadingStatus = false;
        } else {
          this.$message.error("校验失败！");
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

  watch: {
    dlgEditVisible(newValue, oldValue) {
      if (newValue) {
        if (this.detail.parent_unit_id > 0) {
          this.titleName = "修改部门信息";
        } else {
          this.titleName = "修改租户信息";
        }
      }
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

.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>