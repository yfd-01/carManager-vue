<template>
  <div class="app-container" ref="pageContainer">
    <el-page-header @back="goBack" content="生成签名" />
    <div class="sign-wrap" ref="signWrap" v-loading="loadingStatus">
      <vue-esign
        class="sign"
        ref="esign"
        :isCrop="isCrop"
        :lineWidth="lineWidth"
        :lineColor="lineColor"
        :width="800"
        :height="300"
      />
      <el-image :src="signSrc" v-if="loadSign"></el-image>
      <!-- 水平时在右边显示 -->
      <div class="btns-hori" v-if="isHoriental">
        <el-button @click="handleReset" v-if="!hasSign">清空模板</el-button>
        <el-button @click="handleDel" type="primary" v-if="hasSign"
          >删除签名</el-button
        >
        <el-button @click="handleGenerate" type="primary" v-else
          >生成签名</el-button
        >
      </div>
    </div>
    <div class="btns" v-if="!isHoriental">
      <el-button @click="handleReset" v-if="!hasSign">清空模板</el-button>
      <el-button @click="handleDel" type="primary" v-if="hasSign"
        >删除签名</el-button
      >
      <el-button @click="handleGenerate" type="primary" v-else
        >生成签名</el-button
      >
    </div>
  </div>
</template>
<script>
export default {
  name: "Signature",

  setup() {},

  data() {
    return {
      loadingStatus: false,
      lineWidth: 6,
      lineColor: "#000000",
      resultImg: "",
      isCrop: false,

      isHoriental: false,

      signSrc: "",
      hasSign: false,
      loadSign: false,
    };
  },

  mounted() {
    // 监听resize方法
    window.addEventListener("resize", this.renderResize, false);
    // 获得签名图片
    this.getSign();
  },

  methods: {
    goBack() {
      this.$router.go(-1);
    },
    handleReset() {
      this.$refs.esign.reset();
    },

    /*********************************************************
     *@Description:
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-05-01 11:19:08
     ***********************************************************/
    renderResize() {
      // 判断横竖屏
      let width = document.documentElement.clientWidth;
      let height = document.documentElement.clientHeight;
      // alert(width+"宽高"+height)
      if (width > height) {
        this.isHoriental = true;
      } else {
        this.isHoriental = false;
      }
      // 做页面适配
      // 注意：renderResize方法执行时虚拟dom尚未渲染挂载，如果要操作vue实例，最好在this.$nextTick()里进行。
    },

    /*********************************************************
     *@Description: 删除签名
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-29 16:36:05
     ***********************************************************/
    handleDel() {
      this.$confirm("确定删除签名吗？", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.doDel();
      });
    },
    async doDel() {
      this.loadingStatus = true;
      await this.$http
        .delete("api/signs/")
        .then((response) => {
          const { data: res } = response;
          if (res.flag) {
            this.hasSign = false;
            this.loadSign = false;
            this.handleReset();
            this.$message.success("删除成功！");
          } else {
            this.$message.error("删除失败：" + res.msg);
          }
        })
        .catch((error) => {
          this.$message.error("网络异常：" + error.message);
        });
      this.loadingStatus = false;
    },

    /*********************************************************
     *@Description: 上传签名
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-29 16:36:22
     ***********************************************************/
    handleGenerate() {
      this.$refs.esign
        .generate()
        .then((res) => {
          this.resultImg = res;
          this.postSign();
        })
        .catch((err) => {
          this.$message.error("没有签名信息：" + err);
        });
    },
    async postSign() {
      if (!this.resultImg) return this.$message.warning("没有签名信息！");
      this.loadingStatus = true;
      await this.$http
        .post("api/signs/", { sign: this.resultImg })
        .then((response) => {
          const { data: res } = response;
          if (res.flag !== true)
            this.$message.error("保存签名失败：" + res.msg);
          else {
            this.hasSign = true;
            this.$message.success("保存签名成功！");
          }
        })
        .catch((error) => {
          this.$message.error("网络异常：" + error.message);
        });
      this.loadingStatus = false;
    },

    /*********************************************************
     *@Description: 获得签名
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-29 16:36:37
     ***********************************************************/
    async getSign() {
      this.loadingStatus = true;
      await this.$http
        .get("api/signs/")
        .then((response) => {
          const { data: res } = response;
          if (res.flag) {
            this.signSrc = res.sign;
            this.hasSign = true;
            this.loadSign = true;
          }
        })
        .catch((error) => {
          this.$message.error("网络异常：" + error.message);
        });
      this.loadingStatus = false;
    },
  },
};
</script>

<style scoped>
.el-page-header {
  height: 50px;
  background-color: #fff;
  border-radius: 3px;
  display: flex;
  align-items: center;
}

.sign-wrap {
  position: relative;
  width: 100%;
  margin-top: 6px;
  padding: 2px;
  background-color: #fff;
  border-radius: 3px;
}

.sign {
  border: solid 1px #ccc;
}

.el-image {
  position: absolute;
  top: 0;
  bottom: 0;
  margin: 2px;
}

.btns {
  padding: 8px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
}

/* 水平时的按钮位置放在签名的sign div元素的右下角 */
.btns-hori {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>