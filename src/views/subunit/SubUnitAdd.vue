<template>
  <el-dialog
    v-model="dlgAddVisible"
    title="添加部门"
    width="400px"
    center
    destroy-on-close
    @close="closedlg"
    draggable
  >
    <div class="dlg-container" v-loading="loadingStatus">
      <el-form :model="detail" ref="form" :rules="rules" label-width="100px">
        <el-form-item class="info" label="部门所属">
          <el-input v-model="parent_name" disabled></el-input>
        </el-form-item>
        <el-form-item class="info" label="部门名称" prop="unit_name">
          <el-input v-model.trim="detail.unit_name"></el-input>
        </el-form-item>
        <el-form-item class="info" label="联系人" prop="unit_contact">
          <el-input v-model.trim="detail.unit_contact"></el-input>
        </el-form-item>
        <el-form-item class="info" label="联系电话" prop="unit_tel">
          <el-input v-model.trim="detail.unit_tel"></el-input>
        </el-form-item>
        <el-form-item class="info" label="部门地址" prop="unit_address">
          <el-input v-model.trim="detail.unit_address"></el-input>
        </el-form-item>
        <el-form-item class="info" label="使用状态" prop="unit_state">
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
import { checkMobile } from "@/common/utils";
export default {
  name: "SubUnitAdd",
  props: {
    dlgAddVisible: { default: false },
    parent_name: "",
    detail: Object,
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
      },
    };
  },
  methods: {
    submitForm(formName) {
      if (!this.detail.parent_unit_id) {
        return this.$message.error("请先选择一个单位！");
      }
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.loadingStatus = true;
          const { data: res } = await this.$http.post(
            "api/units/",
            this.detail
          );
          this.loadingStatus = false;
          if (res.flag !== true)
            return this.$message.error("添加失败:" + res.msg);
          else {
            this.$emit("updateUnits");
            return this.$message.success("添加成功！");
          }
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

.btns {
  display: flex;
  margin-left: auto;
  justify-content: right;
}
</style>