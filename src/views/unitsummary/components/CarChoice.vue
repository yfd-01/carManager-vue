<template>
  <div>
    <el-select
      v-model="car_id"
      filterable
      placeholder="选择车牌号"
      @change="handleCarId(car_id)"
    >
      <el-option
        v-for="item in app_cars"
        :key="item.car_id"
        :label="item.palte_number"
        :value="item.car_id"
      />
    </el-select>
  </div>
</template>

<script>
export default {
  name: "CarChoice",
  props: ["getCarId", "selectedUnitId"],
  data() {
    return {
      car_id: "",
      app_cars: "",
    };
  },
  watch: {
    selectedUnitId() {
      this.getCars();
    },
  },
  methods: {
    //获取车辆信息
    async getCars() {
      const { data: res } = await this.$http.get(
        `api/cars/unit/${this.selectedUnitId}`
      );
      if (!res.flag) return this.$message.error("车辆信息获取失败！");
      this.app_cars = res.data.cars;
      this.app_cars.unshift({ car_id: "", palte_number: "全部车辆" });
      this.car_id = "";//切换单位后默认选中全部车辆
    },
    handleCarId(car_id) {
      this.getCarId(car_id);
    },
  },
};
</script>

<style>
</style>