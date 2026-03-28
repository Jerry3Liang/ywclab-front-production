<template>
  <h1 style="padding-bottom: 5px">{{$t('OPsTitle')}}</h1>
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
<!--             id="formFileLg" type="file"-->
<!--             multiple-->
<!--             @change="onFileChange"-->
<!--             name="files"-->
<!--             :disabled="showCharts"-->
<!--             style="width: 270px">-->
<!--      <div class="d-flex align-items-center form-control" v-if="loading === true" style="width: 130px">-->
<!--        <strong>Loading...</strong>-->
<!--        <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>-->
<!--      </div>-->
<!--      <select class="form-select" style="width: 130px; border-color: green; color: green" v-if="selectedFile && loading === false" v-model="selectedGroup" @change="trackSelection">-->
<!--        <option value="null" selected>{{$t('DropDownSelect')}}</option>-->
<!--        <option v-for="(name, index) in selectGroupName" :key="index" :value="name">{{name}}</option>-->
<!--      </select>-->
      <button class="btn btn-outline-success"
              type="button"
              @click="clearInput"
              v-if="selectedFile">{{$t('ResetButton')}}</button>
      <button class="btn btn-outline-success"
              id="inputGroup-sizing-default"
              type="button"
              @click="downloadOPsData"
              v-if="showTables && isAllAnalyzed"
              style="border-radius: 0 5px 5px 0">{{$t('DownloadButton')}}</button>
      <b v-if="showCharts" style="margin-left: 5px; margin-top: 10px; color: #bb2d3b">(可拖移組別決定 Excel 呈現順序)</b>
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

  <div v-for="(data, index) in filteredData" :key="index" v-if="showCharts" class="row">
    <div class="card-content-image" style="padding-bottom: 40px; border-color: #a1ff94">
      <canvas :id="'leftEye' + index" ></canvas>
      <div class="input-group input-group-sm" style="width: 320px; margin-bottom: 10px">
        <span class="input-group-text" id="inputGroup-sizing-lg" style="border: none; background-color: #dcfce7">{{$t('TheLowestPoint')}}：</span>
        <select
            class="LOPs"
            :id="'leftEye' + index"
            v-model="leftSelect[index]"
            :disabled="showTables"
            style="border: none; background-color: #dcfce7"
            :class="{ 'select-error': selectErrors[index + '_left'] }"
            @change="delete selectErrors[index + '_left']"
        >
          <option value="LOP3">{{$t('OP3Trough')}}</option>
          <option value="LOP4">{{$t('OP4Trough')}}</option>
        </select>
        <div v-if="selectErrors[index + '_left']" class="select-error-text">未選擇</div>
      </div>
    </div>
    <div class="tableContainer">
      <table v-if="showTables && isAnalyzedGroupData" class="medical-table">
        <thead>
        <tr>
          <th>{{$t('LE')}}</th>
          <th v-for="(v, i) in OPsAnalyzedData[index]?.leftEyeOPsData"
              :key="'h'+i">
            OP{{ i + 1 }}
          </th>
          <th>OP2+3+4</th>
          <th>Total</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td style="font-weight: 600">{{$t('Value')}} (µV)</td>
          <td v-for="(v, i) in OPsAnalyzedData[index]?.leftEyeOPsData"
              :key="'v'+i">
            {{ v === 0 ? 'N/A' : v}}
          </td>
          <td>{{ OPsAnalyzedData[index]?.leftEyeOPs234 === 0 ? 'N/A' : OPsAnalyzedData[index]?.leftEyeOPs234 }}</td>
          <td>{{ OPsAnalyzedData[index]?.leftEyeOPsTotal === 0 ? 'N/A' : OPsAnalyzedData[index]?.leftEyeOPsTotal }}</td>
        </tr>
        <tr>
          <td style="font-weight: 600">ms</td>
          <td v-for="(v, i) in OPsAnalyzedData[index]?.leftEyeOPsMilliSec"
              :key="'m'+i">
            {{ v === 0 ? 'N/A' : v}}
          </td>
          <td>N/A</td>
          <td>N/A</td>
        </tr>
        </tbody>
      </table>
      <div v-if="showTables" class="copy-btn-wrapper">
        <button class="btn btn-outline-success"
                type="button"
                @click="copyToClipboard(getTableValues(index, 'left'))">{{$t('copyValue')}}</button>
      </div>
    </div>
    <div class="card-content-image" style="padding-bottom: 40px; border-color: #a1ff94">
      <canvas :id="'rightEye' + index" ></canvas>
      <div class="input-group input-group-sm" style="width: 320px; margin-bottom: 10px">
        <span id="inputGroup-sizing-lg" class="input-group-text" style="border: none; background-color: #dcfce7">{{$t('TheLowestPoint')}}：</span>
        <select
            class="ROPs"
            :id="'rightEye' + index"
            v-model="rightSelect[index]"
            :disabled="showTables"
            style="border: none; background-color: #dcfce7"
            :class="{ 'select-error': selectErrors[index + '_right'] }"
            @change="delete selectErrors[index + '_right']">
          <option value="LOP3">{{$t('OP3Trough')}}</option>
          <option value="LOP4">{{$t('OP4Trough')}}</option>
        </select>
        <div v-if="selectErrors[index + '_right']" class="select-error-text">未選擇</div>
      </div>
    </div>
    <div class="tableContainer">
      <table v-if="showTables && isAnalyzedGroupData" class="medical-table">
        <thead>
        <tr>
          <th>{{$t('RE')}}</th>
          <th v-for="(v, i) in OPsAnalyzedData[index]?.rightEyeOPsData"
              :key="'h'+i">
            OP{{ i + 1 }}
          </th>
          <th>OP2+3+4</th>
          <th>Total</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td style="font-weight: 600">{{$t('Value')}} (µV)</td>
          <td v-for="(v, i) in OPsAnalyzedData[index]?.rightEyeOPsData"
              :key="'v'+i">
            {{ v === 0 ? 'N/A' : v}}
          </td>
          <td>{{ OPsAnalyzedData[index]?.rightEyeOPs234 === 0 ? 'N/A' : OPsAnalyzedData[index]?.rightEyeOPs234 }}</td>
          <td>{{ OPsAnalyzedData[index]?.rightEyeOPsTotal === 0 ? 'N/A' : OPsAnalyzedData[index]?.rightEyeOPsTotal }}</td>
        </tr>
        <tr>
          <td style="font-weight: 600">ms</td>
          <td v-for="(v, i) in OPsAnalyzedData[index]?.rightEyeOPsMilliSec"
              :key="'m'+i">
            {{ v === 0 ? 'N/A' : v}}
          </td>
          <td>N/A</td>
          <td>N/A</td>
        </tr>
        </tbody>
      </table>
      <div v-if="showTables" class="copy-btn-wrapper">
        <button class="btn btn-outline-success"
                type="button"
                @click="copyToClipboard(getTableValues(index, 'right'))">{{$t('copyValue')}}</button>
      </div>
    </div>
  </div>
  <button class="btn btn-outline-success"
          @click="analyzeOPsData()"
          v-if="showCharts && !OPsAnalyzedData.length">{{$t('Analyze')}}</button>
  <button class="btn btn-outline-success"
          @click="copyAllLeftEyeValues"
          v-if="showCharts && OPsAnalyzedData.length">{{$t('LeftCopyButton')}}</button>
  <button class="btn btn-outline-success"
          @click="copyAllRightEyeValues"
          v-if="showCharts && OPsAnalyzedData.length"
          style="margin-left: 10px">{{$t('RightCopyButton')}}</button>
  <button class="btn btn-outline-success"
          @click="copyAllEyeValues"
          v-if="showCharts && OPsAnalyzedData.length"
          style="margin-left: 10px">{{$t('BothEyesCopyButton')}}</button>
  <button class="btn btn-outline-success"
          @click="scrollToTop"
          style="position: fixed; bottom: 20px; right: 20px;"
          v-if="showCharts">{{$t('ToTopButton')}}</button>
</template>

<script setup>
import axiosApi from '@/plugins/axios.js';
import {computed, nextTick, ref, watch} from "vue";
import Chart from "chart.js/auto";
import SweetAlert2 from 'sweetalert2';
import JSConfetti from 'js-confetti'
import {useI18n} from "vue-i18n";
import { useUploaderI18n } from '@/composables/useUploaderI18n'
import UploadUtil from "@/components/UploadUtil.vue";
import {VueDraggable} from "vue-draggable-plus";

const selectedFile = ref(null);
const OPsRawData = ref([]);
const selectGroupName = ref([]);
const selectedGroup = ref(null);
const showCharts = ref(false);
const charts = ref([]);

//分析 OPs
const rightSelect = ref({});
const leftSelect = ref({});
const OPsAnalyzedData = ref([]);
const showTables = ref(false);
const analyzedGroupData = ref(new Map());//將按過 "分析" 按鈕的結果存入 Map
const isAnalyzedGroupData = ref(false);

//下載 Excel
const finalDataMap = ref(new Map());
const finalMapForBackend = ref(new Map());

//const everSelectedOptions = ref(new Set()); //使用 Set 來追蹤曾經選擇過的選項

//SweetAlert2 樣式
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

//紀錄未選擇最低點下拉選單
const selectErrors = ref({})

//接收 UploadUtil.vue 子元件傳回來的 File Change 值
const backedUploadUtilFileChangeData = (newData) => {
  let selectedFiles = [];
  Object.assign(selectedFiles, newData);
  selectedFile.value = selectedFiles;
}

const { i18nText } = useUploaderI18n();

// const onFileChange = async (event) => {
//   selectedFile.value = event.target.files;
// };

watch(
    //要監聽的物件
    () => selectedFile.value,
    //監聽到後要實作的方法
    async () => {
      // console.log(selectedFile.value)
      try{
        const formData = new FormData();
        for(let i = 0; i < selectedFile.value.length; i++){
          formData.append("files", selectedFile.value[i]);
        }

        loading.value = true;  // 開始加載

        const response = await axiosApi.post("/ops/excelDataToLine", formData);
        OPsRawData.value = response.data;
        // console.log(OPsRawData.value);
        const setGroupNames = new Set([]);
        for(let i = 0; i < OPsRawData.value.length; i++){
          setGroupNames.add(OPsRawData.value[i].expGroupName.substring(0, OPsRawData.value[i].expGroupName.indexOf('_')));
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
            // loading.value = false;  // 完成加載
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
            // loading.value = false;  // 完成加載
            window.location.reload();
          }
        } else if(error.response.status === 500){
          await SweetAlert2.fire({
            icon: 'error',
            title: '檔案轉換限制',
            html: `<p>因所使用的格式轉換程式為免費版，有檔案轉換限制</p><P>請重新啟動服務 或 自行將檔案另存為 Excel 檔</P>`  //單一錯誤訊息
          });
          window.location.reload();
        } else {
          // 未知錯誤或非預期錯誤的處理
          await SweetAlert2.fire({
            icon: 'error',
            title: '未知錯誤',
            text: '恭喜您能見到厲害的程式設計師本人囉！'
          });
          loading.value = false;  // 完成加載
        }
      }
    }
);

//filteredData 為 selectGroup 選到的組別名稱的 data
const filteredData = computed(() => {
  if (selectedGroup.value === 'null') {
    return [];
  }
  return OPsRawData.value.filter((data) => {
    return selectedGroup.value === data.expGroupName.substring(0, data.expGroupName.indexOf('_'));
  });
});

watch(
    () => selectedGroup.value,
    () => {
      if (selectedGroup.value && selectedGroup.value !== 'null') {
        // console.log(filteredData.value);
        showCharts.value = true;
        nextTick(() => {
          destroyCharts();
          initCharts();
        });

        // 如果之前分析過
        if(analyzedGroupData.value.has(selectedGroup.value)){
          const groupData = analyzedGroupData.value.get(selectedGroup.value);
          OPsAnalyzedData.value = groupData.analyzedData;
          leftSelect.value = JSON.parse(JSON.stringify(groupData.leftSelect));
          rightSelect.value = JSON.parse(JSON.stringify(groupData.rightSelect));
          showTables.value = true;
          isAnalyzedGroupData.value = true;
        }else{
          OPsAnalyzedData.value = [];
          leftSelect.value = {};
          rightSelect.value = {};
          showTables.value = false;
          isAnalyzedGroupData.value = false;
        }
      } else {
        showCharts.value = false;
      }
    }
);

const initCharts = () => {
  // console.log(filteredData.value)
  filteredData.value.forEach((data, index) => {
    const rightCtx = document.getElementById("rightEye" + index);
    const rightMinValue = Math.min(...data.expRightEyeRawData);
    const minRightIndex = data.expRightEyeRawData.indexOf(rightMinValue);
    if (rightCtx) {
      const rightChart = new Chart(rightCtx, {
        type: "line",
        data: {
          labels: data.dataMilliSec,
          datasets: [
            {
              label: data.expGroupName,
              data: data.expRightEyeRawData,
              borderColor: '#8cb78c',
              backgroundColor: '#8cb78c',
              pointRadius: data.expRightEyeRawData.map((val, i) => (i === minRightIndex ? 5 : 0)),
              pointBackgroundColor: data.expRightEyeRawData.map((val, i) => (i === minRightIndex ? 'red' : 'rgba(0,0,0,0)'))
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                  font: {
                    size: 16,
                    weight: "bold"
                  }
              }
            },
            title: {
              display: true,
              text: t('chart.titleR'),
              font: {
                size: 25,
                weight: "bold"
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: t('chart.xAxis')
              }
            },
            y: {
              title: {
                display: true,
                text: t('chart.yAxis')
              }
            }
          }
        }
      });
      charts.value.push(rightChart);
    }
    const leftCtx = document.getElementById("leftEye" + index);
    const leftMinValue = Math.min(...data.expLeftEyeRawData);
    const minLeftIndex = data.expLeftEyeRawData.indexOf(leftMinValue);
    if (leftCtx) {
      const leftChart = new Chart(leftCtx, {
        //決定要哪種圖
        type: "line",
        data: {
          //X軸的 data
          labels: data.dataMilliSec,
          datasets: [
            {
              label: data.expGroupName,
              data: data.expLeftEyeRawData,
              borderColor: '#8cb78c',
              backgroundColor: '#8cb78c',
              pointRadius: data.expLeftEyeRawData.map((val, i) => (i === minLeftIndex ? 5 : 0)),
              pointBackgroundColor: data.expLeftEyeRawData.map((val, i) => (i === minLeftIndex ? 'red' : 'rgba(0,0,0,0)'))
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                  font: {
                    size: 16,
                    weight: "bold"
                  }
              }
            },
            title: {
              display: true,
              text: t('chart.titleL'),
              font: {
                size: 25,
                weight: "bold"
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: t('chart.xAxis')
              }
            },
            y: {
              title: {
                display: true,
                text: t('chart.yAxis')
              }
            }
          }
        },
      });
      charts.value.push(leftChart);
    }
  });
};

const analyzeOPsData = async () => {

  if(!validateSelect()){
    return;
  }
  selectErrors.value = {}

  let firstErrorElement = null
  let hasError = false

  filteredData.value.forEach((data, index) => {

    if (!leftSelect.value[index]) {

      selectErrors.value[`${index}_left`] = true
      hasError = true

      if (!firstErrorElement) {
        firstErrorElement = document.getElementById(`leftSelect_${index}`)
      }

    }

    if (!rightSelect.value[index]) {

      selectErrors.value[`${index}_right`] = true
      hasError = true

      if (!firstErrorElement) {
        firstErrorElement = document.getElementById(`rightSelect_${index}`)
      }
    }
  })

  if (hasError) {

    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
    } else {
      return;
    }}

  let data = filteredData.value.map((data, index) => ({
    expGroupName: data.expGroupName,
    rightEyeRawData: data.expRightEyeRawData,
    leftEyeRawData: data.expLeftEyeRawData,
    milliSec: data.dataMilliSec,
    rightMinPointSelected: rightSelect.value[index],
    leftMinPointSelected: leftSelect.value[index]
  }));

  const response = await axiosApi.post("/ops/analyzeOPs", data);
  showTables.value = true;
  isAnalyzedGroupData.value = true;
  // 存入 map
  analyzedGroupData.value.set(
      selectedGroup.value,
      {
        analyzed: true,
        analyzedData: response.data,
        leftSelect: JSON.parse(JSON.stringify(leftSelect.value)),
        rightSelect: JSON.parse(JSON.stringify(rightSelect.value))
      });
  OPsAnalyzedData.value = response.data;
  // console.log(OPsAnalyzedData.value)
  showConfetti();
  // scrollToTop();
}

const isAllAnalyzed = computed(() => {

  if (selectGroupName.value.length === 0) return false;

  return selectGroupName.value.every(group => {
    const cache = analyzedGroupData.value.get(group);
    return cache && cache.analyzed === true;
  });

});

watch(
    () =>OPsAnalyzedData.value,
    () => {
      for(let i =0; i < OPsAnalyzedData.value.length; i++){
        finalDataMap.value.set(OPsAnalyzedData.value[i].expGroupName,
            {leftEyeOPsData: OPsAnalyzedData.value[i].leftEyeOPsData,
              leftEyeOPsMilliSec: OPsAnalyzedData.value[i].leftEyeOPsMilliSec,
              rightEyeOPsData: OPsAnalyzedData.value[i].rightEyeOPsData,
              rightEyeOPsMilliSec: OPsAnalyzedData.value[i].rightEyeOPsMilliSec})
      }
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

finalMapForBackend.value = finalDataMap.value;

const downloadOPsData = async () => {
  // console.log(finalMapForBackend.value)
  const orderedMap = buildOrderedMapForBackend();
  console.log(orderedMap)
  let data = {
    "opsDataMapSet" : Object.fromEntries(orderedMap),
  };

  const response = await axiosApi.post("/ops/downloadOPsData", data, {
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
  let fileName = formattedDate + '_OPs.xlsx';//預設文件名

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

const selectGroup = (name) => {
  selectedGroup.value = name

  //清除錯誤
  selectErrors.value = {}
}

const buildOrderedMapForBackend = () => {
  const orderedMap = new Map()

  selectGroupName.value.forEach(groupPrefix => {
    // 依照拖曳順序找對應資料
    finalDataMap.value.forEach((data, key) => {
      console.log(key)
      console.log(data)
      if (key.startsWith(groupPrefix + '_')) {
        orderedMap.set(key, data)
      }
    })
  })

  return orderedMap
}

function validateSelect(){

  let firstError = null

  filteredData.value.forEach((d,index)=>{

    if(!leftSelect.value[index]){
      selectErrors.value[index+"_left"]=true
      firstError ??= "leftEye"+index
    }

    if(!rightSelect.value[index]){
      selectErrors.value[index+"_right"]=true
      firstError ??= "rightEye"+index
    }

  })

  if(firstError){
    document.getElementById(firstError).scrollIntoView({
      behavior:"smooth",
      block:"center"
    })
    return false
  }

  return true
}

const getTableValues = (index, eye) => {
  const analyzedData = OPsAnalyzedData.value[index];
  if (!analyzedData) return '';

  const opsData = eye === 'right' ? analyzedData.rightEyeOPsData : analyzedData.leftEyeOPsData;

  return opsData.map((value) => `${value}`).join('\n');
};

//複製單一顆眼睛的值
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    await Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer:1000
    })
  } catch (error) {
    console.error('Failed to copy text: ', error);
  }
};

//複製全部右眼值的功能
const copyAllRightEyeValues = async () => {
  const maxLength = Math.max(...OPsAnalyzedData.value.map(data => data.rightEyeOPsData.length));

  let allRightEyeValues = '';
  for (let i = 0; i < maxLength; i++) {
    const rowValues = OPsAnalyzedData.value.map(data => data.rightEyeOPsData[i] !== undefined ? data.rightEyeOPsData[i] : '').join('\t');
    allRightEyeValues += rowValues + '\n';
  }

  if (allRightEyeValues) {
    await copyToClipboard(allRightEyeValues.trim());
  } else {
    await Toast.fire({
      text: '無可複製的資料',
      icon: 'info',
      timer: 1000
    });
  }
};

//複製全部左眼值的功能
const copyAllLeftEyeValues = async () => {
  const maxLength = Math.max(...OPsAnalyzedData.value.map(data => data.leftEyeOPsData.length));

  let allLeftEyeValues = '';
  for (let i = 0; i < maxLength; i++) {
    const rowValues = OPsAnalyzedData.value.map(data => data.leftEyeOPsData[i] !== undefined ? data.leftEyeOPsData[i] : '').join('\t');
    allLeftEyeValues += rowValues + '\n';
  }

  if (allLeftEyeValues) {
    await copyToClipboard(allLeftEyeValues.trim());
  } else {
    await Toast.fire({
      text: '無可複製的資料',
      icon: 'info',
      timer: 1000
    });
  }
};

//複製全部右左眼交互的值之功能
const copyAllEyeValues = async () => {
  const maxLength = Math.max(...OPsAnalyzedData.value.map(data => Math.max(data.rightEyeOPsData.length, data.leftEyeOPsData.length)));

  let allEyeValues = '';
  for (let i = 0; i < maxLength; i++) {
    const rowValues = OPsAnalyzedData.value.map(data => {
      const rightValue = data.rightEyeOPsData[i] !== undefined ? data.rightEyeOPsData[i] : '';
      const leftValue = data.leftEyeOPsData[i] !== undefined ? data.leftEyeOPsData[i] : '';
      return `${leftValue}\t${rightValue}`;
    }).join('\t');
    allEyeValues += rowValues + '\n';
  }

  if (allEyeValues) {
    await copyToClipboard(allEyeValues.trim());
  } else {
    await Toast.fire({
      text: '無可複製的資料',
      icon: 'info',
      timer: 1000
    });
  }
};

//重新整理
const clearInput = () => {
  window.location.reload();
};

//將現有圖表銷毀
const destroyCharts = () => {
  charts.value.forEach(chart => {
    chart.destroy();
  });
  charts.value = [];
  // OPsAnalyzedData.value = [];
  // rightSelect.value = {};
  // leftSelect.value = {};
  // showTables.value = false;
};
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

//回到最上面

function showConfetti() {
  confetti.addConfetti()
}

//如果語言變動，自動重建圖表
watch(locale, () => {
  nextTick(() => {
    destroyCharts();
    initCharts();
  });
});
</script>

<style scoped>
.card-content-image {
  width: 800px;
  height: 480px;
  border: 1px solid black;
  margin: 10px;
  padding: 10px 10px 30px;
}

.ROPs {
  margin-left: 10px;
}

.LOPs {
  margin-left: 10px;
}

.medical-table {
  width: 600px;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 14px;
}

.medical-table th,
.medical-table td {
  border: 1px solid #ccc;
  padding: 5px;
  text-align: center;
}

.medical-table thead {
  background-color: #f2f2f2;
  font-weight: 600;
}

.tableContainer {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
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

.select-error {
  border: 2px solid red !important;
}

.select-error-text {
  position: absolute;
  bottom: 130%;
  left: 50%;
  transform: translateX(-50%);
  background: #dc3545;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
}

/* 箭頭 */
.select-error-text::after{
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: #dc3545 transparent transparent transparent;
}
</style>