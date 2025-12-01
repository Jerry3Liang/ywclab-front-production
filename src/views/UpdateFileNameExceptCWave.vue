<template>
  <h1 style="padding-bottom: 5px">修改其他動物實驗檔名 (不包含 C-Wave)</h1>
  <div class="input-group" style="width: 600px">
    <input class="form-control form-control-lg"
           id="formFileLg1"
           type="file"
           multiple
           @change="onFileChange"
           name="files"
           style="width: 200px">
    <label class="input-group-text" for="formFileLg1">( 請載入欲更改名稱的檔案 )</label>
  </div>
  <div class="input-group" v-if="showUploadFileNameMap" style="width: 600px; margin-top: 10px">
    <input class="form-control form-control-lg"
           id="formFileLg"
           type="file"
           @change="onMapFileChange"
           name="mapExcelFile"
           style="width: 200px">
    <label class="input-group-text" for="formFileLg">( 請載入名稱對照表 )</label>
  </div>
  <div class="input-group" style="width: 600px; margin-top: 10px">
    <span class="input-group-text" id="inputGroup-sizing-default" style="width:160px">請輸入資料夾名稱：</span>
    <input type="text"
           class="form-control"
           aria-label="Sizing example input"
           aria-describedby="inputGroup-sizing-default"
           style="width: 240px"
           v-model="inputCaseName">
    <button
        class="btn btn-outline-success"
        type="button"
        @click="checkFolderName"
        :disabled="!inputCaseName || !selectedFile">檢查資料夾名稱</button>
  </div>
  <button
      class="btn btn-outline-success"
      type="button"
      @click="uploadDataFilesAndFileNameMapFile"
      :disabled="openUploadDataFilesAndFileNameMapFileButton"
      style="margin-top: 10px">上傳檔案並修改檔名</button>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import SweetAlert2 from 'sweetalert2';
import {onMounted, ref} from "vue";
import { useFileNameStore } from "@/stores/usefilename-store.js";

const selectedFile = ref(null);
const selectedFileNameMapFile = ref(null);
const inputCaseName = ref('');

// //使用 pinia
const fileNameStore = useFileNameStore();

//是否顯示上傳 fileNameMap Excel 畫面
const showUploadFileNameMap = ref(false);

//是否開啟 "上傳檔案並修改檔名" 按鈕
const openUploadDataFilesAndFileNameMapFileButton = ref(true);

const onFileChange = async (event) => {
  selectedFile.value = event.target.files;
};

const onMapFileChange = async (event) => {
  selectedFileNameMapFile.value = event.target.files;
};


onMounted(
    async () => {
      if (Object.keys(fileNameStore.getFileNameMap()).length === 0) {
        showUploadFileNameMap.value = true;
        await SweetAlert2.fire({
          icon: 'success',
          title: '資料緩存區無資料',
          html: `<P>需上傳 \"組別名稱對照 Excel 檔\" ！</P>`
        });
      }
    }
);

const uploadDataFilesAndFileNameMapFile = async () => {

  const formData = new FormData();
  for (let i = 0; i < selectedFile.value.length; i++) {
    formData.append("files", selectedFile.value[i]);
  }

  if(selectedFileNameMapFile.value && selectedFileNameMapFile.value.length > 0){
    formData.append("mapExcelFile", selectedFileNameMapFile.value[0]);
  } else {
    formData.append("mapExcelFile", "null");
  }

  formData.append("inputCaseName", inputCaseName.value);

  // 添加文件名稱對應 Map（將 Map 轉換為 JSON）
  const fileNameMapObject = fileNameStore.getFileNameMap(); // Map -> Object
  formData.append("fileNameMap", JSON.stringify(fileNameMapObject));

  const response = await axiosApi.post("/updateFileName/reFileNameExceptCWave", formData);
  await SweetAlert2.fire({
    icon: 'success',
    title: response.data
  });
  openUploadDataFilesAndFileNameMapFileButton.value = true;
}

const checkFolderName = async () => {

  let data = {
    "fileName": selectedFile.value[0].name,
    "inputCaseName": inputCaseName.value
  };

  const response = await axiosApi.post("/common/checkFolderName", data);

  if(response.data === true){
    openUploadDataFilesAndFileNameMapFileButton.value = true;
    await SweetAlert2.fire({
      icon: 'error',
      title: '資料夾名稱已存在',
      html: `<P>請重新輸入！</P>`
    });
    inputCaseName.value = '';
  } else {
    openUploadDataFilesAndFileNameMapFileButton.value = false;
    await SweetAlert2.fire({
      icon: 'success',
      title: '可使用此資料夾名稱'
    });
  }
}

</script>

<style scoped>

</style>