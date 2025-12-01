<template>
  <h1>補簽退</h1>
  <div class="input-group input-group-lg" style="width: 500px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">簽到時間</span>
    <input type="text" class="form-control" aria-label="Sizing example input" v-model="timePickersInfo.startTime" disabled>
  </div>
  <div class="input-group input-group-lg" style="width: 500px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">簽退時間</span>
    <input type="text" class="form-control" aria-label="Sizing example input" v-model="formattedEndTime">
  </div>
  <div>
    <VDatePicker
        v-model="timePickersInfo.endTime"
        mode="dateTime"
        :time-accuracy="timeAccuracy"
        :formats="customFormats"
        :min-date="minDate"
        :max-date="maxDate"
        :select-attribute="selectAttribute"
        is24hr/>
  </div>
  <div>
    <button type="button" class="btn btn-outline-success" @click="endTimePicker(timePickersInfo.clockTimePickerId)" style="margin-top: 10px">補簽退</button>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from "vue";
import axiosApi from "@/plugins/axios.js";
import dayjs from 'dayjs'

//跳轉用
import {useRouter} from 'vue-router';
const router = useRouter();

//從另一個頁面帶參數跳過來
import {useRoute} from 'vue-router';
import Swal from "sweetalert2";
const route = useRoute();
const clockTimePickerId = ref(route.query.clockTimePickerId);

//補簽退頁面顯示日曆及時間
const date = ref(new Date());
const timeAccuracy = ref(3);
const selectAttribute = ref({
  highlight: {
    color: 'green',
    // fillMode: 'outline'
    // fillMode: 'light'
  },
  content: {
    style: {
      fontStyle: 'italic',
    }
  }
});

// 自定義格式
const customFormats = ref({
  dateTime: 'YYYY-MM-DD HH:mm:ss',  // 顯示格式為 '年-月-日 時:分:秒'
});

// 格式化的簽退時間
const formattedEndTime = computed(() => {
  return timePickersInfo.value.endTime ? dayjs(timePickersInfo.value.endTime).format(customFormats.value.dateTime) : '';
});

// 計算最小日期（簽到時間）
const minDate = computed(() => {
  return timePickersInfo.value.startTime ? dayjs(timePickersInfo.value.startTime).toDate() : null;
});

// 計算最大日期（簽到時間 + 1天）
const maxDate = computed(() => {
  return timePickersInfo.value.startTime ? dayjs(timePickersInfo.value.startTime).add(1, 'day').toDate() : null;
});

//
const timePickersInfo = ref([]);

onMounted(() => {
  getTimeInfoByClockTimePickerId(clockTimePickerId.value);
});

const getTimeInfoByClockTimePickerId = async (clockTimePickerId) => {
  const response = await axiosApi.get(`/clock/getClockTimePickerInfoByClockTimePickerId/${clockTimePickerId}`);
  timePickersInfo.value = response.data;
  // console.log(timePickersInfo.value);

}

const endTimePicker = async (clockTimePickerId) => {
  // console.log("Call Insert EndTime");
  let data = {
    "endTime": formattedEndTime.value,
    "startTime": timePickersInfo.value.startTime,
    "finishedStatus": 1,
    "memberNo": 1
  }
  const response = await axiosApi.put(`/clock/insertEndTime/${clockTimePickerId}`, data);
  // console.log(response.data);
  if(response.data){
    await Swal.fire({
      text: response.data.message,
      icon: 'success',
      allowOutsideClick: false,
      confirmButtonText: '確認'
    });
    await router.push({path: "/PersonalTimePickerList"});
  } else {
    await Swal.fire({
      text: response.data.message,
      icon: 'warning',
      allowOutsideClick: false,
      confirmButtonText: '確認'
    });
  }
}
</script>

<style scoped>

</style>