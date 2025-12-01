<template>
  <h1 style="padding-bottom: 5px">{{$t('OPsWaveComparisonTitle')}}</h1>
  <div class="input-group" style="width: 540px">
    <upload-util
        :i18nText="i18nText"
        :disabled="showCheckbox"
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
<!--           style="width: 270px; margin-bottom: 5px"-->
<!--           :disabled="showCheckbox">-->
    <button class="btn btn-outline-success" type="button" @click="clearInput" v-if="selectedFile">{{$t('ResetButton')}}</button>
    <h4 v-if="showCheckbox" style="color: #bb2d3b">({{$t('DraggableNote')}})</h4>
  </div>
  <VueDraggable ref="el" v-model="selectedFile" @end="onDragEnd" style="width: 340px">
  <div v-for="(select, index) in selectedFile" :key="index" style="margin-top: 3px; margin-left: 3px; border: solid #93FF93" v-if="showCheckbox" :style="{ border: expanded[index] ? 'solid #93FF93' : 'none' }">
    <div style="display: flex; justify-content: space-between; align-items: center">
      <!-- 這個按鈕僅顯示圖標，檔案名稱隱藏起來 -->
      <button class="btn btn-sm btn-outline-success"
              type="button"
              data-bs-toggle="tooltip" data-bs-placement="left" :title="select.name"
              @click="toggleCollapse(index)"
              style="margin-top: 2px; margin-left: 2px">
        <i class="bi bi-caret-down-fill"></i>
      </button>
    </div>
    <div :id="'collapseExample' + index" class="collapse show" v-if="expanded[index]">
      <div class="mt-2">
        <span style="margin-left: 10px">{{$t('fileName')}}： {{select.name}}</span>
        <div class="input-group" style="width: 400px; margin-left: 10px">要預覽哪隻眼睛的波形：
          <div class="form-check form-check-inline">
            <input class="form-check-input"
                   type="checkbox"
                   :id="'right-eye-' + index"
                   value="right"
                   v-model="selectedEyes[index].right"
                   :disabled="isChartDrawing"
                   @change="updateLastChecked('right-eye-' + index)">
            <label class="form-check-label" :for="'right-eye-' + index">右眼</label>
          </div>
          <div class="form-check form-check-inline">
            <input class="form-check-input"
                   type="checkbox"
                   :id="'left-eye-' + index"
                   value="left"
                   v-model="selectedEyes[index].left"
                   :disabled="isChartDrawing"
                   @change="updateLastChecked('left-eye-' + index)">
            <label class="form-check-label" :for="'left-eye-' + index">左眼</label>
          </div>
        </div>
      </div>
    </div>
  </div>
  </VueDraggable>
  <div class="spinner-border m-5" style="width: 3rem; height: 3rem" role="status" v-if="loading && !showCheckbox">
  </div>
  <canvas id="ops-chart" style="margin-top: 20px"></canvas>
  <button class="btn btn-outline-success"
          type="button"
          @click="copySelectedData"
          style="margin-top: 20px"
          v-if="chartInstance !== null">複製所選眼睛的值</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyMilliSecond"
          style="margin-top: 20px; margin-left: 10px"
          v-if="chartInstance !== null">複製數值對應毫秒數</button>
  <button class="btn btn-outline-success btn-sm"
          @click="scrollToLastChecked"
          style="position: fixed; bottom: 20px; right: 20px; border-radius: 20px"
          v-if="lastCheckedId && showLastCheckedButton && !showLineChartButton">回到最後勾選的位置</button>
  <!-- 快速滾動到折線圖按鈕 -->
  <button class="btn btn-outline-success btn-sm"
          @click="scrollToChart"
          style="position: fixed; bottom: 20px; right: 20px; border-radius: 20px"
          v-if="lastCheckedId && showLineChartButton && !showLastCheckedButton">折線圖</button>
</template>

<script setup>

import {onMounted, onUnmounted, ref, watch} from "vue";
import axiosApi from "@/plugins/axios.js";
import {Chart, registerables} from 'chart.js';
import SweetAlert2 from "sweetalert2";
import { VueDraggable } from 'vue-draggable-plus';
import {useI18n} from "vue-i18n";
import { useUploaderI18n } from '@/composables/useUploaderI18n'
import UploadUtil from "@/components/UploadUtil.vue";

Chart.register(...registerables);

//所選擇的檔案
const selectedFile = ref([]);

//根據所選擇的檔案傳回來的資料
const OPsRawData = ref([]);

//多選框選擇要哪隻眼睛
const selectedEyes = ref([]);

//顯示折線圖
const chartInstance = ref(null);

const loading = ref(false);

const showCheckbox = ref(false);

const expanded = ref([]); //記錄每個檔案的展開狀態

//記錄最後勾選的多選框 ID
const lastCheckedId = ref(null);

const showLineChartButton = ref(false);

const showLastCheckedButton = ref(false);

//折線圖按鈕觸發的滾動
const isLineButtonScroll = ref(false);

//回到最後勾選按鈕觸發的滾動
const isLastCheckedButtonScroll = ref(false);

//人為觸發的滾動
const isHandScroll = ref(true);

//儲存上一個滾動位置
const lastScrollTop = ref(0);

//滾動方向的變數
const scrollDirection = ref('');

//更新最後勾選的多選框 ID
const updateLastChecked = (id) => {
  lastCheckedId.value = id;
};

// 定義固定的顏色列表
const fixedColors = [
  "#FF5733", "#33FF57", "#3357FF", "#F333FF", "#FF33A8", "#33FFA8", "#FF8333",
  "#33B8FF", "#B833FF", "#FF33FF", "#FFC733", "#33FFD6", "#FF3366", "#6633FF",
  "#FFB833", "#33FF8F", "#FF5733", "#8FFF33", "#3357FF", "#FF33D6", "#33FFA8",
  "#FF338F", "#338FFF", "#FF3366", "#FF8F33", "#33FF8F", "#8F33FF", "#FF5733",
  "#33FF57", "#FF33FF", "#33D6FF", "#FFA833", "#FF5733", "#5733FF", "#FF8F33",
  "#FF338F", "#33FF8F", "#FF5733", "#33FF57", "#3357FF", "#FF33FF", "#33FFA8",
  "#FF8333", "#33B8FF", "#B833FF", "#FF33FF", "#FFC733", "#33FFD6", "#FF3366",
  "#6633FF", "#FFB833", "#33FF8F", "#FF5733", "#8FFF33", "#3357FF", "#FF33D6"
];

const Toast = SweetAlert2.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  onOpen: toast => {
    toast.addEventListener('mouseenter', SweetAlert2.stopTimer())
    toast.addEventListener('mouseleave', SweetAlert2.resumeTimer())
  }
});

//定義是否正在繪製圖表
const isChartDrawing = ref(false);

//滑鼠移入移出
const isDragging = ref(false);

const { t, locale } = useI18n();

//接收 UploadUtil.vue 子元件傳回來的 File Change 值
const backedUploadUtilFileChangeData = (newData) => {
  let selectedFiles = [];
  Object.assign(selectedFiles, newData);
  selectedFile.value = selectedFiles;
}

const { i18nText } = useUploaderI18n();

// const onFileChange = async (event) => {
//   // selectedFile.value = event.target.files;
//   selectedEyes.value = Array.from({ length: selectedFile.value.length }, () => ({ left: false, right: false }));
//   expanded.value = Array.from({ length: selectedFile.value.length }, () => true); //預設所有文件展開
//
//   try{
//     const formData = new FormData();
//     for(let i = 0; i < selectedFile.value.length; i++){
//       formData.append("files", selectedFile.value[i]);
//     }
//
//     loading.value = true;  //開始加載
//
//     const response = await axiosApi.post("/ops/excelDataToLine", formData);
//     OPsRawData.value = response.data;
//     // console.log(OPsRawData.value);
//
//     loading.value = false;  //完成加載
//     showCheckbox.value =true;
//   } catch (error) {
//     if (error.response && Array.isArray(error.response.data)) {
//       const errorMessages = error.response.data;
//
//       if (errorMessages.length === 1) {
//         // 單一檔案錯誤的處理
//         await SweetAlert2.fire({
//           icon: 'error',
//           title: '檔案錯誤',
//           html: `<p>${errorMessages[0]}</p><P>請重新檢查 Excel 檔！</P>`  //單一錯誤訊息
//         });
//         // loading.value = false;  //完成加載
//         window.location.reload();
//       } else {
//         //多個檔案錯誤的處理
//         await SweetAlert2.fire({
//           icon: 'error',
//           title: '多個檔案錯誤',
//           html: `<ol>${errorMessages.map(msg => {
//             const dashes = '-'.repeat(50);  //產生對應數量的破折號
//             return `<li>${msg}</li><p>${dashes}</p>`;
//           }).join('')}</ol><p>請重新檢查 Excel 檔！</p>`
//         });
//         // loading.value = false;  //完成加載
//         showCheckbox.value =false;
//         window.location.reload();
//       }
//     } else if(error.response.status === 500){
//       await SweetAlert2.fire({
//         icon: 'error',
//         title: '檔案轉換限制',
//         html: `<p>因所使用的格式轉換程式為免費版，有檔案轉換限制！</p><P>請重新啟動服務 或 自行將檔案另存為 Excel 檔！</P>`  //單一錯誤訊息
//       });
//       window.location.reload();
//     } else {
//       //未知錯誤或非預期錯誤的處理
//       await SweetAlert2.fire({
//         icon: 'error',
//         title: '未知錯誤',
//         text: '恭喜您能見到厲害的程式設計師本人囉！'
//       });
//       loading.value = false;  //完成加載
//       showCheckbox.value =false;
//     }
//   }
// };

watch(
    //要監聽的物件
    () => selectedFile.value,
    //監聽到後要實作的方法
    async () => {
      selectedEyes.value = Array.from({ length: selectedFile.value.length }, () => ({ left: false, right: false }));
      expanded.value = Array.from({ length: selectedFile.value.length }, () => true); //預設所有文件展開

      try{
        const formData = new FormData();
        for(let i = 0; i < selectedFile.value.length; i++){
          formData.append("files", selectedFile.value[i]);
        }

        loading.value = true;  //開始加載

        const response = await axiosApi.post("/ops/excelDataToLine", formData);
        OPsRawData.value = response.data;
        // console.log(OPsRawData.value);

        loading.value = false;  //完成加載
        showCheckbox.value =true;
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
            // loading.value = false;  //完成加載
            window.location.reload();
          } else {
            //多個檔案錯誤的處理
            await SweetAlert2.fire({
              icon: 'error',
              title: '多個檔案錯誤',
              html: `<ol>${errorMessages.map(msg => {
                const dashes = '-'.repeat(50);  //產生對應數量的破折號
                return `<li>${msg}</li><p>${dashes}</p>`;
              }).join('')}</ol><p>請重新檢查 Excel 檔！</p>`
            });
            // loading.value = false;  //完成加載
            showCheckbox.value =false;
            window.location.reload();
          }
        } else if(error.response.status === 500){
          await SweetAlert2.fire({
            icon: 'error',
            title: '檔案轉換限制',
            html: `<p>因所使用的格式轉換程式為免費版，有檔案轉換限制！</p><P>請重新啟動服務 或 自行將檔案另存為 Excel 檔！</P>`  //單一錯誤訊息
          });
          window.location.reload();
        } else {
          //未知錯誤或非預期錯誤的處理
          await SweetAlert2.fire({
            icon: 'error',
            title: '未知錯誤',
            text: '恭喜您能見到厲害的程式設計師本人囉！'
          });
          loading.value = false;  //完成加載
          showCheckbox.value =false;
        }
      }
    }
);

const drawChart = (datasets) => {
  const ctx = document.getElementById('ops-chart').getContext('2d');
  if (chartInstance.value) {
    chartInstance.value.destroy();
  }

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: OPsRawData.value[0].dataMilliSec, // 假設所有檔案的 X 軸標籤相同
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            //根據資料集的顏色設置標籤顏色
            generateLabels: (chart) => {
              return chart.data.datasets.map((dataset) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 1
              }));
            }}
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '時間 (ms)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'µV'
          }
        }
      }
    }
  });

  //完成圖表繪製後，解鎖多選框
  setTimeout(() => {isChartDrawing.value = false},1000);
};

watch(
    () => selectedEyes.value,
    () => {
      if (OPsRawData.value.length > 0) {
        isChartDrawing.value = true;  //繪製前鎖定多選框
        const datasets = [];

        OPsRawData.value.forEach((data, index) => {
          if (selectedEyes.value[index].right && data.expRightEyeRawData) {
            const color = fixedColors[(index * 2) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Right Eye`,
              data: data.expRightEyeRawData,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].left && data.expLeftEyeRawData) {
            const color = fixedColors[(index * 2 + 1) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Left Eye`,
              data: data.expLeftEyeRawData,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
        });

        drawChart(datasets);
        if(selectedFile.value.length < 13){
          showLineChartButton.value = false;
          showLastCheckedButton.value = false;
        } else {
          showLineChartButton.value = true;
          showLastCheckedButton.value = false;
        }
      }
    },
    { deep: true }
);

const onDragEnd = (event) => {
  const oldIndex = event.oldIndex;  //拖曳前的索引
  const newIndex = event.newIndex;  //拖曳後的索引

  // console.log(`拖曳前的索引: ${oldIndex}`);
  // console.log(`拖曳後的索引: ${newIndex}`);

  //根據新的索引順序來重新排列 selectedEyes 和 OPsRawData
  const movedSelectedEyes = selectedEyes.value.splice(oldIndex, 1)[0];
  selectedEyes.value.splice(newIndex, 0, movedSelectedEyes);

  const movedOPsRawData = OPsRawData.value.splice(oldIndex, 1)[0];
  OPsRawData.value.splice(newIndex, 0, movedOPsRawData);
};

const toggleCollapse = (index) => {
  expanded.value[index] = !expanded.value[index]; //切換展開狀態
};
// 用於隨機生成顏色的函式
// const getRandomColor = () => {
//   const letters = '0123456789ABCDEF';
//   let color = '#';
//   for (let i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// };

const clearInput = () => {
  window.location.reload();
};

const copySelectedData = async () => {
  let copiedText;
  let rows = [];

  const selectedGroupNames = OPsRawData.value
      .map((data, index) => {
        if (selectedEyes.value[index].left) {
          return `${data.expGroupName} L`; // 只選左眼
        } else if (selectedEyes.value[index].right) {
          return `${data.expGroupName} R`; // 只選右眼
        }
        return null; // 未選中，排除
      })
      .filter(name => name) // 過濾掉未選中的組別
      .join("\t"); // 用 \t 分隔組別名稱

  OPsRawData.value.forEach((data, index) => {
    if (selectedEyes.value[index].right && data.expRightEyeRawData) {
      for (let i = 0; i < data.expRightEyeRawData.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expRightEyeRawData[i]);
      }
    }
    if (selectedEyes.value[index].left && data.expLeftEyeRawData) {
      for (let i = 0; i < data.expLeftEyeRawData.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expLeftEyeRawData[i]);
      }
    }
  });

  // 在整個陣列最前面插入被選取的組別名稱
  rows.unshift([selectedGroupNames]);

  copiedText = rows.map(row => row.join("\t")).join("\n");

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(copiedText);
    await Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000,
      allowOutsideClick: false
    })
  } catch (error) {
    console.error('Failed to copy text: ', error);
  }
};

//複製豪秒數 (ms)
const copyMilliSecond = async () => {
  OPsRawData.value[0].dataMilliSec.unshift('ms');
  let copiedText;
  let rows = OPsRawData.value[0].dataMilliSec;

  copiedText = rows.join("\n");

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(copiedText);
    await Toast.fire({
      text: '複製成功',
      icon: 'success',
      timer: 1000,
      allowOutsideClick: false
    })
  } catch (error) {
    console.error('Failed to copy text: ', error);
  }
};

//回到最後勾選的位置方法
const scrollToLastChecked = () => {
  if (lastCheckedId.value) {
    const element = document.getElementById(lastCheckedId.value);
    if (element) {
      //為回到最後勾選按鈕所觸發的滾動
      isLastCheckedButtonScroll.value = true;
      isLineButtonScroll.value = false;
      isHandScroll.value = false;

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 可選擇聚焦元素以便用戶明確看到
      element.focus({ preventScroll: true });
      if(selectedFile.value.length < 13){
        showLineChartButton.value = false;
        showLastCheckedButton.value = false;
      } else {
        setTimeout(() => {showLineChartButton.value = true;},500);
      }
    }
  }
};

//滑動到折線圖的方法
const scrollToChart = () => {
  isLineButtonScroll.value = true;
  isHandScroll.value = false;
  const chartElement = document.getElementById('ops-chart');
  if (chartElement) {
    chartElement.scrollIntoView({ behavior: 'smooth' });
  }
};

//滑鼠滾動事件處理方法
const handleScroll = () => {
  const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScrollTop > lastScrollTop.value) {
    scrollDirection.value = 'down'; // 向下滾動
  } else if (currentScrollTop < lastScrollTop.value) {
    scrollDirection.value = 'up'; // 向上滾動
  }

  //更新上一個滾動位置
  lastScrollTop.value = currentScrollTop;

  if (isLineButtonScroll.value && !isLastCheckedButtonScroll.value && !isHandScroll.value) {
    showLineChartButton.value = false;
    showLastCheckedButton.value = true;
    isLineButtonScroll.value = false;
    isHandScroll.value = true;
  } else if(!isLineButtonScroll.value && isLastCheckedButtonScroll.value && !isHandScroll.value) {
    setTimeout(() => {showLineChartButton.value = true;},800);
    showLastCheckedButton.value = false;
    isLastCheckedButtonScroll.value = false;
    isHandScroll.value = true;
  } else if(!isLineButtonScroll.value && !isLastCheckedButtonScroll.value && isHandScroll.value){
    if(selectedFile.value.length < 13){
      showLineChartButton.value = false;
      showLastCheckedButton.value = false;
      isHandScroll.value = true;
    } else {
      if(scrollDirection.value === 'down'){
        showLineChartButton.value = false;
        setTimeout(() => {showLastCheckedButton.value = true;},800);
        isHandScroll.value = true;
      } else if(scrollDirection.value === 'up'){
        setTimeout(() => {showLineChartButton.value = true;},800);
        showLastCheckedButton.value = false;
        isHandScroll.value = true;
      }
    }
  }
};

//在組件掛載時添加滾動事件監聽器
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

//在組件卸載時移除滾動事件監聽器
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>

</style>