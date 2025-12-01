<template>
  <h1>工讀生打卡</h1>
  <div class="container-clock">
    <div class="datetime">
      <div class="time">
        <span id="hour">{{ hour }}</span>:
        <span id="minutes">{{ minutes }}</span>:
        <span id="seconds">{{ seconds }}</span>
        <span id="period">{{ period }}</span>
      </div>
      <div class="date">
        <span id="dayname">{{ dayname }}</span>,
        <span id="month">{{ month }}</span>
        <span id="daynum">{{ daynum }}</span>日,
        <span id="year">{{ year }}</span>年
      </div>
    </div>
  </div>
  <button class="btn btn-outline-success" type="button" @click="startTimePicker" :disabled="startedTime !== ''" style="margin-left: 15px">簽到</button>
  <button class="btn btn-outline-success" type="button" @click="endTimePicker(clockTimePickerId)" :disabled="timePickersInfo.endTime !== null" style="margin-left: 15px">簽退</button>
  <div>
    <span style="margin-top: 10px; margin-left: 15px" v-if="isCurrentDate">簽到時間： {{timePickersInfo.startTime}}</span>
    <span style="margin-top: 10px; margin-left: 15px" v-if="isCurrentDate && timePickersInfo.finishedStatus === 1">簽退時間： {{timePickersInfo.endTime}}</span>
  </div>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import { ref, onMounted } from 'vue';

//簽到退
const startedTime = ref('');
const endedTime = ref('');
const finishedStatus = ref(0);

//根據 memberNo 查詢簽到退資訊
const timePickersInfo = ref({});
const clockTimePickerId = ref(0);
const isCurrentDate = ref(false);

//時鐘
const dayname = ref('');
const month = ref('');
const daynum = ref('');
const year = ref('');
const hour = ref('');
const minutes = ref('');
const seconds = ref('');
const period = ref('');


const updateTime = () => {
  let time = new Date();
  let dname = time.getDay();
  let mo = time.getMonth();
  let yr = time.getFullYear();
  let dnum = time.getDate();
  let hr = time.getHours();
  let min = time.getMinutes();
  let sec = time.getSeconds();
  let pe;

  if (hr >= 12) {
    pe = "PM";
  } else {
    pe = "AM";
  }

  Number.prototype.pad = function (digits) {
    let n = this.toString();
    while (n.length < digits) {
      n = '0' + n;
    }
    return n;
  };

  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  dayname.value = week[dname];
  month.value = months[mo];
  daynum.value = dnum.pad(2);
  year.value = yr;
  hour.value = hr.pad(2);
  minutes.value = min.pad(2);
  seconds.value = sec.pad(2);
  period.value = pe;
};

const startClock = () => {
  updateTime();
  window.setInterval(updateTime, 1000);
};

onMounted(() => {
  startClock();
  getTheLastTimeInfoByMemberNo(1);
});

//簽到
const startTimePicker = async () => {
  // console.log("Call Insert StartTime");
  let sTime = new Date();
  let year = sTime.getFullYear();       // 取得年份
  let month = String(sTime.getMonth() + 1).padStart(2, '0'); // 取得月份 (0-11)，所以需要 +1
  let day = String(sTime.getDate()).padStart(2, '0'); // 取得日期
  let hours = String(sTime.getHours()).padStart(2, '0'); // 取得小时
  let minutes = String(sTime.getMinutes()).padStart(2, '0'); // 取得分钟
  let seconds = String(sTime.getSeconds()).padStart(2, '0'); // 取得秒
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  let data = {
    "startTime": formattedDate,
    "finishedStatus": 0,
    "memberNo": 1
  }
  const response = await axiosApi.post("/clock/insertStartTime", data);
  // console.log(response.data);
  window.location.reload();
}

//簽退
const endTimePicker = async (clockTimePickerId) => {
  // console.log("Call Insert EndTime");
  let eTime = new Date();
  let year = eTime.getFullYear();       // 取得年份
  let month = String(eTime.getMonth() + 1).padStart(2, '0'); // 取得月份 (0-11)，所以需要 +1
  let day = String(eTime.getDate()).padStart(2, '0'); // 取得日期
  let hours = String(eTime.getHours()).padStart(2, '0'); // 取得小时
  let minutes = String(eTime.getMinutes()).padStart(2, '0'); // 取得分钟
  let seconds = String(eTime.getSeconds()).padStart(2, '0'); // 取得秒
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  // console.log(eTime);
  let data = {
    "endTime": formattedDate,
    "startTime": startedTime.value,
    "finishedStatus": 1,
    "memberNo": 1
  }
  const response = await axiosApi.put(`/clock/insertEndTime/${clockTimePickerId}`, data);
  // console.log(response.data);
  endedTime.value = response.data.endTime;
  finishedStatus.value = response.data.finishedStatus;
  window.location.reload();
}

const getTheLastTimeInfoByMemberNo = async (memberNo) => {
  const response = await axiosApi.get(`/clock/getTheLastClockTimePickerInfo/${memberNo}`);
  timePickersInfo.value = response.data;
  let time = new Date();
  if(timePickersInfo.value.startTime.substring(8, 10) === time.getDate().pad(2)){
    clockTimePickerId.value = timePickersInfo.value.clockTimePickerId;
    startedTime.value = timePickersInfo.value.startTime;
    isCurrentDate.value = response.data.isCurrentDate;
    isCurrentDate.value = true;
  }

  // console.log(isCurrentDate.value);
  // console.log(timePickersInfo.value);
}

</script>

<style scoped>


.container-clock{
  //position: absolute;
  //top: 37%;
  //left: 20%;
  //transform: translate(-50%, -50%);
  background-color: transparent;
  border: 3px solid lightgreen;
  color: lightgreen;
  width: 340px;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 40px;
  transition: 0.5s;
}

.container-clock:hover {
  background-color: lightgreen;
  color: black;
  box-shadow: 0 0 30px lightgreen;
}

.time {
  font-size: 50px;
  font-weight: 600;
  text-align: center;
}

.date {
  font-size: 20px;
  text-align: center;
  font-style: italic;
}

#period {
  font-size: 20px;
}
</style>