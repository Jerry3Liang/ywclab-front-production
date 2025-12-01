<template>
  <h1 style="padding-bottom: 5px">{{$t('CWaveTitle')}}</h1>
  <div style="display: flex; flex-wrap: wrap; width: 100%;">
    <div class="input-group" style="width: 540px">
      <!-- 限制上傳檔案只能是副檔名為 .xls 及 .xlsx 的 Excel 檔，在 <input> 標籤加入 accept 屬性，值為 MIME type：accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" -->
      <div class="d-flex align-items-center gap-2">
        <!-- 隱藏原生 file input -->
        <input
            ref="fileInput"
            type="file"
            class="form-control"
            style="display: none"
            multiple
            @change="handleFileChange"
            name="files"
            :disabled="showTables"
        />
        <!-- 自訂按鈕 -->
        <button
            class="btn btn-outline-success btn-lg"
            @click="triggerFileInput"
            :disabled="showTables"
            style="border-radius: 5px 0 0 5px">{{$t('chooseFile')}}</button>

        <!-- 顯示選擇結果 -->
        <div class="text-muted small">
          <template v-if="fileNames.length">
            <div
                class="custom-file-button"
                @mouseover="showData(fileNames)"
                @mouseleave="hideData"
                :data-bs-toggle="isDragging ? '' : 'tooltip'"
                :data-bs-placement="'bottom'"
                :title="hoveredItem === fileNames ? fileNames.join('\n') : ''">{{$t('alreadySelected')}}：{{fileNames.length}}{{fileNames.length > 1 ? $t('quantifiers') : $t('quantifier')}}</div>
          </template>
          <template v-else>
            <div class="custom-file-button">{{$t('noFileSelected')}}</div>
          </template>
        </div>
      </div>
<!--      <input class="form-control form-control-lg"-->
<!--             id="formFileLg"-->
<!--             type="file"-->
<!--             multiple-->
<!--             @change="onFileChange"-->
<!--             name="files"-->
<!--             style="width: 270px"-->
<!--             :disabled="showTables">-->
      <div class="d-flex align-items-center form-control" v-if="loading === true" style="width: 130px; border: solid; color: green">
        <strong>{{$t('uploading')}}</strong>
        <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
      </div>
      <select class="form-select" style="width: 130px; border-color: green; color: green" v-if="selectedFile && loading === false" v-model="selectedGroup" @change="trackSelection">
        <option value="null" selected :disabled="showTables">{{$t('DropDownSelect')}}</option>
        <option v-for="(name, index) in selectGroupName" :key="index" :value="name">{{name}}</option>
      </select>
      <button
          class="btn btn-outline-success"
          type="button"
          @click="clearInput"
          v-if="selectedFile">{{$t('ResetButton')}}</button>
    </div>
    <button class="btn btn-outline-success"
            id="inputGroup-sizing-default"
            type="button"
            @click="downloadCWaveTableData"
            v-if="showTables && isAllEverSelected"
            style="margin-left: 10px; border-radius: 30px">{{$t('DownloadButton')}}</button>
  </div>
  <table class="table" v-if="showTables" style="margin-top: 10px">
    <thead>
    <tr>
      <th scope="col">{{$t('MouseNumber')}}</th>
      <th scope="col">{{$t('RightEyeDataA')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RightEyeDataB')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RightEyeDataC')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LeftEyeDataA')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LeftEyeDataB')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LeftEyeDataC')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(entry, index) in combinedData" :key="index">
      <td style="user-select: none">{{entry.groupName}}</td>
      <td v-for="(value, i) in entry.data" :key="i" :class="{'highlight-column': [1, 4, 7, 10, 13, 16].includes(i)}" style="user-select: none">{{value}}</td>
    </tr>
    </tbody>
  </table>
  <div style="display: flex; flex-wrap: wrap; width: 100%;">
    <button class="btn btn-outline-success btn-sm"
            type="button"
            @click="copyTableLeftEyeValues"
            v-if="showTables">{{$t('LeftCopyButton')}}</button>
    <button class="btn btn-outline-success btn-sm"
            type="button"
            @click="copyTableRightEyeValues"
            v-if="showTables"
            style="margin-left: 10px">{{$t('RightCopyButton')}}</button>
    <button class="btn btn-outline-success btn-sm"
            type="button"
            @click="copyTableAllEyeValues"
            v-if="showTables"
            style="margin-left: 10px">{{$t('BothEyesCopyButton')}}</button>
  </div>
  <button class="btn btn-outline-success"
          @click="scrollToTop"
          style="position: fixed; bottom: 20px; right: 20px;"
          v-if="showTables">{{$t('ToTopButton')}}</button>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {computed, ref, watch} from 'vue';
import SweetAlert2 from 'sweetalert2';
import JSConfetti from 'js-confetti'

const fileInput = ref(null)
//滑鼠移入顯示檔名
const fileNames = ref([])

const selectedFile = ref(null);
const selectGroupName = ref([]);
const cWaveRawData = ref([]);
const selectedGroup = ref(null);

const showTables = ref(false);

const finalDataMap = ref(new Map());
const finalExpDateMap = ref(new Map());
const finalLuxMap = ref(new Map());
const finalMapForBackend = ref(new Map());
const finalExpDateMapForBackend = ref(new Map());
const finalLuxMapForBackend = ref(new Map());

const everSelectedOptions = ref(new Set()); //使用 Set 來追蹤曾經選擇過的選項

const Toast = SweetAlert2.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer:800,
  onOpen: toast => {
    toast.addEventListener('mouseenter', SweetAlert2.stopTimer())
    toast.addEventListener('mouseleave', SweetAlert2.resumeTimer())
  }
});

const confetti = new JSConfetti()

const loading = ref(false);

//滑鼠移入移出
const hoveredItem = ref(null);
const isDragging = ref(false);

// const onFileChange = async (event) => {
//   selectedFile.value = event.target.files;
// };

const handleFileChange = async (event) => {
  selectedFile.value = event.target.files;
  fileNames.value = Array.from(selectedFile.value).map(file => file.name)
}

const triggerFileInput = () => {
  fileInput.value?.click()
}


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

        loading.value = true;//開始加載

        const response = await axiosApi.post("/c_wave/excelDataToTable", formData);
        cWaveRawData.value = response.data;
        // console.log(cWaveRawData.value);

        const setGroupNames = new Set([]);
        for(let i = 0; i < cWaveRawData.value.length; i++){
          setGroupNames.add(cWaveRawData.value[i].groupName.substring(0, cWaveRawData.value[i].groupName.indexOf('_')));
        }

        selectGroupName.value = Array.from(setGroupNames);

        loading.value = false;//完成加載
      } catch (error) {
        if (error.response && Array.isArray(error.response.data)) {
          const errorMessages = error.response.data;

          if (errorMessages.length === 1) {
            //單一檔案錯誤的處理
            await SweetAlert2.fire({
              icon: 'error',
              title: '檔案錯誤',
              html: `<p>${errorMessages[0]}</p><P>請重新檢查 Excel 檔！</P>` //單一錯誤訊息
            });
            window.location.reload();
          } else {
            //多個檔案錯誤的處理
            await SweetAlert2.fire({
              icon: 'error',
              title: '多個檔案錯誤',
              html: `<ol>${errorMessages.map(msg => {
                const dashes = '-'.repeat(50);//產生對應數量的破折號
                return `<li>${msg}</li><p>${dashes}</p>`;
              }).join('')}</ol><p>請重新檢查 Excel 檔！</p>`
            });
            window.location.reload();
          }
        } else if(error.response.status === 500){
          await SweetAlert2.fire({
            icon: 'error',
            title: '檔案轉換限制',
            html: `<p>因所使用的格式轉換程式為免費版，有檔案轉換限制</p><P>請重新啟動服務 或 自行將檔案另存為 Excel 檔</P>` //單一錯誤訊息
          });
          window.location.reload();
        } else {
          //未知錯誤或非預期錯誤的處理
          await SweetAlert2.fire({
            icon: 'error',
            title: '未知錯誤',
            text: '恭喜您能見到厲害的程式設計師本人囉！'
          });
          loading.value = false;//完成加載
        }
      }
    }
);

//filteredData 為 selectGroup 選到的組別名稱的 data
const filteredData = computed(() => {
  if (selectedGroup.value === 'null') {
    return [];
  }
  return cWaveRawData.value.filter((data) => {
    return selectedGroup.value === data.groupName.substring(0, data.groupName.indexOf('_'));
  });
});

const combinedData = computed(() => {
  const result = [];
  const resultMap = new Map();
  const resultExpDateMap = new Map();
  const resultLuxMap = new Map();
  filteredData.value.forEach((data) => {
    result.push({ groupName: data.groupName, data: data.eyeDataOne, expDate: data.expDate, lux: data.lux });
    result.push({ groupName: data.groupName, data: data.eyeDataTwo, expDate: data.expDate, lux: data.lux });
  });

  for(let i = 0; i < result.length; i += 2 ){
    resultMap.set(result[i].groupName + '-1', result[i].data);
    resultMap.set(result[i + 1].groupName + '-2', result[i + 1].data);
    resultExpDateMap.set(result[i].groupName + '-1', result[i].expDate);
    resultExpDateMap.set(result[i + 1].groupName + '-2', result[i + 1].expDate);
    resultLuxMap.set(result[i].groupName + '-1', result[i].lux);
    resultLuxMap.set(result[i + 1].groupName + '-2', result[i + 1].lux);
  }

  finalDataMap.value = resultMap;
  finalExpDateMap.value = resultExpDateMap;
  finalLuxMap.value = resultLuxMap;

  return result;
});

//監控 finalDataMap，下拉選單一切換
watch(
    () => finalDataMap.value,
    () => {
      finalDataMap.value.forEach((key, value) => {
        finalMapForBackend.value.set(value, key);
      })
    }
);

//監控 finalExpDateMap，下拉選單一切換
watch(
    () => finalExpDateMap.value,
    () => {
      finalExpDateMap.value.forEach((key, value) => {
        finalExpDateMapForBackend.value.set(value, key);
      })
    }
);

//監控 finalLuxMap，下拉選單一切換
watch(
    () => finalLuxMap.value,
    () => {
      finalLuxMap.value.forEach((key, value) => {
        finalLuxMapForBackend.value.set(value, key);
      })
    }
);

watch(
    () => selectedGroup.value,
    () => {
      showTables.value = true;
      showConfetti()
    }
);

const downloadCWaveTableData = async () => {
  let data = {
    "cWaveTableDataMapSet" : Object.fromEntries(finalMapForBackend.value),
    "expDateMapSet" : Object.fromEntries(finalExpDateMapForBackend.value),
    "luxDataMapSet" : Object.fromEntries(finalLuxMapForBackend.value)
  };

  const response = await axiosApi.post("/c_wave/downloadCWaveTableData", data, {
    headers: {
      'Content-Type': 'application/json'
    },
    responseType: "blob"
  });

  let sTime = new Date();
  let year = sTime.getFullYear();//取得年份
  let month = String(sTime.getMonth() + 1).padStart(2, '0');//取得月份 (0-11)，所以需要 +1
  let day = String(sTime.getDate()).padStart(2, '0');//取得日期
  let hours = String(sTime.getHours()).padStart(2, '0');//取得小时
  let minutes = String(sTime.getMinutes()).padStart(2, '0');//取得分钟
  let seconds = String(sTime.getSeconds()).padStart(2, '0');//取得秒
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  // 從回應的 headers 中獲取文件名
  let fileName = formattedDate + '_C-Wave.xlsx';//預設文件名

  // 建立 Blob URL 並下載
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); //使用從後端獲取的文件名
  document.body.appendChild(link);
  link.click();

  //清理資源
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

//監聽 selectedOption 的變化，追蹤曾經選擇過的選項
const trackSelection = () => {
  if (selectedGroup.value) {
    everSelectedOptions.value.add(selectedGroup.value);
    // console.log(everSelectedOptions.value)
  }
};

//判斷是否所有選項都曾被選取過
const isAllEverSelected = computed(() => {
  return selectGroupName.value.every(option => everSelectedOptions.value.has(option));
});

const copyTableRightEyeValues = () => {
  const col3 = combinedData.value.map(entry => entry.data[1]);
  const col6 = combinedData.value.map(entry => entry.data[4]);
  const col9 = combinedData.value.map(entry => entry.data[7]);

  const valuesToCopy = [col3, col6, col9].map(col => col.join('\t')).join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableLeftEyeValues = () => {
  const col12 = combinedData.value.map(entry => entry.data[10]);
  const col15 = combinedData.value.map(entry => entry.data[13]);
  const col18 = combinedData.value.map(entry => entry.data[16]);

  const valuesToCopy = [col12, col15, col18].map(col => col.join('\t')).join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000,
      allowOutsideClick: false
    })
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableAllEyeValues = () => {
  let arrayAWave = [];
  let arrayBWave = [];
  let arrayCWave = [];

  for(let i = 0; i < combinedData.value.length; i++){
    arrayAWave.push(combinedData.value[i].data[10]);
    arrayAWave.push(combinedData.value[i + 1].data[10]);
    arrayAWave.push(combinedData.value[i].data[1]);
    arrayAWave.push(combinedData.value[i + 1].data[1]);
    arrayBWave.push(combinedData.value[i].data[13]);
    arrayBWave.push(combinedData.value[i + 1].data[13]);
    arrayBWave.push(combinedData.value[i].data[4]);
    arrayBWave.push(combinedData.value[i + 1].data[4]);
    arrayCWave.push(combinedData.value[i].data[16]);
    arrayCWave.push(combinedData.value[i + 1].data[16]);
    arrayCWave.push(combinedData.value[i].data[7]);
    arrayCWave.push(combinedData.value[i + 1].data[7]);
    i++;
  }

  const allValues = [arrayAWave, arrayBWave, arrayCWave].map(col => col.join('\t')).join('\n');

  //複製值到剪貼簿
  navigator.clipboard.writeText(allValues).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000,
      allowOutsideClick: false
    });
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const showData = (item) => {
  if (!isDragging.value) {
    hoveredItem.value = item;
  }
}

const hideData = () => {
  hoveredItem.value = null;
}

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
.custom-file-button {
  display: inline-block;
  padding: 0.4em 1em;
  font-size: 20px;
  margin-left: -9px;
  color: green;
  cursor: text;
  border: solid;
  height: 48px;
  user-select: none;
}

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