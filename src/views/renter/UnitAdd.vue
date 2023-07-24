<template>
  <!-- 没有使用本组件，而使用了部门管理的添加组件 -->
  <div class="main">
    <el-form
      :model="detail"
      :rules="rules"
      ref="detail"
      label-width="100px"
      class="detailForm"
    >
      <el-form-item class="info" label="租户名称" prop="unit_name">
        <el-input v-model="renterData.unit_name" disabled></el-input>
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
      <el-form-item class="info" label="到期时间" >
        <el-col :span="11">
          <el-form-item prop="rent_expiretime">
            <el-date-picker
              type="datetime"
              v-model="detail.rent_expiretime"
              placeholder="选择日期时间"
              :default-time="defaultTime"
              style="width: 100%"
              format="YYYY/MM/DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
              :editable="false"
            />
          </el-form-item>
        </el-col>
      </el-form-item>
      <!-- <el-form-item class="info" label="注册时间" >
        <el-col :span="11">
          <el-form-item prop="unit_regtime">
            <el-date-picker
              type="datetime"
              v-model="detail.unit_regtime"
              placeholder="选择日期时间"
              style="width: 100%"
              format="YYYY/MM/DD hh:mm:ss"
              value-format="YYYY-MM-DD hh:mm:ss"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-form-item> -->
      <el-form-item class="info" label="使用状态" prop="unit_state">
        <el-switch v-model="detail.unit_state"></el-switch>
      </el-form-item>
      <el-form-item class="info" label="备注" prop="unit_memo">
        <el-input
          type="textarea"
          v-model.trim="detail.unit_memo"
          maxlength="60"
          show-word-limit
        />
      </el-form-item>
      <el-form-item class="info">
        <el-button class="btns" type="primary" @click="submitForm('detail')"
          >提交</el-button
        >
        <el-button class="btns" @click="resetForm('detail')"> 重置 </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import pubsub from "pubsub-js";

export default {
  name: "UnitAdd",

  data() {
    return {
      defaultTime: new Date(2000, 1, 1, 12, 0, 0),
      detail: {}, //租户的部门数据。在tree中选择树的节点时，在本组件通过订阅得到租户的数据。
      renterData: {}, //租户的数据
      rules: {
        unit_name: [
          { required: true, message: "请输入部门名称", trigger: "blur" },
        ],
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
      if (!this.renterData.unit_name) {
        return this.$message.error("请先选择租户！");
      }
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          const { data: res } = await this.$http.post(
            "api/units/",
            this.detail
          );
          if (res.flag !== true) return this.$message.error("添加失败！");
          else {
            this.$emit("getTableData");
            return this.$message.success("添加成功！");
          }
        } else {
          return this.$message.error("校验失败！");
          // return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleSubscript(msgName, data) {
      this.renterData = data;
      this.detail.parent_unit_id = data.unit_id;
      this.detail.rent_expiretime = data.rent_expiretime;
      this.detail.unit_state = true;
    },
  },
  mounted() {
    this.pubId = pubsub.subscribe("unitInfo", this.handleSubscript);
  },
  beforeDestroy() {
    pubsub.unsubscribe(this.pubId);
  },
};
</script >

<style scoped>
* {
  margin: 0;
  padding: 0;
}
.main {
  margin: 0 auto;
}

.detailForm {
  padding: 16px 20px;
  background-color: rgb(255, 255, 255);
}
.info {
  padding-bottom: 8px;
  padding-top: 8px;
}

.btns {
  margin: 2px;
  padding: 8px 10px;
}
</style>