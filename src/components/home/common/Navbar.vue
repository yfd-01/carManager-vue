<template>
  <div class="navbar">
    <div class="banner">{{ UnitName }}</div>
    <div class="right-menu">
      <el-dropdown class="avatar-container" trigger="click">
        <div class="avatar-wrapper">
          <svg-icon icon-class="image" class="user-avatar"></svg-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown">
            <el-dropdown-item @click="returnDashboard" v-if="!isMobile">
              <span style="display: block">返回主页</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="showme">
              <span style="display: block">我的信息</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="downloadApp">
              <span style="display: block">下载App</span>
            </el-dropdown-item>            
            <el-dropdown-item divided @click="logout">
              <span style="display: block">退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
// import avatar from "@/assets/image.png";
export default {
  data() {
    return {
      // avatar: avatar,
    };
  },
  methods: {
    returnDashboard() {
      this.$router.push({ name: "dashboard" });
    },
    showme() {
      this.$router.push({ name: "me" });
    },
    logout() {
      window.localStorage.clear();
      this.$store.commit("RESET_STATE");
      this.$router.push({ name: "login" });
    },
    async downloadApp(){
        window.open(`${this.$http.defaults.baseURL}static/apk/apk_release.apk`, "_blank");
    },
  },

  computed: {
    UnitName() {
      return (this.isMobile ? '' : this.$store.getters.unitName) + "油料管理系统";
    },

    isMobile() {
      return this.$store.getters.isMobile;
    },
  },
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 70px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  .banner {
    float: left;
    margin-left: 16px;
    height: 100%;
    line-height: 70px;
    font-size: 20pt;
    font-weight: bolder;
    color: #337ecc;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      margin: auto;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      // vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 20px;
      height: 100%;
      display: flex;
      align-items: center;
      .avatar-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 55px;
        height: 33px;
        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 20px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
      .avatar-wrapper:hover {
        background-color: #e2eff9;
        border-radius: 3px;
      }
    }
  }
}
</style>
