<template>
  <h1 style="padding-bottom: 5px">{{$t('VEPTitle')}}</h1>
  <div class="input-group" style="width: 540px">
    <upload-util
        :i18nText="i18nText"
        :disabled="showTables"
        :loading="loading"
        :isDragging="isDragging"
        @file-change="backedUploadUtilFileChangeData"
    />
<!--    <input class="form-control form-control-lg"-->
<!--           id="formFileLg"-->
<!--           type="file"-->
<!--           multiple-->
<!--           @change="onFileChange"-->
<!--           name="files"-->
<!--           :disabled="showTables"-->
<!--           style="width: 270px">-->
<!--    <div class="d-flex align-items-center form-control" v-if="loading === true" style="width: 130px">-->
<!--      <strong>Loading...</strong>-->
<!--      <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>-->
<!--    </div>-->
    <select class="form-select" style="width: 130px; border-color: green; color: green" v-if="selectedFile && loading === false" v-model="selectedGroup">
      <option value="null" selected :disabled="showTables">{{$t('DropDownSelect')}}</option>
      <option v-for="(name, index) in selectGroupName" :key="index" :value="name">{{name}}</option>
    </select>
    <button class="btn btn-outline-success"
            type="button"
            @click="clearInput"
            v-if="selectedFile">{{$t('ResetButton')}}</button>
  </div>
  <table class="table" v-if="showTables" style="margin-top: 10px">
    <thead>
    <tr>
      <th scope="col">{{$t('MouseNumber')}}</th>
      <th scope="col">{{$t('RP1N1')}}</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RN1P2')}}</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LP1N1')}}</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LN1P2')}}</th>
      <th scope="col">ms</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(entry, index) in combinedData" :key="index">
      <td style="user-select: none">{{entry.groupName}}</td>
      <td v-for="(value, i) in entry.data" :key="i" :class="{'highlight-column': [0, 2, 4, 6].includes(i)}" style="user-select: none">{{value}}</td>
    </tr>
    </tbody>
  </table>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableLeftEyeP1N1Values"
          v-if="showTables">{{$t('CopyLP1N1')}}</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableLeftEyeN1P2Values"
          v-if="showTables"
          style="margin-left: 10px">{{$t('CopyLN1P2')}}</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableRightEyeP1N1Values"
          v-if="showTables"
          style="margin-left: 10px">{{$t('CopyRP1N1')}}</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableRightEyeN1P2Values"
          v-if="showTables"
          style="margin-left: 10px">{{$t('CopyRN1P2')}}</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableAllEyeP1N1Values"
          v-if="showTables"
          style="margin-left: 10px">{{$t('CopyAllP1N1')}}</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyTableAllEyeN1P2Values"
          v-if="showTables"
          style="margin-left: 10px">{{$t('CopyAllN1P2')}}</button>
  <button class="btn btn-outline-success"
          @click="scrollToTop"
          style="position: fixed; bottom: 20px; right: 20px;"
          v-if="showTables">{{$t('ToTopButton')}}</button>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {computed, ref, watch} from 'vue';
import Swal from 'sweetalert2';
import JSConfetti from 'js-confetti'
import {useI18n} from "vue-i18n";
import { useUploaderI18n } from '@/composables/useUploaderI18n'
import UploadUtil from "@/components/UploadUtil.vue";

const selectedFile = ref(null);
const selectGroupName = ref([]);
const VEPRawData = ref([]);
const selectedGroup = ref(null);

const showTables = ref(false);

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer:800,
  onOpen: toast => {
    toast.addEventListener('mouseenter', Swal.stopTimer())
    toast.addEventListener('mouseleave', Swal.resumeTimer())
  }
});

//滑鼠移入移出
const isDragging = ref(false);

const confetti = new JSConfetti()

const loading = ref(false);

const { t, locale } = useI18n();

//接收 UploadUtil.vue 子元件傳回來的 File Change 值
const backedUploadUtilFileChangeData = (newData) => {
  let selectedFiles = [];
  Object.assign(selectedFiles, newData);
  selectedFile.value = selectedFiles;
}

const { i18nText } = useUploaderI18n();

// const onFileChange = async (event) => {
//   selectedFile.value = event.target.files;
//   // console.log(selectedFile.value)
// };


watch(
    //要監聽的物件
    () => selectedFile.value,
    //監聽到後要實作的方法
    async () => {
      try{
        const formData = new FormData();
        for(let i = 0; i < selectedFile.value.length; i++){
          formData.append("files", selectedFile.value[i]);
        }

        loading.value = true;  //開始加載

        const response = await axiosApi.post("/vep/excelDataToTable", formData);
        VEPRawData.value = response.data;
        // console.log(VEPRawData.value);

        const setGroupNames = new Set([]);
        for(let i = 0; i < VEPRawData.value.length; i++){
          setGroupNames.add(VEPRawData.value[i].groupName.substring(0, VEPRawData.value[i].groupName.indexOf('_')));
        }

        selectGroupName.value = Array.from(setGroupNames);

        loading.value = false;  // 完成加載
      } catch (error) {
        if (error.response && Array.isArray(error.response.data)) {
          const errorMessages = error.response.data;

          if (errorMessages.length === 1) {
            // 單一檔案錯誤的處理
            await Swal.fire({
              icon: 'error',
              title: '檔案錯誤',
              html: `<p>${errorMessages[0]}</p><P>請重新檢查 Excel 檔！</P>`  //單一錯誤訊息
            });
            // loading.value = false;  // 完成加載
            window.location.reload();
          } else {
            // 多個檔案錯誤的處理
            await Swal.fire({
              icon: 'error',
              title: '多個檔案錯誤',
              html: `<ol>${errorMessages.map(msg => {
                const dashes = '-'.repeat(50);  // 產生對應數量的破折號
                return `<li>${msg}</li><p>${dashes}</p>`;
              }).join('')}</ol><p>請重新檢查 Excel 檔！</p>`
            });
            // loading.value = false;  // 完成加載
            window.location.reload();
          }
        } else if(error.response.status === 500){
          await Swal.fire({
            icon: 'error',
            title: '檔案轉換限制',
            html: `<p>因所使用的格式轉換程式為免費版，有檔案轉換限制</p><P>請重新啟動服務 或 自行將檔案另存為 Excel 檔</P>`  //單一錯誤訊息
          });
          window.location.reload();
        } else {
          // 未知錯誤或非預期錯誤的處理
          await Swal.fire({
            icon: 'error',
            title: '未知錯誤',
            text: '恭喜您能見到厲害的程式設計師本人囉！'
          });
          loading.value = false;  // 完成加載
        }
      }
    }
);

// filteredData 為 selectGroup 選到的組別名稱的 data
const filteredData = computed(() => {
  if (selectedGroup.value === 'null') {
    return [];
  }
  return VEPRawData.value.filter((data) => {
    return selectedGroup.value === data.groupName.substring(0, data.groupName.indexOf('_'));
  });
});

const combinedData = computed(() => {
  const result = [];
  filteredData.value.forEach((data) => {
    result.push({ groupName: data.groupName, data: data.rightEyeData});
    // result.push({ groupName: data.groupName, data: data.leftEyeData});
  });
  return result;
});

watch(
    () => selectedGroup.value,
    () => {
      showTables.value = true;
      showConfetti()
    }
);

const copyTableRightEyeP1N1Values = () => {
  const col1 = combinedData.value.map(entry => entry.data[0]);
  // const col6 = combinedData.value.map(entry => entry.data[4]);
  // const col9 = combinedData.value.map(entry => entry.data[7]);

  // const valuesToCopy = [col3].map(col => col.join('\t')).join('\n');
  const valuesToCopy = col1.join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableRightEyeN1P2Values = () => {
  const col3 = combinedData.value.map(entry => entry.data[2]);
  const valuesToCopy = col3.join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableLeftEyeP1N1Values = () => {
  const col5 = combinedData.value.map(entry => entry.data[4]);

  const valuesToCopy = col5.join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableLeftEyeN1P2Values = () => {
  const col7 = combinedData.value.map(entry => entry.data[6]);

  const valuesToCopy = col7.join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableAllEyeP1N1Values = () => {
  const array1 = [];
  // const array2 = [];
  // const array3 = [];
  for(let i = 0; i < combinedData.value.length; i++){
    array1.push(combinedData.value[i].data[4]);
    array1.push(combinedData.value[i].data[0]);
    // array2.push(combinedData.value[i].data[13]);
    // array2.push(combinedData.value[i].data[4]);
    // array3.push(combinedData.value[i].data[16]);
    // array3.push(combinedData.value[i].data[7]);
  }

  const allValues = array1.join('\n');

  // 複製值到剪貼簿
  navigator.clipboard.writeText(allValues).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000,
      allowOutsideClick: false
    });
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableAllEyeN1P2Values = () => {
  const array1 = [];
  for(let i = 0; i < combinedData.value.length; i++){
    array1.push(combinedData.value[i].data[6]);
    array1.push(combinedData.value[i].data[2]);
  }

  const allValues = array1.join('\n');

  // 複製值到剪貼簿
  navigator.clipboard.writeText(allValues).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000,
      allowOutsideClick: false
    });
  }).catch(() => {
    Swal.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

//重新整理
const clearInput = () => {
  window.location.reload();
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

function showConfetti() {
  confetti.addConfetti()
}

</script>

<style scoped>
.highlight-column {
  background-color: palegreen;
}

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