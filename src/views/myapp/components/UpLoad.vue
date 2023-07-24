<template>
  <div class="app-container">
    <el-page-header title="后退" content="上传文件" @back="goBack" />
    <!-- <el-page-header v-else icon="DocumentChecked" title="上传文件" /> -->
    <div class="page-body" v-loading="loading">
      <div class="title">{{ Tip[0] }}(最多上传一张,可不上传)</div>
      <div class="upload-row">
        <!-- 显示已保存的收据图片 -->
        <el-upload
          class="savedReceiptClass"
          v-if="savedReceiptList.length > 0"
          list-type="picture-card"
          :on-preview="photoPreview"
          :on-remove="savedReceiptRemove"
          action="null"
          :file-list="savedReceiptList"
        />

        <!-- 只有票据为空的时候才显示上传票据组件.上传组件显示时，显示加号按钮，当添加了一个图片，加号按钮隐藏 -->
        <el-upload
          v-if="savedReceiptList.length === 0"
          :class="{ uploadClass: true, hideUploadBtn: receiptList.length >= 1 }"
          ref="uploadReceipt"
          :action="receiptUploadPath"
          :with-credentials="true"
          method="post"
          :headers="uploadHeader"
          :on-success="photoSuccess"
          :on-error="receiptFail"
          :on-preview="photoPreview"
          multiple
          list-type="picture-card"
          accept="image/*"
          :limit="receiptImgLimit"
          :on-exceed="onExceedReceipt"
          name="file"
          :file-list="receiptList"
          :auto-upload="false"
          :before-upload="beforeUpload"
        >
          <template v-slot:trigger>
            <el-icon><Plus /></el-icon>
          </template>
        </el-upload>
      </div>

      <!-- 附件图片,充值类型不需要附件 -->
      <template v-if="type_id !== 2">
        <div class="title">{{ Tip[1] }}(最多上传六张,可不上传)</div>
        <div class="upload-row">
          <!-- 显示已保存的附件图片,如果没有则不显示 -->
          <el-upload
            class="savedPhotoClass"
            v-if="savedPhotoList.length > 0"
            list-type="picture-card"
            :on-preview="photoPreview"
            :on-remove="savedPhotoRemove"
            action="null"
            :file-list="savedPhotoList"
          />
          <!-- 当已有附件图片的数量小于6时显示上传组件。如果总数量达到6，则不显示上传按钮 -->
          <el-upload
            v-if="savedPhotoList.length < 6"
            :class="{
              uploadClass: true,
              hideUploadBtn: photoList.length + savedPhotoList.length >= 6,
            }"
            ref="uploadPhoto"
            :action="photoUploadPath"
            :with-credentials="true"
            method="post"
            :headers="uploadHeader"
            multiple
            accept="image/*"
            :on-error="photoFail"
            :on-success="photoSuccess"
            :on-remove="savedPhotoRemove"
            :on-preview="photoPreview"
            :limit="remainingPhotos"
            :on-exceed="onExceedPhotos"
            name="file"
            list-type="picture-card"
            :file-list="photoList"
            :auto-upload="false"
            :before-upload="beforeUpload"
          >
            <template v-slot:trigger>
              <el-icon><Plus /></el-icon>
            </template>
          </el-upload>
        </div>
      </template>

      <el-image-viewer
        v-if="previewSrc"
        :url-list="[previewSrc]"
        :onClose="closeViewer"
      />

      <!--      <el-dialog v-model="previewArray.length">-->
      <!--        <img w-full :src="previewSrc" alt="Preview Image" />-->
      <!--      </el-dialog>-->
    </div>
    <div class="footer">
      <el-button type="primary" :disabled="loading" @click="submitPicture"
        >提交资料</el-button
      >
    </div>
  </div>
</template>

<script>
import * as imageConversion from "image-conversion";
import { ElLoading } from "element-plus";
export default {
  name: "UpLoad",
  props: {
    UpLoadBack: { type: Function },
    event_id: "",
    app_id: "",
    type_id: "",
    data_id: "",
    savedReceiptList: Object,
    savedPhotoList: Object,
    photosPath: "", //附图上传api接口地址
  },
  data() {
    return {
      receiptList: [],
      photoList: [],

      loadingCover: Object,

      // 图片预览
      previewSrc: "",
      //根据不同的申请类型选择不同的数据提交接口
      receiptUploadPath: "",
      photoUploadPath: "",
      //
      receiptImgLimit: 1,
      photoLimit: 6,
      uploadedSuccess: 0, //成功上传的数量,
      loading: false,//此变量可以取消，使用ELloading即可。
    };
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
    // 共可添加的文件列表总长度。计算属性只在载入时计算一次，el-upload的limit属性表示file-list的大小
    remainingPhotos() {
      return this.photoLimit - this.savedPhotoList.length;
    },

    testUploadPath() {
      return `${this.$http.defaults.baseURL}api/${this.photosPath}/?is_receipt=0`;
    },

    Tip() {
      let receiptTip = "";
      let photoTip = "";

      if (this.type_id === 1) {
        receiptTip = "上传票据图片";
        photoTip = "上传保养清单、配件等图片";
      } else if (this.type_id === 2) {
        receiptTip = "上传票据图片";
        photoTip = "";
      } else if (this.type_id === 3) {
        receiptTip = "上传票据图片";
        photoTip = "上传仪表盘图片、加油机计量表等图片";
      } else if (this.type_id === 4) {
        receiptTip = "上传票据图片";
        photoTip = "上传维修清单、配件等图片";
      }
      return [receiptTip, photoTip];
    },
  },
  watch: {},
  mounted() {},
  created() {},
  methods: {
    /*********************************************************
     *@Description:上传前压缩图片到1000k
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-06-04 15:00:48
     ***********************************************************/
    beforeUpload(file) {
      return new Promise((resolve, reject) => {
        let isLt2M = file.size / 1024 / 1024 < 1; // 判定图片大小是否小于1MB
        if (isLt2M) {
          resolve(file);
        } else
          imageConversion.compressAccurately(file, 1000).then((res) => {
            resolve(res);
          });
      });
    },

    /*********************************************************
     *@Description: 删除票据的图片
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-05-18 15:53:12
     ***********************************************************/
    async savedReceiptRemove(file, fileList) {
      // 执行删除
      const { data: res } = await this.$http.delete(
        "api/applications/del_receipt",
        { data: { app_id: file.app_id } }
      );

      if (res.flag) {
        return this.$message.success("票据删除成功！");
      } else {
        this.savedReceiptList.push(file); //删除失败，重新添加到列表中
        return this.$message.error("票据删除失败！");
      }
    },
    // 执行附件图片的删除
    async savedPhotoRemove(file, fileList) {
      if (file.status !== "success") return; //没有上传成功的不需要到后端删除
      // 执行后端删除
      const { data: res } = await this.$http.delete(
        "api/applications/del_photos",
        { data: file } //传递过来的file对象中已经包含了app_id等
      );
      if (res.flag) {
        return this.$message.success("附图删除成功！");
      } else {
        this.savedPhotoList.push(file);
        return this.$message.error("附图删除失败:" + res.msg);
      }
    },

    onExceedReceipt() {
      this.$message.warning("图片超额,只可以上传1张票据!");
    },
    // 能继续添加的图片数量为还能继续添加的图片数量减去file-list数组的长度
    onExceedPhotos() {
      this.$message.warning(
        `图片超额，还可以再添加 ${
          this.remainingPhotos - this.photoList.length
        } 张图片！`
      );
    },
    /*********************************************************
     *@Description: 上传成功、失败的钩子函数处理
     * 图片、单据在后端上传成功，在on-success钩子处理；on-error钩子处理内部错误
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-05-19 11:32:32
     ***********************************************************/
    photoSuccess(res, file, fileList) {
      if (res.flag) {
        //上传成功的图片，增加后端返回的id和app_id则可以执行删除
        if (res.pid) {
          //票据上传成功后是放在数据库的data表，没有pid。附图需要相应的pid才能删除
          file.photo_del_id = res.pid;
        }
        file.app_id = this.app_id; //给file对象添加app_id方便删除

        this.$message.success(file.name + "上传成功！");
        this.uploadedSuccess++;
        if (
          this.uploadedSuccess ===
          this.receiptList.length + this.photoList.length
        ) {
          //全部正确传完
          // console.log("全部成功上传");
          this.postFlow();
        }
      } else {
        //没有返回服务器异常（返回异常由on-error钩子函数处理），但是并没有真正上传
        this.loadingCover.close();
        this.$message.error(file.name + "上传失败");
        file.status = "ready"; //ready状态可以再次上传
      }
    },
    // 图片上传失败。服务器异常时会执行，upload组件会自动从列表中清除上传失败的图片
    photoFail(err, file, fileList) {
      this.loadingCover.close();
      this.$message.error("附件图片" + file.name + "上传失败！");
    },

    // 单据上传失败
    receiptFail(err, file, fileList) {
      this.loadingCover.close();
      this.$message.error("发票单据" + file.name + "上传失败！");
    },

    /*********************************************************
     *@Description: 更新流程
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-04-30 16:51:53
     ***********************************************************/
    async postFlow() {
      let flowEvent = {
        app_id: this.app_id,
        event: this.event_id,
      };
      const { data: res } = await this.$http.post("api/flows/", flowEvent);
      this.loading = false;
      this.loadingCover.close(); //说明图片上传完成，提交了flow，关闭ElLoading
      if (res.flag) {
        this.$router.go(-1);
        return this.$message.success("提交成功！");
      } else return this.$message.error("提交失败：" + res.msg);
    },
    /*********************************************************
     *@Description: 向后端发送请求，删除票据和图片
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-05-03 09:38:45
     ***********************************************************/
    async deleteReceipt() {
      const { data: res } = await this.$http.delete(
        "api/applications/del_receipt",
        { data: this.Data }
      );
      if (res.flag) {
        return this.$message.success("票据删除成功！");
      } else {
        this.receiptList.push(this.willDeleteFile);
        return this.$message.error("票据删除失败！");
      }
    },
    async deletePhotos() {
      const { data: res } = await this.$http.delete(
        "api/applications/del_photos",
        { data: this.Data }
      );
      if (res.flag) {
        return this.$message.success("图片删除成功！");
      } else {
        this.photoList.push(this.willDeleteFile);
        return this.$message.error("图片删除失败！");
      }
    },
    goBack() {
      this.UpLoadBack(true);
    },

    /*********************************************************
     *@Description:图片的预览功能
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-05-03 09:41:36
     ***********************************************************/
    photoPreview(file) {
      this.previewSrc = file.url;
    },
    closeViewer() {
      this.previewSrc = "";
    },
    /*********************************************************
     *@Description: 图片的上传，充值申请只提交票据
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-05-03 09:41:57
     ***********************************************************/
    submitPicture() {
      this.loading = true;
      // 没有增加图片的情况或者删除所有已经上传的图片的情况，新增图片列表都为空
      if (this.receiptList.length + this.photoList.length === 0) {
        this.$confirm("没有增加任何图片，确定要提交吗？", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            this.loadingCover = ElLoading.service({
              fullscreen: true,
              text: "上传中",
            });
            // 提交flow
            this.postFlow();
          })
          .catch(() => {
            //不提交
          });

        this.loading = false;
        return; //上传列表为空时不需要后续函数
      }

      this.loadingCover = ElLoading.service({
        fullscreen: true,
        text: "上传中",
      });
      //文件列表不为空时才上传，已经上传成功的不被组件再次执行上传
      if (this.type_id === 2 && this.receiptList.length > 0) {
        //充值申请时只传票据，且票据队列不能为空
        //充值申请
        this.receiptUploadPath = `${this.$http.defaults.baseURL}api/rc_data/receipt?is_receipt=1&app_id=${this.app_id}&type_id=${this.type_id}&data_id=${this.data_id}`;
        this.$refs.uploadReceipt.submit();
      } else {
        if (this.receiptList.length > 0) {
          //票据图片数组不为空时才上传
          this.receiptUploadPath = `${this.$http.defaults.baseURL}api/${this.photosPath}/?is_receipt=1&app_id=${this.app_id}&type_id=${this.type_id}&data_id=${this.data_id}`;
          this.$refs.uploadReceipt.submit();
        }
        if (this.photoList.length > 0) {
          //附件图片不为空时才上传
          this.photoUploadPath = `${this.$http.defaults.baseURL}api/${this.photosPath}/?is_receipt=0&app_id=${this.app_id}&type_id=${this.type_id}&data_id=${this.data_id}`;
          this.$refs.uploadPhoto.submit();
        }
      }

      //批注：el-upload的submit上传是异步过程，因此还在上传到时候就执行到了这里
      // 当出现提交失败后删掉提交失败的图片，或者删掉了列表中已经上传的图片，这时所有的图片状态都是success，或者列表中没有图片，提交flow
      // let allSuccess = true;
      // this.photoList.forEach((photo) => {
      //   if (photo.status !== "success") {
      //     allSuccess = false;
      //   }
      // });

      // this.receiptList.forEach((photo) => {
      //   if (photo.status !== "success") {
      //     allSuccess = false;
      //   }
      // });

      // if (allSuccess) {
      //   // 提交flow
      //   this.postFlow();
      // } 

      this.loading = false;
      // 正常添加图片，且全部上传成功，在on-success钩子函数中处理，失败在on-error钩子函数处理。此函数不能处理异步结果
    },
  },
};
</script>

<style scoped>
.page-body {
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  padding: 12px 12px 8px 12px;
  background-color: #fff;
}
.title {
  margin-bottom: 10px;
}

.upload-row {
  display: flex;
  flex-direction: column;
}

/* 收据图片列表的样式 */
:deep(.savedReceiptClass .el-upload-list__item) {
  padding: 5px 0;
  height: 80px;
  width: 80px;
}
/* 收据图片列表的点击上传不显示 */
:deep(.savedReceiptClass .el-upload--picture-card) {
  display: none;
}

:deep(.uploadClass .el-upload-list__item) {
  padding: 5px 0;
  height: 80px;
  width: 80px;
}

:deep(.uploadClass .el-upload--picture-card) {
  height: 80px;
  width: 80px;
}
:deep(.hideUploadBtn .el-upload--picture-card) {
  display: none;
}

:deep(.savedPhotoClass .el-upload-list__item) {
  padding: 5px 0;
  height: 80px;
  width: 80px;
}

:deep(.savedPhotoClass .el-upload--picture-card) {
  display: none;
}

/* 不显示image本身 */
.pre-image {
  width: 0;
  height: 0;
}

.el-button {
  width: 100%;
}
.footer {
  background-color: #fff;
  margin-top: 3px;
  padding: 3px;
}
</style>