<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="租户分配申请类型"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="租户分配申请类型" />
    <UnitTree style="margin-top:6px"/>
    <div class="main-body" v-loading="loadingStatus">
      <template v-for="type in allAppTypes" :key="type.type_id">
        <el-checkbox
          v-if="unit_id"
          v-model="type.checked"
          :label="type.type_memo"
          border
        ></el-checkbox>
      </template>
      <div class="btns" v-if="showbtn">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import pubsub from "pubsub-js";
import UnitTree from "@/components/home/common/UnitTree.vue";

export default {
  name: "RenterApp",
  components: { UnitTree },
  data() {
    return {
      loadingStatus: false,
      showbtn: false,
      pubId: "",
      allAppTypes: [],
      unitAppTypes: [],
      unit_id: 0,
    };
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  watch: {},
  created() {
    //从后端获取单位树
    this.getUnitTree();
    //获得所有角色
    this.getAppTypes();
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    // 获取树状控件数据
    async getUnitTree() {
      const { data: res } = await this.$http.get("api/units/");
      if (!res.flag) return this.$message.error("获取单位信息失败：" + res.msg);
      pubsub.publish("unitTree", res.data.units);
    },

    /*********************************************************
     *@Description: 重置选择框
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 22:57:34
     ***********************************************************/
    resetSelections() {
      //给全部申请类型增加false属性
      this.allAppTypes.forEach((type) => {
        type.checked = false;
      });

      //把单位已有的标为true
      this.allAppTypes.forEach((type) => {
        this.unitAppTypes.forEach((utype) => {
          if (type.type_id === utype.type_id) {
            type.checked = true;
          }
        });
      });
    },

    handleReset() {
      this.resetSelections();
    },

    /*********************************************************
     *@Description: 获取单位分配的申请类型
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 19:59:57
     ***********************************************************/

    //执行获取单位分配的申请类型
    async getUnitAppTypes() {
      this.loadingStatus = true;

      const { data: res } = await this.$http.get(
        `api/unit_app_types/${this.unit_id}`
      );
      this.loadingStatus = false;
      if (!res.flag) {
        return this.$message.error("获取单位角色失败:" + res.msg);
      }
      this.unitAppTypes = res.data;

      this.resetSelections();

      this.showbtn = true;
    },
    /*********************************************************
     *@Description: 获取所有申请类型
     *@MethodAuthor:  hfsun
     *@version:
     *@Date: 2022-04-24 21:36:35
     ***********************************************************/
    async getAppTypes() {
      const { data: res } = await this.$http.get("api/app_types/");
      if (!res.flag) return this.$message.error("获取申请类型失败：" + res.msg);
      this.allAppTypes = res.data;
    },

    /*********************************************************
     *@Description:
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 21:37:03
     ***********************************************************/
    handleSubscript(msgName, data) {
      this.unitAppTypes = [];
      this.unit_id = data.unit_id;
      this.getUnitAppTypes(this.unit_id);
    },

    /*********************************************************
     *@Description: 提交修改
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 21:07:35
     ***********************************************************/
    async doUpdateUnitApp(jsonarr) {
      this.loadingStatus = true;
      const { data: res } = await this.$http.put(
        "api/unit_app_types/" + this.unit_id,
        jsonarr
      );
      this.loadingStatus = false;
      if (res.flag !== true) return this.$message.error("修改失败！");
      else {
        this.getUnitAppTypes();
        return this.$message.success("修改成功！");
      }
    },

    handleSubmit() {
      let added = [];
      let reduced = [];
      //查找比原来的多选了的role_id
      this.allAppTypes.forEach((type) => {
        if (type.checked) {
          let has = false; //遍历选择的项目在uinitRole中是否存在
          this.unitAppTypes.forEach((utype) => {
            if (type.type_id === utype.type_id) {
              //存在，说明没有多选
              has = true;
            }
          });
          if (!has) {
            //不存在，是比原来的多选的
            added.push(type.type_id);
          }
        }
      });

      //查找比原来的少选了的
      this.allAppTypes.forEach((type) => {
        this.unitAppTypes.forEach((utype) => {
          if (type.type_id === utype.type_id && !type.checked) {
            //说明是少选的
            reduced.push(type.type_id);
          }
        });
      });

      let jsonarr = {
        added: added,
        reduced: reduced,
      };

      this.doUpdateUnitApp(jsonarr);
    },
  },

  mounted() {
    // 监听点击树的事件
    this.pubId = pubsub.subscribe("unitInfo", this.handleSubscript);
  },
  beforeUnmount() {
    pubsub.unsubscribe(this.pubId);
  },
};
</script>

<style scoped>
.main-body {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}
.el-checkbox {
  margin: 10px;
}
.btns {
  display: flex;
  margin-left: auto;
  margin: 6px;
  justify-content: right;
}
</style>  