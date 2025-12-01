<template>
  <h1>補簽到退</h1>
  <div class="input-group input-group-lg" style="width: 515px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">簽到時間</span>
    <input type="text" class="form-control" aria-label="Sizing example input" v-model="formattedStartTime">
  </div>
  <div class="input-group input-group-lg" style="width: 515px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">簽退時間</span>
    <input type="text" class="form-control" aria-label="Sizing example input" v-model="formattedEndTime">
  </div>
  <div class="d-flex align-items-center mb-3">
    <div class="input-group input-group-lg mb-3" style="width: 260px; margin-bottom: 10px;">
      <span class="input-group-text" id="inputGroup-sizing-lg">選擇簽到時間</span>
      <VDatePicker
          v-model="reStartTime"
          mode="dateTime"
          :time-accuracy="timeAccuracy"
          :formats="customFormats"
          :min-date="minDate"
          :max-date="maxDate"
          :select-attribute="selectAttribute"
          is24hr/>
    </div>
    <div class="input-group input-group-lg mb-3" style="width: 260px; margin-bottom: 10px">
      <span class="input-group-text" id="inputGroup-sizing-lg">選擇簽退時間</span>
      <VDatePicker
          v-model="reEndTime"
          mode="dateTime"
          :time-accuracy="timeAccuracy"
          :formats="customFormats"
          :min-date="minDate"
          :max-date="maxDate"
          :select-attribute="selectAttribute"
          is24hr/>
    </div>
  </div>
  <div>
    <button type="button" class="btn btn-outline-success" @click="reTimePicker" style="margin-top: -20px">補簽到退</button>
  </div>
</template>

<script setup>
import {computed, ref} from "vue";
import axiosApi from "@/plugins/axios.js";
import dayjs from 'dayjs'

//跳轉用
import {useRouter} from 'vue-router';
const router = useRouter();
import Swal from "sweetalert2";


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

//
const reStartTime = ref('');
const reEndTime = ref('');

// 自定義格式
const customFormats = ref({
  dateTime: 'YYYY-MM-DD HH:mm:ss',  // 顯示格式為 '年-月-日 時:分:秒'
});

// 格式化的簽到時間
const formattedStartTime = computed(() => {
  return reStartTime.value ? dayjs(reStartTime.value).format(customFormats.value.dateTime) : '';
});

// 格式化的簽退時間
const formattedEndTime = computed(() => {
  return reEndTime.value ? dayjs(reEndTime.value).format(customFormats.value.dateTime) : '';
});


// 計算可補簽到退的最小日期（當下時間 -3天）
const minDate = computed(() => {
  return new Date() ? dayjs(new Date()).add(-3, 'day').toDate() : null;
});

// 計算可補簽到退的最大日期（當下時間 -1天）
const maxDate = computed(() => {
  return new Date() ? dayjs(new Date()).add(-1, 'day').toDate() : null;
});

const reTimePicker = async () => {
  // console.log("Call ReTimePicker");
  let data = {
    "endTime": formattedEndTime.value,
    "startTime": formattedStartTime.value,
    "finishedStatus": 1,
    "memberNo": 1
  }
  const response = await axiosApi.post("/clock/reTimePicker", data);
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