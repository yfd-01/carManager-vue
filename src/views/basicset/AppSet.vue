<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="App设置"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="App设置" />

    <div class="main">
      <div class="formWrap">
        <el-form
          ref="formName"
          :model="form"
          :rules="rules"
          label-width="140px"
        >
          <el-form-item label="App刷新周期(秒)" prop="app_refresh">
            <el-input-number
              @mousewheel.prevent
              @DOMMouseScroll.prevent
              placeholder=""
              :min="1"
              v-model="form.app_refresh"
            />
          </el-form-item>
          <el-form-item label="App版本(v)" prop="app_version">
            <el-input v-model.trim="form.app_version" placeholder="v1.2" />
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-upload
            ref="upload"
            :action="uploadPath"
            :limit="1"
            :file-list="fileList"
            :auto-upload="false"
            method="post"
            :headers="uploadHeader"
            :on-success="uploadSuccess"
            :on-error="uploadErr"
            accept=".apk"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <el-button class="ml-3" type="success" @click="submitUpload">
              上传
            </el-button>
            <template #tip>
              <div class="el-upload__tip text-red">
                <span style="color: red">先上传再修改版本号并提交</span>
              </div>
            </template>
          </el-upload>

          <el-button class="btns" type="primary" @click="onSubmit('formName')"
            >提交</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ElLoading } from "element-plus";

export default {
  name: "AppSet",
  data() {
    return {
      loadingStatus: false,
      uploadPath: "",
      fileList: [],
      form: {},
      rules: {
        app_refresh: [
          {
            required: true,
            message: "App页面刷新周期不能为空",
            trigger: "blur",
          },
        ],
        app_version: [
          { required: true, message: "App版本号不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getData();
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    uploadHeader() {
      return {
        Authorization: `Bearer ${window.localStorage.getItem("token")}`,
      };
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    //获取
    async getData() {
      this.loading = true;
      const { data: res } = await this.$http.get("api/settings/");
      this.loading = false;
      if (!res.flag) return this.$message.error("获取信息失败：" + res.msg);
      this.form = res.settings;
    },

    onSubmit(form) {
      this.$refs[form].validate(async (valid) => {
        if (valid) {
          let loadingCover = ElLoading.service({
            fullscreen: true,
            text: "操作中",
          });

          const { data: res } = await this.$http.put(
            "/api/settings/",
            this.form
          );
          loadingCover.close();

          if (res.flag) {
            this.$message.success("修改成功！");
          } else this.$message.error("修改失败:" + res.msg);
        } else {
          this.$message.error("校验失败！");
        }
      });
    },

    submitUpload() {
      this.uploadPath = `${this.$http.defaults.baseURL}api/apk/upload`;
      if (this.fileList.length === 0) {
        return this.$message.error("未选择文件！");
      }
      this.$refs.upload.submit();
    },

    uploadSuccess(res, file, fileList) {
      if (res.flag) {
        this.$message.success(file.name + "上传成功！");
      } else {
        this.$message.error(file.name + "上传失败");
        file.status = "ready"; //ready状态可以再次上传
      }
    },
    uploadErr(err, file, fileList){
        this.$message.error( file.name + "上传失败！");
    }
  },
};
</script>

<style >
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 6px;
  padding: 12px;
  background-color: #fff;
  border-radius: 3px;
}

.formWrap {
  width: 300px;
}
.footer {
  display: flex;
  flex-direction: row;
  padding: 3px;
}
.btns {
  margin-left: auto;
  justify-content: right;
}
</style>