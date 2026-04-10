<template>
  <h1 style="padding-bottom: 5px">{{$t('CWaveTitle')}}</h1>
  <div style="display: flex; flex-wrap: wrap; width: 100%;">
    <div class="input-group" style="width: 785px">
      <upload-util
          :i18nText="i18nText"
          :disabled="showTables"
          :loading="loading"
          :isDragging="isDragging"
          @file-change="backedUploadUtilFileChangeData"
      />
      <!-- 限制上傳檔案只能是副檔名為 .xls 及 .xlsx 的 Excel 檔，在 <input> 標籤加入 accept 屬性，值為 MIME type：accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" -->
<!--      <div class="d-flex align-items-center gap-2">-->
<!--        &lt;!&ndash; 隱藏原生 file input &ndash;&gt;-->
<!--        <input-->
<!--            ref="fileInput"-->
<!--            type="file"-->
<!--            class="form-control"-->
<!--            style="display: none"-->
<!--            multiple-->
<!--            @change="handleFileChange"-->
<!--            name="files"-->
<!--            :disabled="showTables"-->
<!--        />-->
<!--        &lt;!&ndash; 自訂按鈕 &ndash;&gt;-->
<!--        <button-->
<!--            class="btn btn-outline-success btn-lg"-->
<!--            @click="triggerFileInput"-->
<!--            :disabled="showTables"-->
<!--            style="border-radius: 5px 0 0 5px">{{$t('chooseFile')}}</button>-->

<!--        &lt;!&ndash; 顯示選擇結果 &ndash;&gt;-->
<!--        <div class="text-muted small">-->
<!--          <template v-if="fileNames.length">-->
<!--            <div-->
<!--                class="custom-file-button"-->
<!--                @mouseover="showData(fileNames)"-->
<!--                @mouseleave="hideData"-->
<!--                :data-bs-toggle="isDragging ? '' : 'tooltip'"-->
<!--                :data-bs-placement="'bottom'"-->
<!--                :title="hoveredItem === fileNames ? fileNames.join('\n') : ''">{{$t('alreadySelected')}}：{{fileNames.length}}{{fileNames.length > 1 ? $t('quantifiers') : $t('quantifier')}}</div>-->
<!--          </template>-->
<!--          <template v-else>-->
<!--            <div class="custom-file-button">{{$t('noFileSelected')}}</div>-->
<!--          </template>-->
<!--        </div>-->
<!--      </div>-->
<!--      <input class="form-control form-control-lg"-->
<!--             id="formFileLg"-->
<!--             type="file"-->
<!--             multiple-->
<!--             @change="onFileChange"-->
<!--             name="files"-->
<!--             style="width: 270px"-->
<!--             :disabled="showTables">-->
<!--      <div class="d-flex align-items-center form-control" v-if="loading === true" style="width: 130px; border: solid; color: green">-->
<!--        <strong>{{$t('uploading')}}</strong>-->
<!--        <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>-->
<!--      </div>-->
<!--      <select class="form-select" style="width: 130px; border-color: green; color: green" v-if="selectedFile && loading === false" v-model="selectedGroup" @change="trackSelection">-->
<!--        <option value="null" selected :disabled="showTables">{{$t('DropDownSelect')}}</option>-->
<!--        <option v-for="(name, index) in selectGroupName" :key="index" :value="name">{{name}}</option>-->
<!--      </select>-->
      <button
          class="btn btn-outline-success"
          type="button"
          @click="clearInput"
          v-if="selectedFile">{{$t('ResetButton')}}</button>
      <button class="btn btn-outline-success"
              id="inputGroup-sizing-default"
              type="button"
              @click="downloadCWaveTableData"
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
      <th scope="col">{{$t('LeftEyeDataA')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LeftEyeDataB')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('LeftEyeDataC')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RightEyeDataA')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RightEyeDataB')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
      <th scope="col">{{$t('RightEyeDataC')}}</th>
      <th scope="col">µV</th>
      <th scope="col">ms</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="entry in combinedData" :key="entry.id">
      <td style="user-select: none">{{entry.groupName}}</td>
      <!-- Left Eye (LE) -->
      <td style="user-select: none">{{ entry.data[1].awave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[1].awave.value }}</td>
      <td style="user-select: none">{{ entry.data[1].awave.milliSeconds }}</td>

      <td style="user-select: none">{{ entry.data[1].bwave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[1].bwave.value }}</td>
      <td style="user-select: none">{{ entry.data[1].bwave.milliSeconds }}</td>

      <td style="user-select: none">{{ entry.data[1].cwave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[1].cwave.value }}</td>
      <td style="user-select: none">{{ entry.data[1].cwave.milliSeconds }}</td>

      <!-- Right Eye (RE) -->
      <td style="user-select: none">{{ entry.data[0].awave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[0].awave.value }}</td>
      <td style="user-select: none">{{ entry.data[0].awave.milliSeconds }}</td>

      <td style="user-select: none">{{ entry.data[0].bwave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[0].bwave.value }}</td>
      <td style="user-select: none">{{ entry.data[0].bwave.milliSeconds }}</td>

      <td style="user-select: none">{{ entry.data[0].cwave.waveName }}</td>
      <td class="highlight-column" style="user-select: none">{{ entry.data[0].cwave.value }}</td>
      <td style="user-select: none">{{ entry.data[0].cwave.milliSeconds }}</td>

<!--      <td v-for="(value, i) in entry.data" :key="i" :class="{'highlight-column': [1, 4, 7, 10, 13, 16].includes(i)}" style="user-select: none">{{value}}</td>-->
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
import {useI18n} from "vue-i18n";
import { useUploaderI18n } from '@/composables/useUploaderI18n';
import UploadUtil from "@/components/UploadUtil.vue";
import {VueDraggable} from "vue-draggable-plus";


//const fileInput = ref(null)
//滑鼠移入顯示檔名
//const fileNames = ref([])

const selectedFile = ref(null);
const selectGroupName = ref([]);
const cWaveRawData = ref([]);
const selectedGroup = ref(null);

const showTables = ref(false);

//下載相關
// const finalDataMap = ref(new Map());
// const finalExpDateMap = ref(new Map());
// const finalLuxMap = ref(new Map());
// const finalMapForBackend = ref(new Map());
// const finalExpDateMapForBackend = ref(new Map());
// const finalLuxMapForBackend = ref(new Map());

// const everSelectedOptions = ref(new Set()); //使用 Set 來追蹤曾經選擇過的選項

const Toast = SweetAlert2.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer:800,
  didOpen: toast => {
    toast.addEventListener('mouseenter', SweetAlert2.stopTimer)
    toast.addEventListener('mouseleave', SweetAlert2.resumeTimer)
  }
});


const confetti = new JSConfetti();
const hasShownConfetti = ref(false);

const loading = ref(false);

const { t, locale } = useI18n();

//滑鼠移入移出
//const hoveredItem = ref(null);
const isDragging = ref(false);

// const onFileChange = async (event) => {
//   selectedFile.value = event.target.files;
// };

//接收 UploadUtil.vue 子元件傳回來的 File Change 值
const backedUploadUtilFileChangeData = (newData) => {
  let selectedFiles = [];
  Object.assign(selectedFiles, newData);
  selectedFile.value = selectedFiles;
}

const { i18nText } = useUploaderI18n();

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
        console.log(cWaveRawData.value);

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
  // const resultExpDateMap = new Map();
  // const resultLuxMap = new Map();
  filteredData.value.forEach((data) => {
    result.push({ groupName: data.groupName, data: data.eyeDataOne });
    result.push({ groupName: data.groupName, data: data.eyeDataTwo });
  });

  for(let i = 0; i < result.length; i += 2 ){
    resultMap.set(result[i].groupName + '-1', result[i].data);
    resultMap.set(result[i + 1].groupName + '-2', result[i + 1].data);
  }

  return result;
});

// const combinedData = computed(() => {
//   const result = [];
//   const resultMap = new Map();
  // const resultExpDateMap = new Map();
  // const resultLuxMap = new Map();
  // filteredData.value.forEach((data) => {
  //   result.push({ groupName: data.groupName, data: data.eyeDataOne });
  //   result.push({ groupName: data.groupName, data: data.eyeDataTwo });
  // });

  // filteredData.value.forEach((data) => {
  //   result.push({ groupName: data.groupName, data: data.eyeDataOne, expDate: data.expDate, lux: data.lux });
  //   result.push({ groupName: data.groupName, data: data.eyeDataTwo, expDate: data.expDate, lux: data.lux });
  // });

  // for(let i = 0; i < result.length; i += 2 ){
  //   resultMap.set(result[i].groupName + '-1', result[i].data);
  //   resultMap.set(result[i + 1].groupName + '-2', result[i + 1].data);
    // resultExpDateMap.set(result[i].groupName + '-1', result[i].expDate);
    // resultExpDateMap.set(result[i + 1].groupName + '-2', result[i + 1].expDate);
    // resultLuxMap.set(result[i].groupName + '-1', result[i].lux);
    // resultLuxMap.set(result[i + 1].groupName + '-2', result[i + 1].lux);
  // }

  // finalDataMap.value = resultMap;
  // console.log(finalDataMap.value)
  // finalExpDateMap.value = resultExpDateMap;
  // finalLuxMap.value = resultLuxMap;

//   return result;
// });

//監控 finalDataMap，下拉選單一切換
// watch(
//     () => finalDataMap.value,
//     () => {
//       finalDataMap.value.forEach((key, value) => {
//         finalMapForBackend.value.set(value, key);
//       })
//     }
// );

//監控 finalExpDateMap，下拉選單一切換
// watch(
//     () => finalExpDateMap.value,
//     () => {
//       finalExpDateMap.value.forEach((key, value) => {
//         finalExpDateMapForBackend.value.set(value, key);
//       })
//     }
// );

//監控 finalLuxMap，下拉選單一切換
// watch(
//     () => finalLuxMap.value,
//     () => {
//       finalLuxMap.value.forEach((key, value) => {
//         finalLuxMapForBackend.value.set(value, key);
//       })
//     }
// );

watch(
    () => selectGroupName.value.length,
    (newLength, oldLength) => {
      if (newLength > 0 && oldLength === 0 && !hasShownConfetti.value) {
        showConfetti()
        hasShownConfetti.value = true
      }
    })

watch(
    () => selectedGroup.value,
    () => {
      showTables.value = true;
      hasShownConfetti.value = false
      // showConfetti()
    }
);

const downloadCWaveTableData = async () => {
  const orderedMap = buildOrderedMapForBackend();
  console.log(orderedMap)
  let data = {
    "cWaveTableDataMapSet" : Object.fromEntries(orderedMap)
    // "expDateMapSet" : Object.fromEntries(finalExpDateMapForBackend.value),
    // "luxDataMapSet" : Object.fromEntries(finalLuxMapForBackend.value)
  };

  console.log(JSON.stringify(data, null, 2))
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

const selectGroup = (name) => {
  selectedGroup.value = name
}

//監聽 selectedOption 的變化，追蹤曾經選擇過的選項
// const trackSelection = () => {
//   if (selectedGroup.value) {
//     everSelectedOptions.value.add(selectedGroup.value);
//     // console.log(everSelectedOptions.value)
//   }
// };

//判斷是否所有選項都曾被選取過
// const isAllEverSelected = computed(() => {
//   return selectGroupName.value.every(option => everSelectedOptions.value.has(option));
// });

const buildOrderedMapForBackend = () => {
  const orderedMap = new Map()

  // const groupMap = new Map();
  //
  // // 先 group
  // cWaveRawData.value.forEach((data) => {
  //   const groupPrefix = data.groupName.substring(0, data.groupName.indexOf('_'));
  //
  //   if (!groupMap.has(groupPrefix)) {
  //     groupMap.set(groupPrefix, []);
  //   }
  //
  //   groupMap.get(groupPrefix).push(data);
  // });
  //
  // // 每組處理
  // groupMap.forEach((groupList, groupPrefix) => {
  //   const leArr = [];
  //   const reArr = [];
  //
  //   groupList.forEach((item) => {
  //     const allEyes = [...item.eyeDataOne, ...item.eyeDataTwo];
  //
  //     allEyes.forEach((eyeData) => {
  //       const obj = {
  //         aWave: eyeData.awave,
  //         bWave: eyeData.bwave,
  //         cWave: eyeData.cwave
  //       };
  //
  //       if (eyeData.whichEye === 'LE') {
  //         leArr.push(obj);
  //       } else if (eyeData.whichEye === 'RE') {
  //         reArr.push(obj);
  //       }
  //     });
  //   });
  //
  //   // ⭐ 這裡才編號（關鍵）
  //   const leFinal = leArr.map((item, index) => ({
  //     whichNumber: index + 1,
  //     ...item
  //   }));
  //
  //   const reFinal = reArr.map((item, index) => ({
  //     whichNumber: index + 1,
  //     ...item
  //   }));
  //
  //   orderedMap.set(groupPrefix + '-LE', leFinal);
  //   orderedMap.set(groupPrefix + '-RE', reFinal);
  // });
  const result = [];
  const resultMap = new Map();

  cWaveRawData.value.forEach((data) => {
    result.push({ groupName: data.groupName, data: data.eyeDataOne });
    result.push({ groupName: data.groupName, data: data.eyeDataTwo });
  });

  for(let i = 0; i < result.length; i += 2 ){
    resultMap.set(result[i].groupName + '-1', result[i].data);
    resultMap.set(result[i + 1].groupName + '-2', result[i + 1].data);
  }

  selectGroupName.value.forEach(groupPrefix => {
    // 依照拖曳順序找對應資料
    resultMap.forEach((value, key) => {
      if (key.startsWith(groupPrefix + '_')) {
        orderedMap.set(key, value)
      }
    })
  })

  return orderedMap
}

const copyTableRightEyeValues = () => {
  const col3 = combinedData.value.map(entry => entry.data[0].awave.value);
  const col6 = combinedData.value.map(entry => entry.data[0].bwave.value);
  const col9 = combinedData.value.map(entry => entry.data[0].cwave.value);

  const valuesToCopy = [col3, col6, col9].map(col => col.join('\t')).join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000
    })
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

const copyTableLeftEyeValues = () => {
  const col12 = combinedData.value.map(entry => entry.data[1].awave.value);
  const col15 = combinedData.value.map(entry => entry.data[1].bwave.value);
  const col18 = combinedData.value.map(entry => entry.data[1].cwave.value);

  const valuesToCopy = [col12, col15, col18].map(col => col.join('\t')).join('\n');

  navigator.clipboard.writeText(valuesToCopy).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000
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
    arrayAWave.push(combinedData.value[i].data[1].awave.value);
    arrayAWave.push(combinedData.value[i + 1].data[1].awave.value);
    arrayAWave.push(combinedData.value[i].data[0].awave.value);
    arrayAWave.push(combinedData.value[i + 1].data[0].awave.value);
    arrayBWave.push(combinedData.value[i].data[1].bwave.value);
    arrayBWave.push(combinedData.value[i + 1].data[1].bwave.value);
    arrayBWave.push(combinedData.value[i].data[0].bwave.value);
    arrayBWave.push(combinedData.value[i + 1].data[0].bwave.value);
    arrayCWave.push(combinedData.value[i].data[1].cwave.value);
    arrayCWave.push(combinedData.value[i + 1].data[1].cwave.value);
    arrayCWave.push(combinedData.value[i].data[0].cwave.value);
    arrayCWave.push(combinedData.value[i + 1].data[0].cwave.value);
    i++;
  }

  const allValues = [arrayAWave, arrayBWave, arrayCWave].map(col => col.join('\t')).join('\n');

  //複製值到剪貼簿
  navigator.clipboard.writeText(allValues).then(() => {
    Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000
    });
  }).catch(() => {
    SweetAlert2.fire('複製失敗', '表格值複製失敗', 'error');
  });
};

// const showData = (item) => {
//   if (!isDragging.value) {
//     hoveredItem.value = item;
//   }
// }

// const hideData = () => {
//   hoveredItem.value = null;
// }

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