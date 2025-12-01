<template>
  <h1>全部打卡列表</h1>
  <div class="d-flex align-items-center mb-3">
    <div class="input-group mb-3" style="width: 180px">
      <label class="input-group-text" for="inputGroupSelect01" style="width: 50px">名稱</label>
      <select class="form-select" style="width: 130px" v-model="selectMemberNick" id="inputGroupSelect01">
        <option value="null">請選擇名稱</option>
        <option v-for="memberNickName in selectMemberNickName">{{memberNickName}}</option>
      </select>
    </div>
    <div class="input-group mb-3" style="width: 180px; margin-left: 10px" v-if="selectMemberNick">
      <label class="input-group-text" for="inputGroupSelect02" style="width: 50px">年份</label>
      <select class="form-select" style="width: 130px" v-model="selectedYear" id="inputGroupSelect02">
        <option value="null">請選擇年份</option>
        <option v-for="year in selectYearName">{{year}}</option>
      </select>
    </div>
    <div class="input-group mb-3" style="width: 200px; margin-left: 10px" v-if="selectedYear">
      <label class="input-group-text" for="inputGroupSelect03">月份</label>
      <select class="form-select" style="width: 130px" v-model="selectedMonth" id="inputGroupSelect03">
        <option value="null">請選擇月份</option>
        <option v-for="month in selectMonthName">{{month}}</option>
      </select>
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
    <tr v-for="timePickerInfo in filteredTimePickerInfo" :key="timePickerInfo.id">
      <td v-html="heightLightMonth(timePickerInfo.startTime)"></td>
      <td v-html="heightLightMonth(timePickerInfo.endTime)"></td>
      <td>{{timePickerInfo.formattedSpentTime}} 小時</td>
    </tr>
    </tbody>
  </table>
  <button class="btn btn-outline-success" type="button" @click="calculateTotalHours" v-if="selectedMonth">計算總共時數</button>
  <span v-if="totalHours !== null" style="margin-left: 10px">{{selectedMonth}}月份的總共工時為：{{ totalHours }} 小時</span>
</template>

<script setup>
import axiosApi from "@/plugins/axios.js";
import {computed, onMounted, ref, watch} from "vue";

const allTimePickersInfo = ref([]);
const selectMemberNickName = ref([]);
const selectMemberNick = ref(null);
const selectYearName = ref([]);
const selectedYear = ref(null);
const selectMonthName = ref([]);
const selectedMonth = ref(null);
const totalHours = ref(null);

onMounted(() => {
  getTimeInfo();
});

const getTimeInfo = async () => {
  const response = await axiosApi.get(`/clock/getAllTimePickerInfo`);
  allTimePickersInfo.value = response.data;
  // console.log(allTimePickersInfo.value);

  const setMemberNickName = new Set([]);
  for(let i = 0; i < allTimePickersInfo.value.length; i++){
    setMemberNickName.add(allTimePickersInfo.value[i].memberNickName);
  }
  selectMemberNickName.value = Array.from(setMemberNickName);
  // let time = new Date();
  // if(timePickersInfo.value.startTime.substring(8, 10) === time.getDate().pad(2)){
  //   clockTimePickerId.value = timePickersInfo.value.clockTimePickerId;
  //   startedTime.value = timePickersInfo.value.startTime;
  //   isCurrentDate.value = response.data.isCurrentDate;
  //   isCurrentDate.value = true;
  // }
}

// 當 selectedMemberNick 改變時，更新年份選項
watch(selectMemberNick, (newName) => {
  totalHours.value = null;
  if (newName === 'null') {
    selectYearName.value = [];
    selectedYear.value = null;
    selectMemberNick.value = null;
    return;
  }

  const setYears = new Set([]);
  allTimePickersInfo.value.forEach(info => {
    if (info.memberNickName === newName) {
      setYears.add(info.startTime.substring(0, 4));
    }
  });

  selectYearName.value = Array.from(setYears);
  selectedYear.value = null; // 重置選擇的年份
});

// 當 selectedYear 改變時，更新月份選項
watch(selectedYear, (newYear) => {
  totalHours.value = null;
  if (newYear === 'null') {
    selectMonthName.value = [];
    selectedMonth.value = null;
    selectedYear.value = null;
    return;
  }

  const setMonths = new Set([]);
  allTimePickersInfo.value.forEach(info => {
    if (info.startTime.substring(0, 4) === newYear) {
      setMonths.add(info.startTime.substring(5, 7));
    }
  });

  selectMonthName.value = Array.from(setMonths);
  selectedMonth.value = null; // 重置選擇的月份
});

const formattedTimePickersInfo = computed(() => {
  return allTimePickersInfo.value.map(info => ({
    ...info,
    formattedSpentTime: (info.spentTime / 60).toFixed(2)
  }));
});

//根據下拉選單選取的名稱篩選簽到退資訊
const filteredNameTimePickerInfo = computed(() => {
  totalHours.value = null;
  if (selectMemberNick.value === 'null') {
    return [];
  }

  return formattedTimePickersInfo.value.filter((data) => {
    return selectMemberNick.value === data.memberNickName;
  });
});

//根據下拉選單選取的月份篩選該月的簽到退資訊
const filteredTimePickerInfo = computed(() => {
  totalHours.value = null;
  if (selectedMonth.value === 'null') {
    return [];
  }

  return filteredNameTimePickerInfo.value.filter((data) => {
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
  totalHours.value = filteredTimePickerInfo.value.reduce((total, current) => {
    return total + parseFloat(current.formattedSpentTime);
  }, 0).toFixed(2);
};
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