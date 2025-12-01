<template>
  <h1>成員登入</h1>
  <form>
    <div class="mb-3">
      <label for="exampleInputEmail1" class="form-label">成員帳號：</label>
      <input type="text" name="empName" class="form-control" id="empName" v-model="memberEmail">
      <span class="error">{{ message }}</span>
    </div>
    <div class="mb-3">
      <label for="exampleInputPassword1" class="form-label">密碼：</label>
      <input type="password" name="password" class="form-control" id="empPassword" autocomplete="off" v-model="password">
    </div>
    <button type="button" class="btn btn-primary" @click="memberLogin">登入</button>
  </form>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {ref} from 'vue';
import Swal from 'sweetalert2';
import {useRouter} from 'vue-router';

const memberEmail = ref("");
const password = ref("");
const message = ref("");
const router = useRouter();

function memberLogin() {
  console.log("Call login");

  let data = {
    "empName": memberEmail.value,
    "password": password.value,
  }

  axiosApi.defaults.headers.authorization = "";
  axiosApi.post("/member/userLogin", data)
      .then((response) => {
        if(response.data.message){
          console.log(response.data);
          Swal.fire({
            text: response.data.message,
            icon: 'success',
            allowOutsideClick: false,
            confirmButtonText: '確認'
          }).then(function (result) {
            if (result.isConfirmed) {
              axiosApi.defaults.headers.authorization = 'Bearer ' + response.data.token;
              router.push("/");
            }
          });
        } else {
          Swal.fire({
            text: response.data.message,
            icon: 'warning',
            allowOutsideClick: false,
            confirmButtonText: '確認'
          });
        }
      }).catch(function(error) {
    console.log("callCreate error", error);
    Swal.fire({
      text: '失敗' + error.message,
      icon: 'error',
      allowOutsideClick: false,
      confirmButtonText: '確認'
    });
  });
}
</script>

<style scoped>
.mb-3 {
  width: 400px;
}
</style>