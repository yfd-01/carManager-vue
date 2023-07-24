<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="申请类型管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="申请类型管理" />
    <div class="main-header">
      <el-button type="primary" @click="newType()"> 新增类型</el-button>
    </div>
    <el-table :data="dataList" v-loading="loadingStatus">
      <el-table-column
        label="序号"
        type="index"
        header-align="center"
        align="center"
        width="100px"
      />
      <el-table-column
        label="类型名字"
        prop="type_name"
        header-align="center"
        align="center"
      />
      <el-table-column
        label="备注"
        prop="type_memo"
        header-align="center"
        align="center"
      />
    </el-table>
    <el-dialog
      v-model="dialogVisible"
      title="新增申请类型"
      center
      width="360px"
      draggable
    >
      <div class="dlg-container" v-loading="loadingStatus">
        <el-form :model="dataForms" :rules="rules" ref="dataForms" label-width="120px">
          <el-form-item label="英文类型名称" prop="type_name">
            <el-input
              autocomplete="off"
              v-model.trim="dataForms.type_name"
              placeholder="英文类型名称"
            />
          </el-form-item>
          <el-form-item label="中文类型名称" prop="type_memo">
            <el-input autocomplete="off" v-model.trim="dataForms.type_memo" placeholder="中文类型名词"/>
          </el-form-item>
        </el-form>
        <div class="btns">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dataFormSubmit('dataForms')"
            >确 定</el-button
          >
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script  setup>
// import { fa } from 'element-plus/lib/locale';
</script>   

<script>
export default {
  name: "appType",
  data() {
    return {
      loadingStatus:false,
      dialogVisible: false,

      dataList: [],
      // 添加表单的数据绑定对象
      dataForms: {
        type_name: "",
        type_memo: "",
      },
      rules: {
        type_name: [
          {
            required: true,
            message: "请输入英文类型名称",
            trigger: "blur",
          },
        ],
        type_memo: [
          {
            required: true,
            message: "请输入中文类型名词",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getAppTypesList();
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  methods: {
    goBack(){
      this.$router.go(-1);
    },
    async getAppTypesList() {
      this.loadingStatus=true;
      const { data: res } = await this.$http.get("api/app_types/");
      this.loadingStatus=false;
      if (!res.flag) return this.$message.error("查询申请类型失败!"+res.msg);
      this.dataList = res.data;
    },
    newType() {
      this.dialogVisible = true;
    },
    // 添加类型表单提交 并返回刷新  this.getAppTypesList();
    dataFormSubmit(dataForms) {
      this.$refs[dataForms].validate(async (valid) => {
        if (valid) {
          this.loadingStatus=true;
          const { data: res } = await this.$http.post(
            "api/app_types/",
            this.dataForms
          );
          this.loadingStatus=false;
          if (res.flag !== true) return this.$message.error("添加失败！"+res.msg);
          this.getAppTypesList();
          this.dataForms = {};
          return this.$message.success("添加成功！");
        } else {
          return this.$message.error("校验错误");
        }
      });
    },
  },
};
</script>

<style>
.main-header {
  margin-top: 6px;
  display: flex;
  justify-content: right;
  /* background-color: #fff; */
}
.el-table {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}

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