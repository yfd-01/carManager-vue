<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="租户角色分配权限"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="租户角色分配权限" />
    <UnitTree style="margin-top:6px"/>
    <div class="main-body" v-loading="mainLoadingStatus" ref="mainBody">
      <el-scrollbar :max-height="scrollbarHeight">
      <el-tree
        ref="tree"
        :data="allMenus"
        show-checkbox
        :check-strictly="true"
        :props="props"
        node-key="menu_id"
        v-loading="loadingStatus"
      />
      </el-scrollbar>
      <div class="main-right">
        <el-radio-group
          v-show="unit_id"
          v-loading="radioLoadingStatus"
          v-model="radioURID"
          @change="handleRadio"
        >
          <el-radio-button
            v-for="ur in unitRoles"
            :key="ur.ur_id"
            :label="ur.ur_id"
            >{{ ur.role_memo }}</el-radio-button
          >
        </el-radio-group>

        <div class="btns" v-show="showBtns">
          <el-button @click="resetAuth">重置</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import pubsub from "pubsub-js";
import UnitTree from "@/components/home/common/UnitTree.vue";
import { ref, onMounted } from "vue";
export default {
  name: "RenterRoleMenu",
  components: { UnitTree },
  
  setup() {
    const mainBody = ref(null);
    const scrollbarHeight = ref();
    onMounted(() => {
      scrollbarHeight.value = mainBody.value.offsetHeight - 12;//减去padding
    });
    return {
      mainBody,
      scrollbarHeight,
    };
  },

  data() {
    return {
      props: {
        label: "menu_name",
        children: "children",
      },

      showBtns: false,
      radioLoadingStatus: false,
      loadingStatus: false,
      mainLoadingStatus:false,

      radioURID: 0, //当选按钮组绑定的默认按钮label值

      pubId: "",
      ur_id: "",
      unit_id: 0,

      allMenus: [], //所有菜单项目
      unitRoles: [], //租户的所有角色
      roleMenus: [], //角色赋予的菜单项

      allMenuIDs: [], //所有菜单项的menu_id数组
      checkedKeys: [], //选中角色的的menu_id数组
    };
  },

  created() {
    //从后端获取数据
    this.getUnitTree();
    //获取所有菜单项
    this.getAllMenus();
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    //
    // 获取树状控件数据
    //
    async getUnitTree() {
      const { data: res } = await this.$http.get("api/units/");
      if (!res.flag) return this.$message.error("获取单位信息失败：" + res.msg);
      pubsub.publish("unitTree", res.data.units);
    },

    //
    //获取租户的所有角色
    //
    async getUnitRoleData() {

      this.checkedKeys = []; //清空已选菜单项
      this.$refs["tree"].setCheckedKeys(this.checkedKeys);

      this.radioLoadingStatus = true;
      const { data: res } = await this.$http.get(
        `api/units_roles/unit/${this.unit_id}`
      );
      this.radioLoadingStatus = false;
      if (!res.flag) return this.$message.error("获取租户角色失败:" + res.msg);
      if (res.data.length === 0) {
        this.$message.warning("该单位还没有分配角色");
      }
      this.unitRoles = res.data;
    },
    /*********************************************************
     *@Description: 获取所有菜单项
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-25 22:29:34
     ***********************************************************/
    async getAllMenus() {
      const { data: res } = await this.$http.get("api/menus/");

      if (!res.flag) return this.$message.error("获取菜单项失败：" + res.msg);
      this.allMenus = res.data;

      this.getAllKeys(this.allMenus);
    },

    // 获得menu_id,菜单只有两层
    getAllKeys(allMenus) {
      allMenus.forEach((menu) => {
        this.allMenuIDs.push(menu.menu_id);
        if (menu.children.length > 0) {
          menu.children.forEach((child) => {
            this.allMenuIDs.push(child.menu_id);
          });
        }
      });
    },

    /*********************************************************
     *@Description: 点击角色按钮
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-25 22:27:48
     ***********************************************************/
    handleRadio() {
      //向后端获取角色已有菜单
      this.ur_id = this.radioURID;
      this.getRoleMenu();

      this.showBtns = true;
    },
    //
    //获取角色已有菜单项
    //
    async getRoleMenu() {
      this.loadingStatus = true;
      const { data: res } = await this.$http.get("api/murs/", {
        params: {
          ur_id: this.ur_id,
        },
      });
      this.loadingStatus = false;
      if (!res.flag) {
        this.roleMenus = [];
        return this.$message.error("获取角色的菜单项失败：" + res.msg);
      }

      this.roleMenus = res.data;
      if (res.data.length === 0) {
        this.$message.warning("该角色还没有配置菜单项");
      }

      this.checkedKeys = []; //清空
      this.getKeys(this.roleMenus); //获得角色已经分配的菜单项的menu_id
      this.$refs["tree"].setCheckedKeys(this.checkedKeys);
    },

    getKeys(roleMenus) {
      roleMenus.forEach((menu) => {
        this.checkedKeys.push(menu.menu_id);
        if (menu.children.length > 0) {
          menu.children.forEach((child) => {
            this.checkedKeys.push(child.menu_id);
          });
          // this.getKeys(menu.children);
        }
      });
    },

    /*********************************************************
     *@Description: 发送角色修改的菜单项
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-26 11:12:47
     ***********************************************************/
    handleConfirm() {
      let updateOBJ = {
        ur_id: this.ur_id,
        menu_active_ls: [],
        menu_inactive_ls: [],
      };

      this.checkedKeys = this.$refs["tree"].getCheckedKeys();
      updateOBJ.menu_active_ls = this.checkedKeys;

      //查找不再里面的
      this.allMenuIDs.forEach((i) => {
        if (!this.checkedKeys.includes(i)) updateOBJ.menu_inactive_ls.push(i);
      });

      // 向后端发送数据
      this.postUpdate(updateOBJ);
    },
    //
    //修改权限
    //
    async postUpdate(updateOBJ) {
      this.mainLoadingStatus = true;
      const { data: res } = await this.$http.post("api/murs/", updateOBJ);
      this.mainLoadingStatus = false;
      if (res.flag !== true)
        return this.$message.error("权限修改失败！" + res.msg);
      else {
        this.getRoleMenu();
        return this.$message.success("权限修改成功！");
      }
    },

    /*********************************************************
     *@Description: 重置角色菜单项
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-26 10:39:35
     ***********************************************************/
    resetAuth() {
      this.$refs["tree"].setCheckedKeys(this.checkedKeys);
    },

    //
    // 处理订阅事件
    //
    handleSubscript(msgName, data) {
      this.unit_id = data.unit_id;
      this.getUnitRoleData(data.unit_id);
      this.radioURID = 0;
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
  border-radius: 3px;
  display: flex;
}

.el-tree{
  width: 200px;
}
.el-scrollbar{
  background-color: #fff;
  border-radius: 3px;
  padding:6px;
}

.main-right {
  flex-grow: 1;
  padding: 6px;
  margin-left:  3px;
  background-color: #fff;
  border-radius: 3px;
}

.btns {
  display: flex;
  margin-left: auto;
  margin: 6px;
  justify-content: right;
}
</style>  