<template>
  <h1>個人打卡列表</h1>
  <div class="d-flex align-items-center mb-3">
    <div class="input-group mb-3" style="width: 180px">
      <label class="input-group-text" for="inputGroupSelect01" style="width: 50px">年份</label>
      <select class="form-select" style="width: 130px" v-model="selectedYear" id="inputGroupSelect01">
        <option value="null">請選擇年份</option>
        <option v-for="year in selectYearName">{{year}}</option>
      </select>
    </div>
    <div class="input-group mb-3" style="width: 180px; margin-left: 10px" v-if="selectedYear">
      <label class="input-group-text" for="inputGroupSelect01" style="width: 50px">月份</label>
      <select class="form-select" style="width: 130px" v-model="selectedMonth" id="inputGroupSelect01">
        <option value="null">請選擇月份</option>
        <option v-for="month in selectMonthName">{{month}}</option>
      </select>
    </div>
    <div>
      <RouterLink to="/ReTimePicker" type="button" class="btn btn-outline-success" style="--bs-btn-padding-y: .25rem; border-radius: 10px; margin-left: 10px; margin-bottom: 17px">補簽到退</RouterLink>
    </div>
  </div>
  <table class="table" style="margin-top: 10px" v-if="selectedMonth">
    <thead>
    <tr>
      <th scope="col">簽到時間</th>
      <th scope="col">簽退時間</th>
      <th scope="col">總共時數</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="timePickerInfo in filteredMonthTimePickerInfo" :key="timePickerInfo.id">
      <td v-html="heightLightMonth(timePickerInfo.startTime)"></td>
      <td v-html="heightLightMonth(timePickerInfo.endTime)"></td>
      <td>{{timePickerInfo.formattedSpentTime}} 小時
          <RouterLink :to="{path:'/ReInsertEndTime', query: {clockTimePickerId: timePickerInfo.clockTimePickerId}}" type="button" class="btn btn-outline-success" v-if="timePickerInfo.endTime === null && timePickerInfo.isCurrentDate === false" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem; border-radius: 15px">補簽退</RouterLink>
      </td>
    </tr>
    </tbody>
  </table>
  <button class="btn btn-outline-success" type="button" @click="calculateTotalHours" v-if="selectedMonth">計算總共時數</button>
  <span v-if="totalHours !== null" style="margin-left: 10px">{{selectedYear}}年 {{selectedMonth}}月的總工時為：{{ totalHours }} 小時</span>
</template>

<script setup>
import axiosApi from "@/plugins/axios.js";
import {computed, onMounted, ref, watch} from "vue";

const personalTimePickersInfo = ref([]);
const selectYearName = ref([]);
const selectedYear = ref(null);
const selectMonthName = ref([]);
const selectedMonth = ref(null);
const totalHours = ref(null);

onMounted(() => {
  getTimeInfoByMemberNo(1);
});

const getTimeInfoByMemberNo = async (memberNo) => {
  const response = await axiosApi.get(`/clock/getPersonalTimePickerInfo/${memberNo}`);
  personalTimePickersInfo.value = response.data;
  // console.log(personalTimePickersInfo.value);

  const setYears = new Set([]);
  for(let i = 0; i < personalTimePickersInfo.value.length; i++){
    setYears.add(personalTimePickersInfo.value[i].startTime.substring(0, 4));
  }

  selectYearName.value = Array.from(setYears);
}

// 當 selectedYear 改變時，更新月份選項
watch(selectedYear, (newYear) => {
  if (newYear === 'null') {
    selectMonthName.value = [];
    selectedMonth.value = null;
    selectedYear.value = null;
    return;
  }

  const setMonths = new Set([]);
  personalTimePickersInfo.value.forEach(info => {
    if (info.startTime.substring(0, 4) === newYear) {
      setMonths.add(info.startTime.substring(5, 7));
    }
  });

  selectMonthName.value = Array.from(setMonths);
  selectedMonth.value = null; // 重置選擇的月份
});

const formattedTimePickersInfo = computed(() => {
  return personalTimePickersInfo.value.map(info => ({
    ...info,
    formattedSpentTime: (info.spentTime / 60).toFixed(2)
  }));
});

//根據下拉選單選取的年份篩選該年的簽到退資訊
const filteredYearTimePickerInfo = computed(() => {
  totalHours.value = null;
  if (selectedYear.value === 'null') {
    return [];
  }

  return formattedTimePickersInfo.value.filter((data) => {
    return selectedYear.value === data.startTime.substring(0, 4);
  });
});

//根據下拉選單選取的月份篩選該月的簽到退資訊
const filteredMonthTimePickerInfo = computed(() => {
  totalHours.value = null;
  if (selectedMonth.value === 'null') {
    return [];
  }


  return filteredYearTimePickerInfo.value.filter((data) => {
    return selectedMonth.value === data.startTime.substring(5, 7);
  });
});

//選中的月份變色
const heightLightMonth = (month) => {
  if(!month){
    return '';
  }

  return month.replace(selectedMonth.value, `<span class="text-danger">${selectedMonth.value}</span>`);
}

// 計算所選月份的總共時數
const calculateTotalHours = () => {
  totalHours.value = filteredMonthTimePickerInfo.value.reduce((total, current) => {
    return total + parseFloat(current.formattedSpentTime);
  }, 0).toFixed(2);
};

//補簽退
const endTimePicker = async (clockTimePickerId) => {
  // console.log("Call Insert EndTime");
  let data = {
    "endTime": date.value,
    // "startTime": startTime.value,
    "finishedStatus": 1,
    "memberNo": 1
  }
  const response = await axiosApi.put(`/clock/insertEndTime/${clockTimePickerId}`, data);
  // console.log(response.data);
  window.location.reload();
}
</script>

<style scoped>

.table {
  border-collapse: collapse;
  /* 確保邊框不會重疊 */
  width: 100%;

}

.table th,
.table td
{
  border-left: none;
  /* 移除左側邊框 */
  border-top: none;
  border-right: none;
  /* 移除右側邊框 */
  padding: 8px;

}

.table tr {

  border-bottom: 1px solid #c4bfbf;
  /* 設置行與行之間的邊框顏色 */

}

.table th {
  background-color: #f2f2f2;
  text-align: left;

}

.table tr:last-child {
  border-bottom: none;
  /* 移除最後一行的底部邊框 */
}
</style>