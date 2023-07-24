<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="新建申请"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="新建申请" />
    <div v-loading="loading" class="main">
      <el-form ref="formName" :model="form" :rules="rules">
        <!-- 申请类型选择 -->
        <el-form-item label="申请类型" prop="type_id">
          <el-select
            v-model="form.type_id"
            clerable
            placeholder="点击选择申请类型"
          >
            <el-option
              v-for="item in app_types"
              :key="item.type_id"
              :label="item.type_memo"
              :value="item.type_id"
            />
          </el-select>
        </el-form-item>
        <!-- 车辆选择 -->
        <el-form-item label="车牌号码" prop="car_id">
          <el-select
            v-model="form.car_id"
            filterable
            placeholder="点击选择车牌号"
          >
            <el-option
              v-for="item in app_cars"
              :key="item.car_id"
              :label="item.palte_number"
              :value="item.car_id"
            />
          </el-select>
        </el-form-item>
        <!-- 是否快速情况 -->
        <el-form-item label="快速申请" prop="app_quick">
          <el-select
            v-model="form.app_quick"
            filterable
            placeholder="是否为快速申请"
          >
            <el-option
              v-for="item in isEmergency"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="情况说明" prop="app_memo">
          <el-input
            type="textarea"
            v-model.trim="form.app_memo"
            :autosize="{ minRows: 3 }"
            placeholder="情况说明"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>
      </el-form>
    </div>
    <div class="footer">
      <el-button class="btn" type="primary" @click="onSubmit('formName')"
        >提交</el-button
      >
    </div>
  </div>
</template>

<script>
import { ElLoading } from "element-plus";
export default {
  name: "AppNew",
  data() {
    // 自定义校验规则
    var validateSelect = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("申请类型不能为空"));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      // btnDisable:false,
      app_types: [],
      app_cars: [],
      form: {
        type_id: "",
        car_id: "",
        app_memo: "",
        app_quick: 0,
      },
      isEmergency: [
        {
          label: "是",
          value: 1,
        },
        {
          label: "否",
          value: 0,
        },
      ],

      rules: {
        type_id: [
          {
            required: true,
            validator: validateSelect,
            trigger: ["change", "blur"],
            type: "number",
          },
        ],
        car_id: [
          { required: true, message: "车牌号码不能为空", trigger: "blur" },
        ],
        app_memo: [
          { required: true, message: "情况说明不能为空", trigger: "blur" },
        ],
        app_quick: [
          {
            required: true,
            message: "是否为快速申请不能为空",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  created() {
    this.loading = true;
    this.getAppTypes();
    this.getCars();
    this.loading = false;
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    //获取申请类型信息
    async getAppTypes() {
      const { data: res } = await this.$http.get(
        `api/unit_app_types/${this.$store.getters.unitId}`
      );
      if (!res.flag) return this.$message.error("申请类型获取失败！");
      this.app_types = res.data;
    },
    //获取车辆信息
    async getCars() {
      const { data: res } = await this.$http.get(
        `api/cars/unit/${this.$store.getters.unitId}`
      );
      if (!res.flag) return this.$message.error("车辆信息获取失败！");
      this.app_cars = res.data.cars;
    },
    onSubmit(form) {
      this.$refs[form].validate(async (valid) => {
        if (valid) {
          let loadingCover = ElLoading.service({
            fullscreen: true,
            text: "操作中",
          });

          // this.btnDisable=true
          const { data: res } = await this.$http.post(
            `api/applications/`,
            this.form
          );
          loadingCover.close();

          if (res.flag) {
            const { data: res1 } = await this.$http.post("api/flows/", {
              app_id: res.app_id,
              event: this.form.app_quick ? 13 : 1,
            });
            // this.btnDisable=false

            if (res1.flag) {
              return this.$message.success("新建申请成功！");
            } else {
              return this.$message.success("新建流程失败：" + res1.msg);
            }
          } else this.$message.error("新建申请失败:" + res.msg);

          // this.btnDisable=false
        } else {
          this.$message.error("校验失败！");
        }
      });
    },
  },
};
</script>

<style scoped>
.main {
  margin-top: 6px;
  padding: 12px 12px;
  background-color: #fff;
  border-radius: 3px;
}
.btn {
  width: 100%;
}
.footer {
  background-color: #fff;
  padding: 3px;
  margin-top: 3px;
}
</style>