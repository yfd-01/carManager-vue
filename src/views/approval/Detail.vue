<template>
  <div class="app-container">
    <el-page-header
      title="后退"
      content="申请详情"
      @back="this.$router.back()"
    />
    <div class="scrollwrap" ref="scrollwrap" v-loading="DetailDataLoading">
      <el-scrollbar :max-height="scrollbarHeight">
        <el-form ref="formName" :model="appInfos" label-width="90px">
          <el-divider style="width: 100%" content-position="left"
            >申请信息</el-divider
          >
          <el-form-item label="申请人员:" prop="name_copy">
            <span>{{ appInfos.name_copy }}</span>
          </el-form-item>
          <el-form-item label="申请类型:" prop="type_memo">
            <span>{{ appInfos.type_memo }}</span>
          </el-form-item>
          <el-form-item label="申请时间:" prop="app_time_start">
            <span>{{ appInfos.app_time_start }}</span>
          </el-form-item>
          <el-form-item label="车牌号码:" prop="palte_number">
            <span>{{ appInfos.palte_number }}</span>
          </el-form-item>
          <el-form-item label="车辆品牌:" prop="car_brand">
            <span>{{ appInfos.car_brand }}</span>
          </el-form-item>
          <el-form-item label="车辆类型:" prop="car_type">
            <span>{{ appInfos.car_type }}</span>
          </el-form-item>
          <el-form-item label="加油卡号:" prop="card_number">
            <span>{{ appInfos.card_number }}</span>
          </el-form-item>
          <el-form-item label="油卡余额:" prop="capital_balance">
            <span>{{ appInfos.capital_balance }}元</span>
          </el-form-item>
          <el-form-item label="申请事由:" prop="app_memo">
            <span>{{ appInfos.app_memo }}</span>
          </el-form-item>
        </el-form>
        <el-divider
          style="width: 100%"
          content-position="left"
          v-if="appInfos.extraInfos"
          >办理信息</el-divider
        >
        <MaintainForm
          v-if="extraInfosLoad('maintaindata')"
          :extraInfos="appInfos.extraInfos"
          :app_time_end="
            appInfos.app_time_end == undefined ? false : appInfos.app_time_end
          "
        />
        <RechargeForm
          v-else-if="extraInfosLoad('rechargedata')"
          :extraInfos="appInfos.extraInfos"
          :app_time_end="
            appInfos.app_time_end == undefined ? false : appInfos.app_time_end
          "
        />
        <RepairForm
          v-else-if="extraInfosLoad('repairdata')"
          :extraInfos="appInfos.extraInfos"
          :app_time_end="
            appInfos.app_time_end == undefined ? false : appInfos.app_time_end
          "
        />
        <RefuelForm
          v-else-if="extraInfosLoad('refueldata')"
          :extraInfos="appInfos.extraInfos"
          :app_time_end="
            appInfos.app_time_end == undefined ? false : appInfos.app_time_end
          "
        />

        <template v-if="appInfos.extraInfos !== null && photos.length">
          <el-divider style="width: 100%" content-position="left"
            >附件资料</el-divider
          >
          <div class="imagewrap">
            <el-image
              v-for="(src, index) in this.photos"
              :key="index"
              class="imgClass"
              :src="src"
              :preview-src-list="this.photos"
              :initial-index="index"
              fit="cover"
            >
              <template #placeholder>
                <div class="image-slot">Loading...</div>
              </template>
            </el-image>
          </div>
        </template>
        <el-divider style="width: 100%" content-position="left"
          >流程信息</el-divider
        >
        <div class="timelineWrapper">
          <AppTimeLine :flows="appInfos.flows" />
        </div>
      </el-scrollbar>
    </div>

    <div class="footer">
      <div class="suggestionWrap" v-if="isSummary == 0">
        <el-input
          v-model.trim="suggestion"
          :autosize="{ minRows: 2, maxRows: 6 }"
          type="textarea"
          placeholder="请输入您的意见"
          maxlength="60"
          show-word-limit
        />
      </div>
      <div class="btns" v-if="isSummary == 0">
        <el-button class="btn" type="danger" @click="processApp(0)"
          >驳回</el-button
        >
        <el-button class="btn" type="primary" @click="processApp(1)"
          >通过</el-button
        >
      </div>
      <el-button
        style="width: 100%"
        v-if="appDoneBackIf"
        type="danger"
        @click="appDoneBack"
        >完成后回退</el-button
      >
    </div>
  </div>
</template>


<script>
import { ref, onMounted } from "vue";

import ViewTop from "@/components/common/ViewTop.vue";
import AppTimeLine from "@/components/apps/AppTimeLine";

import MaintainForm from "./components/MaintainForm";
import RechargeForm from "./components/RechargeForm";
import RepairForm from "./components/RepairForm";
import RefuelForm from "./components/RefuelForm";

import { CircleCheck, CircleClose } from "@element-plus/icons-vue";
import { ElLoading, ElMessageBox, ElMessage } from "element-plus";

export default {
  name: "Detail",
  components: {
    ViewTop,
    AppTimeLine,

    RefuelForm,
    RepairForm,
    RechargeForm,
    MaintainForm,
  },

  setup() {
    const scrollwrap = ref(null);
    const scrollbarHeight = ref();
    onMounted(() => {
      scrollbarHeight.value = scrollwrap.value.offsetHeight - 32; //减去父元素的margin
    });
    return {
      scrollwrap,
      scrollbarHeight,
    };
  },

  data() {
    return {
      detailType: -1,

      appId: -1,
      appInfos: {},
      appMemo: "",
      suggestion: "",
      photos: [],

      DetailDataLoading: true,
      btnIf: false,
      appDoneBackIf: false, // 领导对已完成的进行驳回

      isSummary: -1,
    };
  },
  methods: {
    async appAccessValidCheck() {
      const { data: res } = await this.$http.get(
        `/api/applications/check/${this.appId}`,
        {
          params: {
            detail_type: this.detailType,
            is_summary: this.isSummary,
          },
        }
      );
      this.DetailDataLoading = false;

      if (!res.flag) {
        if (res.msg === "access is invalid") this.$message.error("无权查看");
        this.$router.go(-1);

        return;
      }

      this.appInfos = res.data;
      if (res.data.flowstate_time_copy) {
        res.data.flowstate_time_copy = res.data.flowstate_time_copy.replace(
          "T",
          " "
        );
      }
      if (res.data.app_time_start) {
        res.data.app_time_start = res.data.app_time_start.replace("T", " ");
      }

      if (this.appInfos.extraInfos !== null) {
        // 找到票据的key
        let receiptColName = Object.keys(this.appInfos.extraInfos).find(
          (key) => key.indexOf("_receipt") !== -1
        );

        if (
          this.appInfos.extraInfos[receiptColName] !== null &&
          this.appInfos.extraInfos[receiptColName].trim() !== ""
        )
          this.photos.push(this.appInfos.extraInfos[receiptColName]);

        if (this.appInfos.extraInfos.photos.length) {
          // 找到常规图片的key
          let fileColName = Object.keys(
            this.appInfos.extraInfos.photos[0]
          ).find((key) => key.indexOf("_file") !== -1);

          this.photos = this.photos.concat(
            this.appInfos.extraInfos.photos.map((item) => {
              return item[fileColName];
            })
          );
        }

        // 图片统一加上主机地址前缀
        this.photos = this.photos.map((photo) => {
          // return `${this.$http.defaults.baseURL}resource/${photo}`;
          return `${this.$http.defaults.baseURL}${photo}`;
        });
      }
    },

    // 完成后回退
    async appDoneBack() {
      let _event = 12;
      ElMessageBox.confirm(
        "此功能用于已完成申请修改，你确定要回退吗?",
        "警告",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          this.doProcessApp(2, _event);
        })
        .catch(() => {});
    },

    async processApp(val) {
      let role = this.$store.getters.userInfo["role"];
      let _event = -1;
      if (role === "subunit_officer" || role === "unit_officer") {
        // 干部
        if (val)
          // 批准
          _event =
            this.appInfos.flowstate_title_copy === "OFFICER_REVIEW" ? 2 : 5;
        // 驳回
        else
          _event =
            this.appInfos.flowstate_title_copy === "OFFICER_REVIEW" ? 6 : 11;
      } else if (role === "unit_leader") {
        // 领导
        if (val) {
          // 批准
          _event = 3;
        } else {
          // 驳回
          _event = 7;
        }
      } else {
        this.$message.error("身份非法");
        await this.$router.push({ name: "dashboard" });

        return;
      }

      await this.doProcessApp(val, _event);
    },

    async doProcessApp(val, _event) {
      let loadingCover = ElLoading.service({
        fullscreen: true,
        text: "操作中",
      });

      // 更新app流程
      const { data: res } = await this.$http.post(`/api/flows/`, {
        app_id: this.appId,
        event: _event,
        comment: this.suggestion,
      });
      loadingCover.close();

      if (res.flag) {
        if (val == 2) this.$message.success("已回退");
        else {
          this.$message.success(`已${val ? "通过" : "驳回"}`);
        }

        this.$router.go(-1);
      } else this.$message.error("操作失败:" + res.msg);
    },
  },
  computed: {
    memoStr() {
      let memo = this.appInfos.app_memo;

      return memo === null || memo === "" ? "无" : memo;
    },
    backTarget() {
      switch (this.detailType) {
        case "1":
          return "application";
        case "2":
          return "approve";
        case "3":
          return "audit";
      }
    },
    extraInfosLoad() {
      return (type) => {
        return (
          this.appInfos.extraInfos !== null &&
          this.appInfos.type_name_copy === type
        );
      };
    },
    detailHandlePosStyle() {
      return this.$store.getters.isMobile ? "fixed" : "relative";
    },
  },

  created() {
    this.appId = this.$route.query.app_id;
    this.detailType = this.$route.query.detail_type;
    this.isSummary = this.$route.query.is_summary; //是否为applicationsummary.本组件用于summary和approvaldetail

    if (this.isSummary == 1) {
      let is_done = this.$route.query.is_done;
      let role = this.$store.getters.userInfo["role"];

      //显示回退按钮
      if (
        is_done == "已完成" &&
        (role === "unit_leader" || role === "unit_manager")
      ) {
        this.appDoneBackIf = true;
      }
    }

    if (
      this.appId === undefined ||
      this.appId <= 0 ||
      this.detailType <= 0 ||
      this.detailType > 4
    ) {
      this.$router.push({ name: "dashboard" });
      return;
    }

    this.appAccessValidCheck();

    if (
      this.$store.getters.userInfo["role"] !== "system" &&
      this.$store.getters.userInfo["role"] !== "unit_manager" &&
      this.isSummary === "0" //本组件使用于approvaldetail时
    )
      this.btnIf = true;
  },
};
</script>

<style scoped>
/* .main-body {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  padding: 6px 3px 0 3px;
  background-color: #fff;
  border-radius: 3px;
  border: solid red 1px;
} */

.scrollwrap {
  margin: 6px 0; 
  flex-grow: 1;
  display: flex;
  border-radius: 3px;
  flex-direction: column;
}

.el-scrollbar {
  background-color: #fff;
}

.timelineWrapper {
  background-color: #fff;
  margin: 6px 20px 0 20px;
}

.imagewrap {
  margin: 15px 20px;
  display: flex;
  flex-wrap: wrap;
}
.imgClass {
  height: 100px;
  width: 23%;
  margin: 1%;
}

.suggestionWrap {
  margin: 6px;
}

.btns {
  width: 100%;
  padding: 0 6px;
}

.btn {
  width: 50%;
}

.btn-show {
  width: 100%;
  visibility: visible;
}

.btn-hidden {
  width: 100%;
  visibility: hidden;
}

.footer {
  background-color: #fff;
  padding: 3px;
}
</style>