<template>
  <h1 style="padding-bottom: 5px">ABC Wave 實驗 Data 波形比較</h1>
  <div class="input-group" style="width: 500px">
    <input class="form-control form-control-lg"
           id="formFileLg"
           type="file"
           multiple
           @change="onFileChange"
           name="files"
           style="width: 270px; margin-bottom: 5px"
           :disabled="showCheckbox">
    <button class="btn btn-outline-success"
            type="button"
            @click="clearInput"
            v-if="selectedFile"
            style="margin-left: 10px; margin-bottom: 5px">重置</button>
    <h4 v-if="showCheckbox" style="color: #bb2d3b">(可拖移框框來改變檔案順序)</h4>
  </div>
  <VueDraggable ref="el" v-model="selectedFile" @end="onDragEnd" style="width: 500px">
    <div v-for="(select, index) in selectedFile" :key="index" style="margin-top: 5px;" v-if="showCheckbox" :style="{ border: expanded[index] ? 'solid #93FF93' : 'none' }">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <!-- 這個按鈕僅顯示圖標，檔案名稱隱藏起來 -->
        <button class="btn btn-sm btn-outline-success"
                type="button"
                data-bs-toggle="tooltip" data-bs-placement="left"
                :title="select.name"
                @click="toggleCollapse(index)"
                style="margin-top: 2px; margin-left: 2px">
          <i class="bi bi-caret-down-fill"></i>
        </button>
      </div>
      <div :id="'collapseExample' + index" class="collapse show" v-if="expanded[index]">
        <div class="mt-2">
          <span style="margin-left: 10px">檔案名稱： {{select.name}}</span>
          <div class="input-group" style="width: 600px; margin-left: 10px">要預覽哪隻眼睛的波形：
            <div class="form-check form-check-inline">
              <input class="form-check-input"
                     type="checkbox"
                     :id="'right-eye-1' + index"
                     value="right"
                     v-model="selectedEyes[index].right1"
                     :disabled="isChartDrawing"
                     @change="updateLastChecked('right-eye-1' + index)">
              <label class="form-check-label" :for="'right-eye-1' + index">右眼1</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input"
                     type="checkbox"
                     :id="'left-eye-1' + index"
                     value="left"
                     v-model="selectedEyes[index].left1"
                     :disabled="isChartDrawing"
                     @change="updateLastChecked('left-eye-1' + index)">
              <label class="form-check-label" :for="'left-eye-1' + index">左眼1</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input"
                     type="checkbox"
                     :id="'right-eye-2' + index"
                     value="right"
                     v-model="selectedEyes[index].right2"
                     :disabled="isChartDrawing"
                     @change="updateLastChecked('right-eye-2' + index)">
              <label class="form-check-label" :for="'right-eye-2' + index">右眼2</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input"
                     type="checkbox"
                     :id="'left-eye-2' + index"
                     value="left"
                     v-model="selectedEyes[index].left2"
                     :disabled="isChartDrawing"
                     @change="updateLastChecked('left-eye-2' + index)">
              <label class="form-check-label" :for="'left-eye-2' + index">左眼2</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueDraggable>
  <div class="spinner-border m-5" style="width: 3rem; height: 3rem;" role="status" v-if="loading && !showCheckbox">
  </div>
  <div style="display: flex; flex-wrap: wrap; width: 100%;">
    <div class="chartBlockC">
      <canvas id="cWave-chart" style="margin-top: 20px;"></canvas>
    </div>
    <div class="chartBlockAB">
      <canvas id="abWave-chart" style="margin-top: 20px;"></canvas>
    </div>
  </div>
  <button class="btn btn-outline-success"
          type="button"
          @click="copySelectedCWaveData"
          style="margin-top: 20px;"
          v-if="chartInstanceC !== null">複製所選眼睛的 C Wave 值</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyCMilliSecond"
          style="margin-top: 20px; margin-left: 10px"
          v-if="chartInstanceC !== null">複製數值對應毫秒數 (C 波)</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copySelectedABWaveData"
          style="margin-top: 20px; margin-left: 10px"
          v-if="chartInstanceAB !== null">複製所選眼睛 AB Wave 的值</button>
  <button class="btn btn-outline-success"
          type="button"
          @click="copyABMilliSecond"
          style="margin-top: 20px; margin-left: 10px"
          v-if="chartInstanceAB !== null">複製數值對應毫秒數 (A, B 波)</button>
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

Chart.register(...registerables);

//所選擇的檔案
const selectedFile = ref([]);

//根據所選擇的檔案傳回來的資料
const CWaveRawData = ref([]);
const ABWaveRawData = ref([]);

//多選框選擇要哪隻眼睛
const selectedEyes = ref([]);

//顯示折線圖
const chartInstanceC = ref(null);
const chartInstanceAB = ref(null);

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
  "#5B5B5B", "#000093", "#A6FFFF", "#9F5000", "#00FFFF", "#02F78E", "#000000",
  "#82D900", "#00E3E3", "#FFB5B5", "#8600FF", "#FF0000", "#97CBFF", "#A6A600",
  "#2894FF", "#FF8000", "#A6FFA6", "#D2E9FF", "#408080", "#642100", "#00A600",
  "#B9B9FF", "#BF0060", "#00AEAE", "#D9B300", "#FFFF37", "#FF359A", "#FFD0FF",
  "#FFC78E", "#E6E6F2", "#FF9D6F", "#FFDAC8", "#66B3FF", "#AE00AE", "#02C874",
  "#FF8F59", "#8080C0", "#FF95CA", "#CA8EFF", "#FFFFCE", "#B87070", "#C7C7E2",
  "#9AFF02", "#D9B3B3", "#6F00D2", "#28FF28", "#D94600", "#FF44FF", "#FF7575",
  "#2828FF", "#C07AB8", "#E2C2DE", "#D1E9E9", "#FFFF93", "#CDCD9A", "#FF33D6"
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

const onFileChange = async (event) => {
  selectedFile.value = event.target.files;
  selectedEyes.value = Array.from({ length: selectedFile.value.length }, () => ({ left1: false, right1: false, left2: false, right2: false }));
  expanded.value = Array.from({ length: selectedFile.value.length }, () => true); //預設所有文件展開

  try{
    const formData = new FormData();
    for(let i = 0; i < selectedFile.value.length; i++){
      formData.append("files", selectedFile.value[i]);
    }

    loading.value = true;  //開始加載

    const responseC = await axiosApi.post("/c_wave/excelDataToLine", formData);
    CWaveRawData.value = responseC.data;
    console.log(CWaveRawData.value);

    const responseAB = await axiosApi.post("/c_wave/excelABDataToLine", formData);
    ABWaveRawData.value = responseAB.data;
    console.log(ABWaveRawData.value);

    loading.value = false;  // 完成加載
    showCheckbox.value = true;
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
        // showCheckbox.value =false;
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
      // 未知錯誤或非預期錯誤的處理
      await SweetAlert2.fire({
        icon: 'error',
        title: '未知錯誤',
        text: '恭喜您能見到厲害的程式設計師本人囉！'
      });
      loading.value = false;  // 完成加載
      showCheckbox.value =false;
    }
  }
};

const drawCWaveChart = (datasets) => {
  const ctx = document.getElementById('cWave-chart').getContext('2d');
  if (chartInstanceC.value) {
    chartInstanceC.value.destroy();
  }

  chartInstanceC.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: CWaveRawData.value[0].dataMilliSec, // 假設所有檔案的 X 軸標籤相同
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            // 根據資料集的顏色設置標籤顏色
            generateLabels: (chart) => {
              return chart.data.datasets.map((dataset, index) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 1,
              }));
            }},
        },
        title: {
          display: true,
          text: "C Wave",
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
            text: '時間 (ms)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'µV',
          },
        },
      },
    },
  });

  //完成圖表繪製後，解鎖多選框
  setTimeout(() => {isChartDrawing.value = false},1000);
};

watch(
    () => selectedEyes.value,
    () => {
      if (CWaveRawData.value.length > 0) {
        isChartDrawing.value = true;  //繪製前鎖定多選框
        const datasets = [];

        CWaveRawData.value.forEach((data, index) => {
          if (selectedEyes.value[index].right1 && data.expRightEyeRawData1) {
            const color = fixedColors[(index * 2) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Right Eye1`,
              data: data.expRightEyeRawData1,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].left1 && data.expLeftEyeRawData1) {
            const color = fixedColors[(index * 2 + 1) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Left Eye1`,
              data: data.expLeftEyeRawData1,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].right2 && data.expRightEyeRawData2) {
            const color = fixedColors[(index * 2 + 2) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Right Eye2`,
              data: data.expRightEyeRawData2,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].left2 && data.expLeftEyeRawData2) {
            const color = fixedColors[(index * 2 + 3) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Left Eye2`,
              data: data.expLeftEyeRawData2,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
        });

        drawCWaveChart(datasets);
        if(selectedFile.value.length < 7){
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

const drawABWaveChart = (datasets) => {
  const ctx = document.getElementById('abWave-chart').getContext('2d');
  if (chartInstanceAB.value) {
    chartInstanceAB.value.destroy();
  }

  chartInstanceAB.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ABWaveRawData.value[0].dataMilliSec, // 假設所有檔案的 X 軸標籤相同
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            // 根據資料集的顏色設置標籤顏色
            generateLabels: (chart) => {
              return chart.data.datasets.map((dataset, index) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 1,
              }));
            }},
        },
        title: {
          display: true,
          text: "AB Wave",
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
            text: '時間 (ms)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'µV',
          },
        },
      },
    },
  });

  //完成圖表繪製後，解鎖多選框
  setTimeout(() => {isChartDrawing.value = false},1000);
};

watch(
    () => selectedEyes.value,
    () => {
      if (ABWaveRawData.value.length > 0) {
        isChartDrawing.value = true;  //繪製前鎖定多選框
        const datasets = [];

        ABWaveRawData.value.forEach((data, index) => {
          if (selectedEyes.value[index].right1 && data.expRightEyeRawData1) {
            const color = fixedColors[(index * 2) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Right Eye1`,
              data: data.expRightEyeRawData1,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].left1 && data.expLeftEyeRawData1) {
            const color = fixedColors[(index * 2 + 1) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Left Eye1`,
              data: data.expLeftEyeRawData1,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].right2 && data.expRightEyeRawData2) {
            const color = fixedColors[(index * 2 + 2) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Right Eye2`,
              data: data.expRightEyeRawData2,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
          if (selectedEyes.value[index].left2 && data.expLeftEyeRawData2) {
            const color = fixedColors[(index * 2 + 3) % fixedColors.length];
            datasets.push({
              label: `${data.expGroupName}-Left Eye2`,
              data: data.expLeftEyeRawData2,
              borderColor: color,
              fill: false,
              pointRadius: 0
            });
          }
        });

        drawABWaveChart(datasets);
        if(selectedFile.value.length < 7){
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
  const oldIndex = event.oldIndex;  // 拖曳前的索引
  const newIndex = event.newIndex;  // 拖曳後的索引

  console.log(`拖曳前的索引: ${oldIndex}`);
  console.log(`拖曳後的索引: ${newIndex}`);

  // 根據新的索引順序來重新排列 selectedEyes 和 OPsRawData
  const movedSelectedEyes = selectedEyes.value.splice(oldIndex, 1)[0];
  selectedEyes.value.splice(newIndex, 0, movedSelectedEyes);

  const movedCWaveRawData = CWaveRawData.value.splice(oldIndex, 1)[0];
  CWaveRawData.value.splice(newIndex, 0, movedCWaveRawData);

  const movedABWaveRawData = ABWaveRawData.value.splice(oldIndex, 1)[0];
  ABWaveRawData.value.splice(newIndex, 0, movedABWaveRawData);
};

const toggleCollapse = (index) => {
  expanded.value[index] = !expanded.value[index]; // 切換展開狀態
};

const clearInput = () => {
  window.location.reload();
};

const copySelectedCWaveData = async () => {
  let copiedText;
  let rows = [];

  const selectedGroupNames = CWaveRawData.value
      .map((data, index) => {
        if (selectedEyes.value[index].left1) {
          return `${data.expGroupName} 1L (C Wave)`; // 只選左眼1
        } else if (selectedEyes.value[index].right1) {
          return `${data.expGroupName} 1R (C Wave)`; // 只選右眼1
        } else if (selectedEyes.value[index].left2) {
          return `${data.expGroupName} 2L (C Wave)`; // 只選左眼2
        } else if (selectedEyes.value[index].right2) {
          return `${data.expGroupName} 2R (C Wave)`; // 只選右眼2
        }
        return null; // 未選中，排除
      })
      .filter(name => name) // 過濾掉未選中的組別
      .join("\t"); // 用 \t 分隔組別名稱

  CWaveRawData.value.forEach((data, index) => {
    if (selectedEyes.value[index].right1 && data.expRightEyeRawData1) {
      for (let i = 0; i < data.expRightEyeRawData1.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expRightEyeRawData1[i]);
      }
    }
    if (selectedEyes.value[index].left1 && data.expLeftEyeRawData1) {
      for (let i = 0; i < data.expLeftEyeRawData1.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expLeftEyeRawData1[i]);
      }
    }
    if (selectedEyes.value[index].right2 && data.expRightEyeRawData2) {
      for (let i = 0; i < data.expRightEyeRawData2.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expRightEyeRawData2[i]);
      }
    }
    if (selectedEyes.value[index].left2 && data.expLeftEyeRawData2) {
      for (let i = 0; i < data.expLeftEyeRawData2.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expLeftEyeRawData2[i]);
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

const copySelectedABWaveData = async () => {
  let copiedText;
  let rows = [];

  const selectedGroupNames = ABWaveRawData.value
      .map((data, index) => {
        if (selectedEyes.value[index].left1) {
          return `${data.expGroupName} 1L (A, B Wave)`; // 只選左眼1
        } else if (selectedEyes.value[index].right1) {
          return `${data.expGroupName} 1R (A, B Wave)`; // 只選右眼1
        } else if (selectedEyes.value[index].left2) {
          return `${data.expGroupName} 2L (A, B Wave)`; // 只選左眼2
        } else if (selectedEyes.value[index].right2) {
          return `${data.expGroupName} 2R (A, B Wave)`; // 只選右眼2
        }
        return null; // 未選中，排除
      })
      .filter(name => name) // 過濾掉未選中的組別
      .join("\t"); // 用 \t 分隔組別名稱

  ABWaveRawData.value.forEach((data, index) => {
    if (selectedEyes.value[index].right1 && data.expRightEyeRawData1) {
      for (let i = 0; i < data.expRightEyeRawData1.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expRightEyeRawData1[i]);
      }
    }
    if (selectedEyes.value[index].left1 && data.expLeftEyeRawData1) {
      for (let i = 0; i < data.expLeftEyeRawData1.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expLeftEyeRawData1[i]);
      }
    }
    if (selectedEyes.value[index].right2 && data.expRightEyeRawData2) {
      for (let i = 0; i < data.expRightEyeRawData2.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expRightEyeRawData2[i]);
      }
    }
    if (selectedEyes.value[index].left2 && data.expLeftEyeRawData2) {
      for (let i = 0; i < data.expLeftEyeRawData2.length; i++) {
        rows[i] = rows[i] || [];
        rows[i].push(data.expLeftEyeRawData2[i]);
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
      if(selectedFile.value.length < 7){
        showLineChartButton.value = false;
        showLastCheckedButton.value = false;
      } else {
        setTimeout(() => {showLineChartButton.value = true;},500);
      }
    }
  }
};

//複製 C 波毫秒數 (ms)
const copyCMilliSecond = async () => {
  CWaveRawData.value[0].dataMilliSec.unshift('ms (C Wave)');
  let copiedText;
  let rows = CWaveRawData.value[0].dataMilliSec;

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

//複製 AB 波毫秒數 (ms)
const copyABMilliSecond = async () => {
  ABWaveRawData.value[0].dataMilliSec.unshift('ms (A, B Wave)');
  let copiedText;
  let rows = ABWaveRawData.value[0].dataMilliSec;

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

//滑動到折線圖的方法
const scrollToChart = () => {
  isLineButtonScroll.value = true;
  isHandScroll.value = false;
  const chartElement = document.getElementById('cWave-chart');
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
    if(selectedFile.value.length < 7){
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
.chartBlockC{
  height: 374px;
  width: 490px;
  margin: 0 auto;
}

.chartBlockAB{
  height: 374px;
  width: 490px;
  margin: 0 auto;
}
</style>