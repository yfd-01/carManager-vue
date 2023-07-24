<template>
  <div class="app-container">
    <el-page-header
      v-if="isMobile"
      title="后退"
      content="员工管理"
      @back="goBack"
    />
    <el-page-header v-else icon="house" title="员工管理" />
    <div :class="[isMobile ? 'main-header-mobile' : 'main-header-pc']">
      <div class="main-header-content">
        <keep-alive>
          <UnitTree @getUnitInfo="getUnitInfo" />
        </keep-alive>

        <el-button
          v-if="showNewBtn && showOpe"
          type="primary"
          class="newBtn"
          @click="handleAdd"
          >添加员工</el-button
        >
      </div>
      <div class="main-header-content" v-if="showSearch">
        <el-input
          class="searchInput"
          placeholder="全局搜索电话号码"
          v-model.trim="inputSearch"
          clearable
          @keyup="proving"
        />
        <el-button type="primary" class="newBtn" @click="searchUser"
          >搜索员工</el-button
        >
      </div>
    </div>

    <div class="tableWrap" ref="tableWrap" v-loading="loading">
      <div
        class="wrapper"
        ref="wrapper"
        :style="{ height: tableHeight - 2 + 'px' }"
      >
        <el-table
          :data="tableData"
          :height="tableHeight"
          :cell-style="{ padding: '0px' }"
          :header-row-style="{ height: '40px' }"
          :row-style="{ height: (tableHeight - 40) / pageSize + 'px' }"
        >
          <el-table-column
            label="姓名"
            prop="name"
            show-overflow-tooltip
            width="90px"
          />
          <el-table-column
            label="手机号"
            prop="mobile"
            show-overflow-tooltip
            width="120px"
          />
          <el-table-column
            v-if="showSearch"
            label="单位"
            prop="unit_name_copy"
            show-overflow-tooltip
            width="180px"
          />
          <el-table-column
            v-else
            label="邮箱"
            prop="user_mail"
            show-overflow-tooltip
            width="160px"
          />
          <el-table-column
            label="角色"
            prop="role_name_copy"
            show-overflow-tooltip
            width="100px"
          />
          <el-table-column label="备注" prop="uur_memo" show-overflow-tooltip />
          <el-table-column
            label="操作"
            class="operation"
            width="160px"
            v-if="showOpe"
          >
            <template #default="scope">
              <el-button
                style="margin: 0; padding: 0"
                size="small"
                text
                type="primary"
                @click="handleEdit(scope.$index, scope.row)"
                >修改</el-button
              >
              <el-button
                style="margin: 0 6px; padding: 0"
                size="small"
                text
                type="warning"
                @click="onResetPasswd(scope.$index, scope.row)"
                >重置密码</el-button
              >
              <el-button
                style="margin: 0; padding: 0"
                size="small"
                text
                type="danger"
                @click="onDelete(scope.$index, scope.row)"
                >删除用户</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 分页区域 -->
    <div class="page" ref="bottomPage">
      <el-pagination
        v-if="showpage"
        background
        layout="prev, pager, next, jumper"
        :page-size="pageSize"
        :total="totalNum"
        @current-change="pageChange"
        :disabled="paginationDisabled"
      />
    </div>
  </div>

  <StaffAdd
    :formData="detail"
    :allRole="allRole"
    :dlgAdd="dlgAdd"
    @update="getStaffData"
    @dlgClosed="dlgAddClosed"
  />

  <StaffEdit
    :form="rowObj"
    :allRole="allRole"
    :dlgEdit="dlgEdit"
    @update="getStaffData"
    @dlgClosed="dlgEditClosed"
  />
</template>


<script>
import UnitTree from "@/components/common/UnitTree";
import StaffEdit from "./StaffEdit.vue";
import StaffAdd from "./StaffAdd.vue";
import { ref, onMounted } from "vue";
import BScroll from "better-scroll";
export default {
  name: "Staff",
  components: { UnitTree, StaffEdit, StaffAdd },
  setup() {
    const tableWrap = ref(null);
    const tableHeight = ref();
    onMounted(() => {
      tableHeight.value = tableWrap.value.offsetHeight - 2;
    });
    return {
      tableWrap,
      tableHeight,
    };
  },
  data() {
    return {
      /* 保存new出来的bscroll实例 */
      bs: null,

      loading: false,
      showNewBtn: false,
      inputSearch: "", //搜索输入框

      showpage: false,
      pageSize: 14,
      currentPage: 1,
      totalNum: 0, //总数据条数

      allRole: [], //所选单位的所有角色
      rawData: [], //员工信息原始数组
      tableData: [], //当前页的员工数据
      rowObj: {}, //编辑的员工数据
      dlgAdd: false, //添加员工对话框可见属性
      dlgEdit: false, //编辑员工对话框
      detail: {}, //添加员工对象
      unit_id: "",

      paginationDisabled: false,
    };
  },
  computed: {
    isMobile() {
      return this.$store.getters.isMobile;
    },
    showSearch() {
      if (this.$store.getters.userRole === "system") return true;
    },
    showOpe() {
      return (
        this.$store.getters.userRole === "system" ||
        this.$store.getters.userRole === "unit_manager"
      );
    },
  },

  watch: {
    //当使用模拟数据时，在渲染页面的时候就获得了模拟数据，然后调用就可以滚动了
    //当使用异步数据时，在数据发生变化的时候，就调用函数里面的$nextTick，然后进行刷新滚动的方法
    tableData: function () {
      this.$nextTick(() => {
        this.bs.refresh();
      });
    },
  },

  mounted() {
    let wrapper = this.$refs.wrapper;
    this.bs = new BScroll(wrapper, {
      click: true,
      eventPassthrough: "horizontal",
      pullDownRefresh: {
        threshold: 50,
        stop: 30,
      },
    });
    /* 下拉刷新事件 */
    this.bs.on("pullingDown", this.pullDown);
  },
  beforeDestroy() {
    this.bs.destroy();
  },

  methods: {
    pullDown() {
      this.getStaffData();
      this.bs.finishPullDown();
    },

    goBack() {
      this.$router.go(-1);
    },

    /*********************************************************
     *@Description: 搜索的手机号码校验，只能为整数
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-25 15:13:41
     ***********************************************************/
    proving() {
      this.inputSearch = this.inputSearch.replace(/\D/g, "");
    },

    //
    //获取员工数据
    //
    async getStaffData() {
      if (!this.unit_id) return;

      this.loading = true;
      const { data: res } = await this.$http.get(
        "api/users/unit_user/" + this.unit_id,
        {
          params: {
            offset: this.pageSize * (this.currentPage - 1),
            limit: this.pageSize,
          },
        }
      );
      this.loading = false;

      if (!res.flag) return this.$message.error("获取员工数据失败：" + res.msg);

      this.totalNum = res.data.total;
      this.showpage = true;

      this.rawData = res.data.users;
      this.tableData = JSON.parse(JSON.stringify(res.data.users)); //js深度拷贝
    },

    pageChange(current_page) {
      this.paginationDisabled = true;
      this.currentPage = current_page;
      this.getStaffData();

      this.paginationDisabled = false;
    },

    //
    //获取所有角色
    //
    async getRolesData() {
      const { data: res } = await this.$http.get(
        `api/units_roles/unit/${this.unit_id}`
      );
      if (!res.flag) return this.$message.error("获取角色信息失败：" + res.msg);
      this.allRole = res.data;
    },

    /*********************************************************
     *@Description: 删除用户
     *@MethodAuthor: hfsun
     *@version:
     *@Date: 2022-04-24 10:48:34
     ***********************************************************/
    onDelete(index, row) {
      this.$confirm("此操作将从本单位删除该用户, 是否继续?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        //确定删除
        this.postDelete(index, row);
      });
    },

    async postDelete(index, row) {
      this.loading = true;
      const { data: res } = await this.$http.patch("api/uurs/" + row.uur_id);
      this.loading = false;
      if (res.flag !== true) this.$message.error("删除用户失败！" + res.msg);
      else {
        this.getStaffData();
        this.$message.success("删除用户成功！");
      }
    },

    //
    //重置密码,发送请求
    //
    async postResetPasswd(index, row) {
      this.loading = true;
      const { data: res } = await this.$http.patch(
        "api/users/psw_reset_uur_id/" + row.uur_id
      );
      this.loading = false;
      if (!res.flag) this.$message.error("重置密码失败:" + res.msg);
      else {
        this.$message.success("重置密码成功！");
      }
    },

    onResetPasswd(index, row) {
      this.$confirm("此操作将重置该用户密码, 是否继续?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        //确定
        this.postResetPasswd(index, row);
      });
    },

    async getDataByTel() {
      this.unit_id = 0; //搜索时将单位id置零

      this.loading = true;

      const { data: res } = await this.$http.get(
        "api/users/tel/" + this.inputSearch
      );
      this.loading = false;

      if (!res.flag) return this.$message.error("获取员工数据失败：" + res.msg);

      this.rawData = res.data.users;
      this.tableData = JSON.parse(JSON.stringify(res.data.users));
    },

    //
    // 按照电话号码搜索用户
    //
    searchUser() {
      if (!this.inputSearch) {
        if (!this.unit_id)
          return this.$message.warning("没有选择单位不能空搜索");
        this.getStaffData();
      } else this.getDataByTel();
    },

    //
    //编辑用户事件
    //
    handleEdit(index, row) {
      this.rowObj = this.rawData[index];
      this.dlgEdit = true;
    },
    dlgEditClosed() {
      this.dlgEdit = false;
    },

    handleAdd() {
      this.dlgAdd = true;
    },

    dlgAddClosed() {
      this.dlgAdd = false;
    },
    getUnitInfo(data) {
      this.unit_id = data.unit_id;
      this.detail.unit_id = data.unit_id;
      this.detail.unit_name = data.unit_name;
      this.getStaffData();
      this.getRolesData();
      this.showNewBtn = true;
    },
  },
};
</script>

<style scoped>
.main-header-pc {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-header-mobile {
  display: flex;
  flex-direction: column;
}

.main-header-content {
  margin-top: 6px;
  display: flex;
  align-items: center;
}

.searchInput {
  width: 170px;
}
.newBtn {
  margin-left: 6px;
}

.tableWrap {
  flex-grow: 1;
  margin-top: 6px;
  background-color: #fff;
  border-radius: 3px;
}
</style>
