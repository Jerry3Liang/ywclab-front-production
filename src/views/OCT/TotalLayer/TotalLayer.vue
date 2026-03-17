<template>
  <h1 style="padding-bottom: 5px">{{$t('TotalLayerTitle')}}</h1>
  <div style="display: flex; flex-wrap: wrap; width: 100%;">
    <div class="input-group" style="width: 785px">
      <upload-util
          :i18nText="i18nText"
          :disabled="showTables"
          :loading="loading"
          :isDragging="isDragging"
          @file-change="backedUploadUtilFileChangeData"
      />
<!--      <input class="form-control form-control-lg"-->
<!--             id="formFileLg"-->
<!--             type="file"-->
<!--             multiple-->
<!--             accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"-->
<!--             @change="onFileChange"-->
<!--             name="files"-->
<!--             :disabled="showTables"-->
<!--             style="width: 270px">-->
<!--      <div class="d-flex align-items-center form-control" v-if="loading === true" style="width: 130px">-->
<!--        <strong>Loading...</strong>-->
<!--        <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>-->
<!--      </div>-->
<!--      <select class="form-select" style="width: 130px; border-color: green; color: green" v-if="selectedFile && loading === false" v-model="selectedGroup" @change="trackSelection">-->
<!--        <option value="null" selected :disabled="showTables">{{$t('DropDownSelect')}}</option>-->
<!--        <option v-for="(name, index) in selectGroupName" :key="index" :value="name">{{name}}</option>-->
<!--      </select>-->
      <button class="btn btn-outline-success"
              type="button"
              @click="clearInput"
              v-if="selectedFile">{{$t('ResetButton')}}</button>
      <button class="btn btn-outline-success"
              id="inputGroup-sizing-default"
              type="button"
              @click="downloadOCTTotalLayerData"
              v-if="showTables"
              style="border-radius: 0 5px 5px 0">{{$t('DownloadButton')}}</button>
      <b v-if="showTables" style="margin-left: 5px; margin-top: 10px; color: #bb2d3b">(可拖移組別決定 Excel 呈現順序)</b>
    </div>
  </div>
  <div v-if="selectedFile" class="group-area">
    <div class="d-flex align-items-center form-control" v-if="loading" style="width: 130px; border: none; color: green">
      <strong>{{ i18nText.uploadingText }}</strong>
      <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
    </div>
    <div v-if="selectedFile && loading === false" class="group-list">
      <h4 class="group-p">請點擊組別顯示數據 : </h4>
      <VueDraggable
          v-model="selectGroupName"
          class="group-list"
          item-key="name"
          animation="200"
      >
        <div
            v-for="(name, index) in selectGroupName"
            :key="index"
            class="group-item"
            :class="{ active: selectedGroup === name }"
            @click="selectGroup(name)"
        ><h4>{{ name }}</h4></div>
      </VueDraggable>
    </div>
  </div>
  <table class="table" v-if="showTables" style="margin-top: 10px">
    <thead>
    <tr>
      <th scope="col">{{$t('MouseNumber')}}</th>
      <th scope="col">-800</th>
      <th scope="col">-700</th>
      <th scope="col">-600</th>
      <th scope="col">-500</th>
      <th scope="col">-400</th>
      <th scope="col">-300</th>
      <th scope="col">-200</th>
      <th scope="col">-100</th>
      <th scope="col">0</th>
      <th scope="col">100</th>
      <th scope="col">200</th>
      <th scope="col">300</th>
      <th scope="col">400</th>
      <th scope="col">500</th>
      <th scope="col">600</th>
      <th scope="col">700</th>
      <th scope="col">800</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="data in filteredData">
      <td style="user-select: none">{{data.groupName}}</td>
      <td v-for="ndata in data.octtoTalLayerdataList" style="user-select: none">{{ndata}}</td>
    </tr>
    </tbody>
  </table>
  <button class="btn btn-outline-success"
          @click="copyLeftEyeTable"
          v-if="showTables">{{$t('LeftCopyButton')}}</button>
  <button class="btn btn-outline-success"
          @click="copyRightEyeTable"
          v-if="showTables"
          style="margin-left: 10px">{{$t('RightCopyButton')}}</button>
  <button class="btn btn-outline-success"
          @click="copyTable"
          v-if="showTables"
          style="margin-left: 10px">{{$t('BothEyesCopyButton')}}</button>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {computed, ref, watch} from 'vue';
import SweetAlert2 from 'sweetalert2';
import JSConfetti from 'js-confetti'
import {useI18n} from "vue-i18n";
import { useUploaderI18n } from '@/composables/useUploaderI18n'
import UploadUtil from "@/components/UploadUtil.vue";
import { VueDraggable } from 'vue-draggable-plus';

const selectedFile = ref(null);
const selectGroupName = ref([]);
const octTotalLayerData = ref([]);
const selectedGroup = ref(null);

const showTables = ref(false);

//下載相關
const finalDataMap = ref(new Map());
// const finalMapForBackend = ref(new Map());
// const everSelectedOptions = ref(new Set()); //使用 Set 來追蹤曾經選擇過的選項

const Toast = SweetAlert2.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  didOpen: toast => {
    toast.addEventListener('mouseenter', SweetAlert2.stopTimer)
    toast.addEventListener('mouseleave', SweetAlert2.resumeTimer)
  }
});

//滑鼠移入移出
const isDragging = ref(false);

const confetti = new JSConfetti();
const hasShownConfetti = ref(false)

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

        const response = await axiosApi.post("/totalLayer/excelDataToTable", formData);
        octTotalLayerData.value = response.data;
        finalDataMap.value = response.data;
        console.log(octTotalLayerData.value);

        const setGroupNames = new Set([]);
        for(let i = 0; i < octTotalLayerData.value.length; i++){
          setGroupNames.add(octTotalLayerData.value[i].groupName.substring(0, octTotalLayerData.value[i].groupName.indexOf('_')));
        }

        selectGroupName.value = Array.from(setGroupNames);

        loading.value = false;  // 完成加載
      } catch (error) {
        if (error.response && Array.isArray(error.response.data)) {
          const errorMessages = error.response.data;

          if (errorMessages.length === 1) {
            // 單一檔案錯誤的處理
            await SweetAlert2.fire({
              icon: 'error',
              title: '檔案錯誤',
              html: `<p>${errorMessages[0]}</p><P>請重新檢查 Excel 檔！</P>`  //單一錯誤訊息
            });
            window.location.reload();
          } else {
            // 多個檔案錯誤的處理
            await SweetAlert2.fire({
              icon: 'error',
              title: '多個檔案錯誤',
              html: `<ol>${errorMessages.map(msg => {
                const dashes = '-'.repeat(50);  // 產生對應數量的破折號
                return `<li>${msg}</li><p>${dashes}</p>`;
              }).join('')}</ol><p>請重新檢查 Excel 檔！</p>`
            });
            window.location.reload();
          }
        } else {
          // 未知錯誤或非預期錯誤的處理
          await SweetAlert2.fire({
            icon: 'error',
            title: '發生錯誤',
            text: '請稍後再試',
          });
        }
      }
    }
);

//filteredData 為 selectGroup 選到的組別名稱的 data
const filteredData = computed(() => {
  if (selectedGroup.value === 'null') {
    return [];
  }

  return octTotalLayerData.value.filter((data) => {
    return selectedGroup.value === data.groupName.substring(0, data.groupName.indexOf('_'));
  });
});

watch(
    () => filteredData.value,
    () => {
      const result = [];
      const resultMap = new Map();
      filteredData.value.forEach((data) => {
        result.push({ groupName: data.groupName, data: data.octtoTalLayerdataList});
      });
      for(let i = 0; i < result.length; i++ ){
        resultMap.set(result[i].groupName, result[i].data);
      }
      // finalDataMap.value = resultMap;
      // console.log(result)
    }
)

watch(
    () => selectGroupName.value.length,
    (newLength, oldLength) => {
      if (newLength > 0 && oldLength === 0 && !hasShownConfetti.value) {
        showConfetti()
        hasShownConfetti.value = true
      }
    })

//監控 finalDataMap，下拉選單一切換
// watch(
//     () => finalDataMap.value,
//     () => {
//       finalDataMap.value.forEach((key, value) => {
//         finalMapForBackend.value.set(value, key);
//       })
//     }
// )

watch(
    () => selectedGroup.value,
    () => {
      showTables.value = true;
      hasShownConfetti.value = false
      // showConfetti()
    }
);

const downloadOCTTotalLayerData = async () => {
  const orderedMap = buildOrderedMapForBackend()
  let data = {
    // "octTotalLayerDataMapSet" : Object.fromEntries(finalMapForBackend.value)
    "octTotalLayerDataMapSet" : Object.fromEntries(orderedMap)
  };

  const response = await axiosApi.post("/totalLayer/downloadOCTTotalLayerData", data, {
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
  let fileName = formattedDate + '_OCT-Total Layer.xlsx';//預設文件名

  // 建立 Blob URL 並下載
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName); // 使用從後端獲取的文件名
  document.body.appendChild(link);
  link.click();

  //清理資源
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

//監聽 selectedOption 的變化，追蹤曾經選擇過的選項
// const trackSelection = () => {
//   if (selectedGroup.value) {
//     everSelectedOptions.value.add(selectedGroup.value);
//     // console.log(everSelectedOptions.value)
//   }
// };

const selectGroup = (name) => {
  selectedGroup.value = name
}

const buildOrderedMapForBackend = () => {
  const orderedMap = new Map()

  selectGroupName.value.forEach(groupPrefix => {
    // 依照拖曳順序找對應資料
    finalDataMap.value.forEach((data) => {
      if (data.groupName.startsWith(groupPrefix + '_')) {
        orderedMap.set(data.groupName, data.octtoTalLayerdataList)
      }
    })
  })

  return orderedMap
}

//判斷是否所有選項都曾被選取過
const isAllEverSelected = computed(() => {
  return selectGroupName.value.every(option => everSelectedOptions.value.has(option));
});

const copyLeftEyeTable = () => {
  const filteredTableData = filteredData.value.filter(data =>
      data.groupName.charAt(data.groupName.indexOf('_') + 3) === 'L'
  ).map(data => [...data.octtoTalLayerdataList]);

  const transposedData = filteredTableData[0].map((_, colIndex) => filteredTableData.map(row => row[colIndex]));
  const textToCopy = transposedData.map(row => row.join('\t')).join('\n');

  navigator.clipboard.writeText(textToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000
    });
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyRightEyeTable = () => {
  const filteredTableData = filteredData.value.filter(data =>
      data.groupName.charAt(data.groupName.indexOf('_') + 3) === 'R'
  ).map(data => [...data.octtoTalLayerdataList]);

  const transposedData = filteredTableData[0].map((_, colIndex) => filteredTableData.map(row => row[colIndex]));
  const textToCopy = transposedData.map(row => row.join('\t')).join('\n');

  navigator.clipboard.writeText(textToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000
    });
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTable = () => {
  const tableData = filteredData.value.map(data => [...data.octtoTalLayerdataList]);
  const transposedData = tableData[0].map((_, colIndex) => tableData.map(row => row[colIndex]));
  const textToCopy = transposedData.map(row => row.join('\t')).join('\n');

  navigator.clipboard.writeText(textToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000
    })
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

//重新整理
const clearInput = () => {
  window.location.reload();
};

function showConfetti() {
  confetti.addConfetti()
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

.group-area {
  width: 100%;
  margin-top: 6px;
}

.group-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.group-p {
  margin-top: 3px;
}

.group-item {
  padding: 3px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.group-item:hover:not(.active) {
  background-color: #f1f3f5;
}

.group-item.active {
  background-color: #e2e6ea;
  font-weight: 500;
}

.group-item:active {
  transform: scale(0.98);
}
</style>