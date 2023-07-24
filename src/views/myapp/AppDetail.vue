<template>
  <div class="app-container">
    <!-- 显示数据详情 -->
    <div class="detail" v-show="isAppInfo">
      <el-page-header title="后退" content="申请详情" @back="goBack" />
      <div class="scrollbarWrap" ref="scrollwrap" v-loading="loading">
        <el-scrollbar :max-height="scrollbarHeight">
          <div class="mainbody">
            <AppDetailMsg
              :name_copy="app_detail.name_copy"
              :type_memo="app_detail.type_memo"
              :card_number="app_detail.card_number"
              :palte_number="app_detail.palte_number"
              :app_time_start="app_detail.app_time_start"
              :capital_balance="app_detail.capital_balance"
              :type_id="app_detail.type_id"
            />

            <el-form label-width="90px">
              <el-form-item label="情况说明:">
                <!-- 按钮显示为修改申请时，输入状态为disabled=true -->
                <el-input
                  v-if="!showRevise"
                  type="textarea"
                  :autosize="{ minRows: 2 }"
                  v-model.trim="app_memo"
                />
                <span v-else>{{ app_memo }}</span>
              </el-form-item>
            </el-form>
            <!-- 当前状态为需要用户提交资料时，isEdit设为true，可以编辑组件 -->
            <!-- 当前状态为4、5、6、9时才需要显示以下组件之一 -->
            <template v-if="showAppType">
              <Maintain
                v-if="app_detail.type_id === 1"
                ref="mtComponent"
                :handleSuccess="handleSuccess"
                :getMaintain="app_detail.maintaindata"
                :app_id="app_detail.app_id"
                :type_id="app_detail.type_id"
                :isDisabled="isDisabled"
              />
              <Recharge
                v-if="app_detail.type_id === 2"
                ref="rcComponent"
                :handleSuccess="handleSuccess"
                :getRecharge="app_detail.rechargedata"
                :app_id="app_detail.app_id"
                :type_id="app_detail.type_id"
                :isDisabled="isDisabled"
              />
              <Refuel
                v-if="app_detail.type_id === 3"
                ref="rfComponent"
                :handleSuccess="handleSuccess"
                :getRefuel="app_detail.refueldata"
                :capital_balance="app_detail.capital_balance"
                :app_id="app_detail.app_id"
                :type_id="app_detail.type_id"
                :isDisabled="isDisabled"
              />
              <Repair
                v-if="app_detail.type_id === 4"
                ref="rpComponent"
                :handleSuccess="handleSuccess"
                :getRepair="app_detail.repairdata"
                :app_id="app_detail.app_id"
                :type_id="app_detail.type_id"
                :isDisabled="isDisabled"
              />
            </template>

            <!-- 照片预览 -->
            <div v-if="Preview" class="preview">
              <el-image
                v-for="(src, index) in this.photoPreview"
                :key="index"
                class="imgClass"
                :src="src"
                :preview-src-list="this.photoPreview"
                :initial-index="index"
                fit="cover"
              >
                <template #placeholder>
                  <div class="image-slot">Loading...</div>
                </template>
              </el-image>
            </div>

            <AppTimeLine :flows="app_detail.flows" />
          </div>
        </el-scrollbar>
      </div>

      <!-- 当状态为干部拒绝申请时，显示的一组按钮 -->
      <div class="footer">
        <div class="btns" v-if="isReject">
          <template v-if="showRevise">
            <el-button
              class="cancelButton"
              type="primary"
              @click="reviseApplication"
              >修改申请</el-button
            >
            <el-button class="cancelButton" type="danger" @click="cancelApply"
              >撤回申请</el-button
            >
          </template>
          <template v-else>
            <el-button class="cancelButton" @click="modCancel">撤销</el-button>
            <el-button
              class="cancelButton"
              type="primary"
              @click="submitRevise()"
              >提交</el-button
            >
          </template>
        </div>

        <!-- 当前状态为需要下一步继续提交图片时，显示“下一步”按钮 -->
        <div
          class="submit"
          v-if="app_detail.flowstate === 4 || app_detail.flowstate === 6"
        >
          <el-button  :disabled="btnDisable" type="primary" @click="submitData">下一步</el-button>
        </div>
      </div>
    </div>

    <!-- 显示上传图片组件 _events存储下一步可以进行的事件，-->
    <!-- 有的状态下一步可选两个事件，而每个事件有事件id和事件名称，因此_events需要用二维数组表示 -->
    <!-- _events[0][0]在上传附件组件保存的是对应的事件id -->
    <div v-if="!isAppInfo">
      <UpLoad
        :app_id="app_detail.app_id"
        :type_id="app_detail.type_id"
        :data_id="data_id"
        :photosPath="photosPath"
        :event_id="app_detail._events[0][0]"
        :savedReceiptList="receiptList"
        :savedPhotoList="photoList"
        :UpLoadBack="UpLoadBack"
      />
    </div>
  </div>
</template>

<script>
import AppDetailMsg from "@/views/myapp/AppDetailMsg.vue";
import Maintain from "./components/AppMaintain.vue";
import Recharge from "./components/AppRecharge.vue";
import Refuel from "./components/AppRefuel.vue";
import Repair from "./components/AppRepair.vue";
import UpLoad from "./components/UpLoad.vue";
import AppTimeLine from "@/components/apps/AppTimeLine.vue";

import { ref, onMounted } from "vue";

export default {
  name: "AppDetail",
  props: ["app_id"],
  components: {
    AppTimeLine,
    Maintain,
    Recharge,
    Refuel,
    Repair,
    UpLoad,
    AppDetailMsg,
  },
  setup() {
    const scrollwrap = ref(null);
    const scrollbarHeight = ref();
    onMounted(() => {
      scrollbarHeight.value = scrollwrap.value.offsetHeight - 50; //footer中的按钮在setup的时候如果没有出现，会使得wrap变大
    });
    return {
      scrollwrap,
      scrollbarHeight,
    };
  },
  data() {
    return {
      //子组件是否编辑
      isDisabled: false,
      //图片完整url的预览列表
      photoPreview: [],
      Preview: false,
      showAppType: false,
      // 判断显示上传数据还是上传图片
      isAppInfo: true,
      loading: false,
      //当前状态下可做出的行为（事件）
      event_id: "",
      //从后端获取的申请详情数据
      app_detail: {},
      //显示修改申请按钮
      showRevise: true,
      app_memo: "",
      //当前状态为被驳回
      isReject: false,
      //根据不同的申请类型选择不同的数据提交接口
      photosPath: "",

      //提交的表单保存在相应的data表的id
      data_id:0,

      //传给upload组件的图片列表
      receiptList: [],
      photoList: [],

      btnDisable:false,
    };
  },
  created() {
    this.loading = true;
    this.getAppDetail();
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
    // 数据提交成功，隐藏数据组件，显示upload组件
    handleSuccess(data_id) {//data表的id
      this.isAppInfo = false;
      this.data_id = data_id;
    },
    /*********************************************************
     *@Description: 获取申请详情
     *@MethodAuthor: jwWang
     *@version:
     *@Date: 2022-04-27 09:55:02
     ***********************************************************/
    async getAppDetail() {
      const { data: res } = await this.$http.get(
        `api/applications/app_id/${this.$route.params.app_id}`
      );
      if (!res.flag) return this.$message.error("申请详情加载失败！");
      this.app_detail = res.data;

      this.app_memo = res.data.app_memo;

      // 当前状态为被驳回时，显示修改、撤回按钮
      if (res.data.flowstate === 7) {
        this.isReject = true;
      }
      // 当前状态为8时，不需要任何处理
      // 当flowstate为4、5、6、9时，确定需要填写的申请类型细节对应显示的组件
      else if (res.data.flowstate === 4 || res.data.flowstate === 6) {
        //需要编辑
        this.isDisabled = false; //此时需要用户在组件输入内容
        this.showAppType = true; //需要显示申请类型组件
      } else if (res.data.flowstate === 5 || res.data.flowstate === 9) {
        //不需要编辑，只显示组件
        this.isDisabled = true;
        this.showAppType = true; //需要显示申请类型组件
      }

      this.showPhotos();

      this.loading = false;
    },

    /*********************************************************
     *@Description: 上传图片在本组件预览列表展示并向upload组件传递参数
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-05-12 15:26:54
     ***********************************************************/
    showPhotos() {
      //保养
      if (this.app_detail.maintaindata) {
        let receipt = this.app_detail.maintaindata.photo_mt_receipt;
        if (receipt) {
          receipt = this.$http.defaults.baseURL + receipt;
          this.photoPreview.push(receipt);
          this.receiptList.push({
            app_id: this.app_detail.app_id,
            url: receipt,
          }); //upload组件需要对地址
        }
        let photos = this.app_detail.maintaindata.photos;
        if (photos) {
          photos.forEach((photo) => {
            let url = this.$http.defaults.baseURL + photo.pmt_file;
            this.photoPreview.push(url);
            this.photoList.push({
              app_id: this.app_detail.app_id,
              photo_del_id: photo.pmt_id,
              url: url,
            });
          });
        }
      }
      // 充值
      else if (this.app_detail.rechargedata) {
        let receipt = this.app_detail.rechargedata.photo_rc_receipt;
        if (receipt) {
          receipt = this.$http.defaults.baseURL + receipt;
          this.photoPreview.push(receipt);
          this.receiptList.push({
            app_id: this.app_detail.app_id,
            url: receipt,
          }); //upload组件需要对地址
        }
        let photos = this.app_detail.rechargedata.photos;
        if (photos) {
          photos.forEach((photo) => {
            this.photoPreview.push(
              // this.$http.defaults.baseURL + photo.prc_file
              this.$http.defaults.baseURL + photo.prc_file
            );
          });
        }
      }
      // 加油申请的图片
      else if (this.app_detail.refueldata) {
        let receipt = this.app_detail.refueldata.photo_ref_receipt;
        if (receipt) {
          receipt = this.$http.defaults.baseURL + receipt;
          this.photoPreview.push(receipt); //本组件显示的图片地址
          this.receiptList.push({
            app_id: this.app_detail.app_id,
            url: receipt,
          }); //upload组件需要对地址
        }
        let photos = this.app_detail.refueldata.photos;
        if (photos) {
          photos.forEach((photo) => {
            let url = this.$http.defaults.baseURL + photo.prf_file;
            this.photoPreview.push(url); //本组件的图片预览数组
            this.photoList.push({
              app_id: this.app_detail.app_id,
              photo_del_id: photo.prf_id,
              url: url,
            });
          });
        }
      }
      //维修
      else if (this.app_detail.repairdata) {
        let receipt = this.app_detail.repairdata.photo_rp_receipt;
        if (receipt) {
          // receipt = this.$http.defaults.baseURL + "resource/" + receipt;
          receipt = this.$http.defaults.baseURL + receipt;
          this.photoPreview.push(receipt); //本组件预览发票图片
          this.receiptList.push({
            app_id: this.app_detail.app_id,
            url: receipt,
          }); //upload组件需要的地址
        }
        let photos = this.app_detail.repairdata.photos;
        if (photos) {
          photos.forEach((photo) => {
            // let url = this.$http.defaults.baseURL + "resource/" + photo.prp_file;
            let url = this.$http.defaults.baseURL + photo.prp_file;
            this.photoPreview.push(
              //本组件预览
              url
            );
            this.photoList.push({
              app_id: this.app_detail.app_id,
              photo_del_id: photo.prp_id,
              url: url,
            }); //upload组件需要
          });
        }
      }

      //图片列表不为空则展示
      if (this.photoPreview.length !== 0) this.Preview = true;
    },

    /*********************************************************
     *@Description: 点击修改申请按钮，切换显示的按钮，并使备注可编辑
     *@MethodAuthor: jwWang
     *@version:
     *@Date: 2022-04-27 16:53:03
     ***********************************************************/
    reviseApplication() {
      this.showRevise = false;
    },

    /*********************************************************
     *@Description: 当前状态为干部驳回时，提交修改申请。干部驳回状态下，可使用的事件有“撤回”和“修改”两个
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-04-27 16:53:17
     ***********************************************************/
    async submitRevise() {
      const send = {
        app_id: this.app_detail.app_id,
        event: this.app_detail._events[0][0], //修改申请对应的事件id需要上传到后端
      };
      //提交修改application表
      const { data: res } = await this.$http.put(
        `api/applications/${this.app_detail.app_id}`,
        { app_memo: this.app_memo }
      );
      //提交到flows表
      if (res.flag) {
        const { data: res1 } = await this.$http.post("api/flows/", send);
        if (res1.flag) {
          //修改申请成功，后退
          this.$router.go(-1);
          return this.$message.success("修改申请成功！");
        }
      }
      return this.$message.error("修改申请失败！");
    },
    /*********************************************************
     *@Description: 取消修改申请事件
     *@MethodAuthor: jwWang
     *@version:
     *@Date: 2022-04-27 16:54:32
     ***********************************************************/
    modCancel() {
      this.app_memo = this.app_detail.app_memo;
      this.showRevise = true;
    },
    /*********************************************************
     *@Description: 撤回申请事件
     *@MethodAuthor: jwWang
     *@version:
     *@Date: 2022-04-27 16:55:49
     ***********************************************************/
    cancelApply() {
      const send = {
        app_id: this.app_detail.app_id,
        event: this.app_detail._events[1][0], //撤销申请对应的事件id
      };
      this.postWithdraw(send);
    },

    async postWithdraw(send) {
      const { data: res } = await this.$http.post("api/flows/", send);
      if (res.flag !== true) {
        return this.$message.error("撤回申请失败！");
      } else {
        //撤回申请后返回上一级页面
        this.$router.go(-1);
        return this.$message.success("撤回申请成功！");
      }
    },
    /*********************************************************
     *@Description:下一步， 状态4和6的提交事件，先在本组件提交数据到申请类型表格，再在upload组件上传票据和图片并更新状态
     *根据申请类型选择接口，申请子组件获取数据
     *@MethodAuthor: jwWang, revised by hfsun
     *@version:
     *@Date: 2022-04-27 16:56:57
     ***********************************************************/
    async submitData() {
      //保养申请
      if (this.app_detail.type_id == 1) {
        this.photosPath = "mt_photos"; //upload组件使用的上传图片api
        await this.$refs.mtComponent.submit(); //调用子组件的提交函数
      }
      //充值申请
      else if (this.app_detail.type_id == 2) {
        this.photosPath = "rc_photos";
        await this.$refs.rcComponent.submit();
      }
      //加油申请
      else if (this.app_detail.type_id == 3) {
        this.photosPath = "rf_photos";
        await this.$refs.rfComponent.submit();
      }
      //维修申请
      else if (this.app_detail.type_id == 4) {
        this.photosPath = "rp_photos";
        await this.$refs.rpComponent.submit();
      }
    },

    /*********************************************************
     *@Description: 获取申请详情组件的数据
     *@MethodAuthor: jwWang
     *@version:
     *@Date: 2022-04-27 16:57:53
     ***********************************************************/
    UpLoadBack(isAppInfo) {
      this.isAppInfo = isAppInfo;
    },
  },
};
</script>

<style scoped>
.detail {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.scrollbarWrap {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  padding: 16px 0 0 16px;
  background-color: #fff;
}
.mainbody {
  margin-right: 16px;
}

.btns {
  display: flex;
}
.cancelButton {
  width: 50%;
}

.submit > .el-button {
  width: 100%;
}

.preview {
  margin: 15px 20px;
  display: flex;
  flex-wrap: wrap;
}

.imgClass {
  height: 100px;
  width: 23%;
  margin: 1%;
}
.footer {
  background-color: #fff;
  padding: 3px;
  margin-top: 3px;
}
</style>