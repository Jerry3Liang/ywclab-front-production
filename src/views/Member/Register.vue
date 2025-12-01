<template>
  <h1>成員註冊</h1>
  <div class="input-group input-group-lg" style="width: 400px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">信箱</span>
    <input type="email" class="form-control" aria-label="Sizing example input" placeholder="請輸入信箱" v-model="email">
  </div>
  <form>
    <div class="input-group input-group-lg" style="width: 400px; margin-bottom: 10px">
      <span class="input-group-text" id="inputGroup-sizing-lg">密碼</span>
      <input type="password" class="form-control" aria-label="Sizing example input" placeholder="請輸入密碼" autocomplete="off" v-model="password">
    </div>
  </form>
  <div class="input-group input-group-lg" style="width: 400px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">暱稱</span>
    <input type="text" class="form-control" aria-label="Sizing example input" placeholder="請輸入暱稱" v-model="memberNickName">
  </div>
  <div class="input-group input-group-lg" style="width: 400px; margin-bottom: 10px">
    <span class="input-group-text" id="inputGroup-sizing-lg">身份</span>
    <div class="form-control">
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio1"
               value="ROLE_PROFESSOR"
               v-model="roleName">
        <label class="form-check-label" for="radio1">教授</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio2"
               value="ROLE_POSTDOC"
               v-model="roleName">
        <label class="form-check-label" for="radio2">博士後</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio3"
               value="ROLE_ASSISTANT"
               v-model="roleName">
        <label class="form-check-label" for="radio3">研究助理</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio4"
               value="ROLE_PHDSTUDENT"
               v-model="roleName">
        <label class="form-check-label" for="radio4">博士生</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio5"
               value="ROLE_MASTERSTUDENT"
               v-model="roleName">
        <label class="form-check-label" for="radio5">碩士生</label>
      </div>
      <div class="form-check form-check-inline">
        <input class="form-check-input"
               type="radio"
               id="radio5"
               value="ROLE_PARTTIMEJOB"
               v-model="roleName">
        <label class="form-check-label" for="radio5">打工仔</label>
      </div>
    </div>
  </div>
  <div class="col-auto">
    <button type="submit" class="btn btn-success mb-3" @click="memberRegister">註冊</button>
  </div>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {ref} from "vue";
import SweetAlert2 from "sweetalert2";
//跳轉用
import {useRouter} from 'vue-router';
const router = useRouter();


//註冊相關
const email = ref('');
const password = ref('');
const memberNickName = ref('');
const roleName = ref('');



//註冊
const memberRegister = async () => {
  console.log("Call register");
  let sTime = new Date();
  let year = sTime.getFullYear();       // 取得年份
  let month = String(sTime.getMonth() + 1).padStart(2, '0'); // 取得月份 (0-11)，所以需要 +1
  let day = String(sTime.getDate()).padStart(2, '0'); // 取得日期
  let hours = String(sTime.getHours()).padStart(2, '0'); // 取得小时
  let minutes = String(sTime.getMinutes()).padStart(2, '0'); // 取得分钟
  let seconds = String(sTime.getSeconds()).padStart(2, '0'); // 取得秒
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  let data = {
    "email": email.value,
    "password": password.value,
    "memberNickName": memberNickName.value,
    "createdTime": formattedDate,
    "lastLoginTime": formattedDate,
    "roleName": roleName.value
  }
  const response = await axiosApi.post("/member/register", data, {headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin' : false}});
  await SweetAlert2.fire({
    icon: 'success',
    title: response.data
  });
  await router.push('/')
}
</script>

<style scoped>

</style>