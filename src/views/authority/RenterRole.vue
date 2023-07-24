<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="租户分配角色"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="租户分配角色" />
    <UnitTree style="margin-top:6px"/>
    <div class="main-body" v-loading="loadingStatus">
      <template v-for="role in allRole" :key="role.role_id">
        <el-checkbox
          v-if="unit_id"
          v-model="role.checked"
          :label="role.role_memo"
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
  name: "RenterRole",
  components: { UnitTree },
  data() {
    return {
      loadingStatus: false,
      showbtn: false,
      pubId: "",
      allRole: [],
      unitRole: [],
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
    this.getRolesData();
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
      //给全部角色增加false属性
      this.allRole.forEach((role) => {
        role.checked = false;
      });

      //把单位角色已有的标为true
      this.allRole.forEach((role) => {
        this.unitRole.forEach((urole) => {
          if (role.role_id === urole.role_id) {
            role.checked = true;
          }
        });
      });
    },

    handleReset() {
      this.resetSelections();
    },

    /*********************************************************
     *@Description: 获取单位分配的角色
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 19:59:57
     ***********************************************************/

    //执行获取单位分配的角色
    async getUnitRoleData() {
      this.loadingStatus = true;

      const { data: res } = await this.$http.get(
        `api/units_roles/unit/${this.unit_id}`
      );
      this.loadingStatus = false;
      if (!res.flag) {
        return this.$message.error("获取单位角色失败:" + res.msg);
      }
      this.unitRole = res.data;

      this.resetSelections();
      this.showbtn = true;
    },
    /*********************************************************
     *@Description: 获取所有角色
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 21:36:35
     ***********************************************************/
    async getRolesData() {
      const { data: res } = await this.$http.get("api/roles/");
      if (!res.flag) return this.$message.error("获取角色失败：" + res.msg);
      this.allRole = res.data;
    },

    /*********************************************************
     *@Description:
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 21:37:03
     ***********************************************************/
    handleSubscript(msgName, data) {
      this.unitRole = [];
      this.unit_id = data.unit_id;
      this.getUnitRoleData(this.unit_id);
    },

    /*********************************************************
     *@Description: 提交修改
     *@MethodAuthor: revised by hfsun
     *@version:
     *@Date: 2022-04-24 21:07:35
     ***********************************************************/
    async doUpdateUnitRole(jsonarr) {
      this.loadingStatus = true;
      const { data: res } = await this.$http.put(
        "api/units_roles/" + this.unit_id,
        jsonarr
      );
      this.loadingStatus = false;
      if (res.flag !== true) return this.$message.error("修改失败！");
      else {
        this.getUnitRoleData();
        return this.$message.success("修改成功！");
      }
    },

    handleSubmit() {
      let added = [];
      let reduced = [];
      //查找比原来的多选了的role_id
      this.allRole.forEach((role) => {
        if (role.checked) {
          let has = false; //遍历选择的项目在uinitRole中是否存在
          this.unitRole.forEach((urole) => {
            if (role.role_id === urole.role_id) {
              //存在，说明没有多选
              has = true;
            }
          });
          if (!has) {
            //不存在，是比原来的多选的
            added.push(role.role_id);
          }
        }
      });

      //查找比原来的少选了的
      this.allRole.forEach((role) => {
        this.unitRole.forEach((urole) => {
          if (role.role_id === urole.role_id && !role.checked) {
            //说明是少选的
            reduced.push(role.role_id);
          }
        });
      });

      let jsonarr = {
        added: added,
        reduced: reduced,
      };

      this.doUpdateUnitRole(jsonarr);
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