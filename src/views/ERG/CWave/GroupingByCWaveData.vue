<template>
  <nav id="scrollSample" class="navbar navbar-light px-3" style="width: 150px; position: fixed; top: 110px; right: 40px; border-radius: 30px" v-if="showRawBarChart">
    <ul class="nav nav-pills">
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false" style="color: #006000; font-size: 20px">快速移動</a>
        <ul class="dropdown-menu">
          <li v-if="showRawBarChart"><a class="dropdown-item" @click="scrollToTop">導覽列</a></li>
          <li v-if="showRawBarChart"><a class="dropdown-item" href="#scrollspyHeading2">篩選平均值</a></li>
          <li v-if="showFilterBarChart"><a class="dropdown-item" href="#scrollspyHeading3">分組</a></li>
          <li v-if="chartInstanceGroupA"><a class="dropdown-item" href="#scrollspyHeading4">最終 bar 圖</a></li>
        </ul>
      </li>
    </ul>
  </nav>
  <div data-bs-spy="scroll" data-bs-target="#scrollSample" data-bs-offset="0" class="scrollspy-example" tabindex="0">
    <h1 id="scrollspyHeading1" style="padding-bottom: 5px">根據 C Wave Data 進行動物實驗分組</h1>
    <div class="input-group" style="width: 500px">
      <input class="form-control form-control-lg"
             id="formFileLg"
             type="file"
             multiple
             @change="onFileChange"
             name="files"
             style="width: 270px; margin-bottom: 5px"
             :disabled="showRawBarChart">
      <button class="btn btn-outline-success"
              type="button"
              @click="clearInput"
              v-if="selectedFile"
              style="margin-left: 10px; margin-bottom: 5px">重置</button>
    </div>
    <div class="spinner-border m-5" style="width: 3rem; height: 3rem;" role="status" v-if="loading">
    </div>
    <h4 v-if="showRawBarChart" style="color: #bb2d3b; margin-top: 10px">最後一個 bar 為全部數值平均的值</h4>
    <div class="chartBlockA">
      <canvas id="aWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div class="chartBlockB">
      <canvas id="bWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div id="scrollspyHeading2" class="chartBlockC">
      <canvas id="cWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%;">
      <h4 v-if="showRawBarChart">共有：{{ABCWaveTableData.length}}隻老鼠</h4>
      <h4 v-if="showRawBarChart" style="margin-left: 20px">Total C Wave 平均：{{cWaveTotalAverage.toFixed(2)}}µV</h4>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%;" v-if="showRawBarChart">
      <div class="input-group mb-3" style="width: 260px">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:166px">高於 C Wave 平均值</span>
        <input type="text"
               class="form-control"
               aria-label="Sizing example input"
               aria-describedby="inputGroup-sizing-default"
               :disabled="showFilterBarChart"
               style="width: 40px"
               v-model="highInput">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:40px">倍</span>
      </div>
      <div class="input-group mb-3" style="width: 330px">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:166px; margin-left: 10px">低於 C Wave 平均值</span>
        <input type="text"
               class="form-control"
               aria-label="Sizing example input"
               aria-describedby="inputGroup-sizing-default"
               :disabled="showFilterBarChart"
               style="width: 40px; margin-left: -7px"
               v-model="lowInput">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:40px">倍</span>
        <button class="btn btn-outline-success"
                type="button"
                @click="filterButton(highInput, lowInput)"
                :disabled="showFilterBarChart"
                style="width: 58px">篩選</button>
      </div>
      <button class="btn btn-outline-success btn-sm"
              type="button"
              @click="clearFilterButton"
              :disabled="showFinalGroupingBarChart"
              style="margin-left: 10px; margin-bottom: 15px">重新輸入篩選倍率</button>
      <div style="margin-left: 10px; margin-top: 5px"><small >高於 {{(cWaveTotalAverage * highInput).toFixed(2)}}µV 及低於 {{(cWaveTotalAverage * lowInput).toFixed(2)}}µV 會被剔除</small></div>
    </div>
    <div class="chartBlockFilterA">
      <canvas id="firstFilterAWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div class="chartBlockFilterB">
      <canvas id="firstFilterBWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div id="scrollspyHeading3" class="chartBlockFilterC">
      <canvas id="firstFilterCWave-chart" style="margin-top: 20px; width: 1200px"></canvas>
    </div>
    <div>
      <h4 v-if="showFilterBarChart" style="margin-top: 10px">共 {{deleteMouseNoList.length}}隻被剔除，編號為 {{deleteMouseNoList.join('、')}}</h4>
      <h4 v-if="showFilterBarChart" style="margin-top: 10px">篩選完剩下：{{(firstFilterCWaveTableData.length - 1) / 2}}隻老鼠</h4>
    </div>
    <div class="input-group mb-3" style="width: 267px" v-if="showFilterBarChart">
      <span class="input-group-text" id="inputGroup-sizing-default" style="width:50px">分成</span>
      <button
          class="btn btn-outline-success"
          type="button"
          @click="decrement"
          :disabled="showFinalGroupingBarChart"
          style="width:40px">-</button>
<!--      <input type="number"-->
<!--             min="0"-->
<!--             class="form-control"-->
<!--             aria-label="Sizing example input"-->
<!--             aria-describedby="inputGroup-sizing-default"-->
<!--             style="width: 10px"-->
<!--             @input="validateInputCount"-->
<!--             :disabled="showFinalGroupingBarChart"-->
<!--             v-model.number="inputGroupCount">-->
      <input type="number"
             min="0"
             class="form-control"
             aria-label="Sizing example input"
             aria-describedby="inputGroup-sizing-default"
             style="width: 10px"
             @input="validateInputCount"
             :disabled="showFinalGroupingBarChart"
             v-model.number="inputGroupCount">
      <button
          class="btn btn-outline-success"
          type="button"
          @click="increment"
          :disabled="showFinalGroupingBarChart"
          style="width:40px">+</button>
      <span class="input-group-text" id="inputGroup-sizing-default" style="width:40px">組</span>
      <button class="btn btn-outline-success"
              type="button"
              :disabled="showFinalGroupingBarChart"
              @click="groupingButton(inputGroupCount)"
              style="width: 58px">分組</button>
    </div>
    <!-- 使用 v-for 根據 inputCount 動態生成 <input> 標籤 -->
    <div style="display: flex; flex-wrap: wrap; width: 100%;">
      <div class="input-group mb-3" v-for="index in inputGroupCount" :key="index" style="width: 230px; margin-right: 10px">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:110px">{{index + '. '}}組別名稱：</span>
        <input type="text"
               class="form-control"
               aria-label="Sizing example input"
               aria-describedby="inputGroup-sizing-default"
               :disabled="showFinalGroupingBarChart"
               v-model="finalGroupName[index - 1]">
      </div>
    </div>
    <div style="display: flex; gap: 10px" v-if="showFinalGroupingBarChart" >
      <h4 style="color: #bb2d3b; margin-top: 5px">拖移老鼠編號交換組別</h4>
      <div class="input-group mb-3" style="width: 300px">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:200px">顯示哪個波形的平均值：</span>
        <select class="form-select" v-model="selectedWaveType">
          <option value="null" selected>不顯示</option>
          <option v-for="(name, index) in selectWaveName" :key="index" :value="name">{{name}}</option>
        </select>
      </div>
      <button class="btn btn-outline-success btn-sm"
              type="button"
              @click="cWaveCalculateButton"
              v-if="selectCWave || selectBWave"
              :disabled="isChartDrawing || endGrouping"
              style="width: 120px; height: 30px; border-radius: 20px; margin-top: 5px">以 C Wave 微調</button>
      <button class="btn btn-outline-success btn-sm"
              type="button"
              @click="bWaveCalculateButton"
              v-if="selectBWave || selectCWave"
              :disabled="isChartDrawing || endGrouping"
              style="width: 120px; height: 30px; border-radius: 20px; margin-top: 5px">以 B Wave 微調</button>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%;" v-if="chartInstanceGroupA">
      <div class="input-group mb-3" style="width: 330px">
        <button class="btn btn-outline-success btn-sm"
                type="button"
                @click="openInputFunction"
                :disabled="endGrouping"
                style="width: 80px">自行輸入</button>
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:40px">將</span>
        <input type="text"
               class="form-control"
               aria-label="Sizing example input"
               aria-describedby="inputGroup-sizing-default"
               :disabled="inputFunctionOpen"
               style="width: 40px"
               v-model="maxGroupNameInput">
        <span class="input-group-text" id="inputGroup-sizing-default" style="width:40px">與</span>
        <input type="text"
               class="form-control"
               aria-label="Sizing example input"
               aria-describedby="inputGroup-sizing-default"
               :disabled="inputFunctionOpen"
               style="width: 40px"
               v-model="minGroupNameInput">
        <button class="btn btn-outline-success btn-sm"
                type="button"
                @click="cWaveCalculate(maxGroupNameInput, minGroupNameInput)"
                :disabled="inputFunctionOpen"
                style="width: 50px">微調</button>
      </div>
    </div>
    <div v-for="(group, index) in finalGroupArr" :key="index" style="display: flex; align-items: center; margin-bottom: 16px">
      <h5 style="margin-right: 8px; width: 130px; text-align: right; white-space: nowrap;"> {{ finalGroupName[index] }}：</h5>
      <VueDraggable
          ref="el"
          v-model="finalGroupArr[index]"
          :list ="group"
          item-key="id"
          group="shared"
          :data-group-index="index"
          @start="onDragStart"
          @end="onDragEnd"
          :disabled="isChartDrawing"
          style="display: flex; gap: 8px; flex-wrap: wrap">
        <div v-for="item in group"
             @mouseover="showData(item)"
             @mouseleave="hideData"
             :data-bs-toggle="isDragging ? '' : 'tooltip'"
             :data-bs-placement="'bottom'"
             :title="hoveredItem === item ? formatAsJson(finalDataMapForTooltips.get(item)) : ''"
             style="display: flex; align-items: center; background-color: #dcfce7; padding: 4px 8px; border-radius: 4px; margin-right: 8px;">
          {{ item }}
        </div>
      </VueDraggable>
      <div v-if="selectAWave" style="margin-left: 10px; margin-right: 10px"><span>{{finalGroupAWaveList[index].toFixed(2)}}µV</span></div>
      <div v-if="selectBWave" style="margin-left: 10px; margin-right: 10px"><span>{{finalGroupBWaveList[index].toFixed(2)}}µV</span></div>
      <div v-if="selectCWave" style="margin-left: 10px; margin-right: 10px"><span>{{finalGroupCWaveList[index].toFixed(2)}}µV</span></div>
      <div style="display: flex; gap: 10px">
        <button class="btn btn-outline-success btn-sm"
                type="button"
                @click="copyTableLeftEyeValues(index)"
                style="width: 90px; height: 30px; border-radius: 20px">複製左眼值</button>
        <button class="btn btn-outline-success btn-sm"
                type="button"
                @click="copyTableRightEyeValues(index)"
                style="width: 90px; height: 30px; border-radius: 20px">複製右眼值</button>
        <button class="btn btn-outline-success btn-sm"
                type="button"
                @click="copyTableAllEyesValues(index)"
                style="width: 90px; height: 30px; border-radius: 20px">複製全部值</button>
      </div>
    </div>
    <h4 v-if="showMaxAndMinString">以 C Wave 微調： {{maxGroupName}} 組的 {{maxMouseNo}} 與 {{minGroupName}} 組的 {{minMouseNo}} 交換</h4>
    <h4 v-if="showBWaveMaxAndMinString">以 B Wave 微調： {{maxGroupBWaveName}} 組的 {{maxBWaveMouseNo}} 與 {{minGroupBWaveName}} 組的 {{minBWaveMouseNo}} 交換</h4>
    <div class="input-group mb-3" style="width: 750px" v-if="showFinalGroupingBarChart">
      <span class="input-group-text" id="inputGroup-sizing-default" style="width:166px; margin-left: 10px">請輸入資料夾名稱：</span>
      <input type="text"
             class="form-control"
             aria-label="Sizing example input"
             aria-describedby="inputGroup-sizing-default"
             style="width: 40px; margin-left: -7px"
             :disabled="endGrouping"
             v-model="inputCaseName">
      <button
          class="btn btn-outline-success"
          type="button"
          @click="checkFolderName"
          :disabled="!inputCaseName || endGrouping">檢查資料夾名稱</button>
      <button class="btn btn-outline-success"
              type="button"
              @click="saveOldAndNewFileName"
              :disabled="openSaveOldAndNewFileNameButton"
              style="width: 165px; margin-left: 10px">產生分好組的 Excel</button>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%;">
      <div class="chartBlockGroupLeftA">
        <canvas id="groupLeftAWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupLeftB">
        <canvas id="groupLeftBWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupLeftC">
        <canvas id="groupLeftCWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%; margin-top: 10px">
      <div class="chartBlockGroupRightA">
        <canvas id="groupRightAWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupRightB">
        <canvas id="groupRightBWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupRightC">
        <canvas id="groupRightCWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
    </div>
    <div style="display: flex; flex-wrap: wrap; width: 100%;">
      <div id="scrollspyHeading4" class="chartBlockGroupA">
        <canvas id="groupAWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupB">
        <canvas id="groupBWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
      <div class="chartBlockGroupC">
        <canvas id="groupCWave-chart" style="margin-top: 20px; width: 400px"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import axiosApi from "@/plugins/axios.js";
import {Chart, registerables} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import SweetAlert2 from "sweetalert2";
import { VueDraggable } from 'vue-draggable-plus';
import { useFileNameStore } from '@/stores/usefilename-store.js';

Chart.register(...registerables, annotationPlugin);

//所選擇的檔案
const selectedFile = ref([]);

//根據所選擇的檔案傳回來的資料
const ABCWaveTableData = ref([]);

//左右眼各自 1、2 平均
const AWaveAverageTableData = ref([]);
const BWaveAverageTableData = ref([]);
const CWaveAverageTableData = ref([]);
const groupName = ref([]);

//篩選剔除隻數
const cWaveTotalAverage = ref(0.0);
const highInput = ref(0);
const lowInput = ref(0);
const deleteMouseNoList = ref([]);

//篩選後傳回來的資料
const firstFilterAWaveTableData = ref([]);
const firstFilterBWaveTableData = ref([]);
const firstFilterCWaveTableData = ref([]);
const firstFilterGroupName = ref([]);
const firstFilterBarColors = ref([]);

//儲存篩選完剩下老鼠數量公因數的 List
const commonFactorList = ref([]);

//分組
const inputGroupCount = ref(commonFactorList.value[0]);
const finalGroupAWaveList = ref([]);
const finalGroupBWaveList = ref([]);
const finalGroupCWaveList = ref([]);
const finalGroupLeftAWaveList = ref([]);
const finalGroupLeftBWaveList = ref([]);
const finalGroupLeftCWaveList = ref([]);
const finalGroupRightAWaveList = ref([]);
const finalGroupRightBWaveList = ref([]);
const finalGroupRightCWaveList = ref([]);
// const finalGroupLeftAWaveSDList = ref([]);
// const finalGroupLeftBWaveSDList = ref([]);
// const finalGroupLeftCWaveSDList = ref([]);
// const finalGroupRightAWaveSDList = ref([]);
// const finalGroupRightBWaveSDList = ref([]);
// const finalGroupRightCWaveSDList = ref([]);
// const finalGroupAWaveSDList = ref([]);
// const finalGroupBWaveSDList = ref([]);
// const finalGroupCWaveSDList = ref([]);
const finalGroupName = ref([]);
const finalGroupColors = ref([]);
// const currentValue = ref(commonFactorList.value[0]);

//分完組的陣列
const finalGroupArr = ref([]);

const finalDataMap = ref(new Map());

//滑鼠移入顯示數據 Map
const finalDataMapForTooltips = ref(new Map());

//滑鼠移入移出
const hoveredItem = ref(null);
const isDragging = ref(false);

//顯示柱狀圖
//1. 剛載入檔案
const chartInstanceA = ref(null);
const chartInstanceB = ref(null);
const chartInstanceC = ref(null);
//2. 經過篩選
const chartInstanceFirstA = ref(null);
const chartInstanceFirstB = ref(null);
const chartInstanceFirstC = ref(null);
//3. 最後分組
const chartInstanceGroupLeftA = ref(null);
const chartInstanceGroupLeftB = ref(null);
const chartInstanceGroupLeftC = ref(null);
const chartInstanceGroupRightA = ref(null);
const chartInstanceGroupRightB = ref(null);
const chartInstanceGroupRightC = ref(null);
const chartInstanceGroupA = ref(null);
const chartInstanceGroupB = ref(null);
const chartInstanceGroupC = ref(null);

//按鈕微調分組 (C Wave)
const maxGroupName = ref('');
const minGroupName = ref('');
const maxMouseNo = ref('');
const minMouseNo = ref('');
const showMaxAndMinString = ref(false);

//按鈕微調分組 (B Wave)
const maxGroupBWaveName = ref('');
const minGroupBWaveName = ref('');
const maxBWaveMouseNo = ref('');
const minBWaveMouseNo = ref('');
const showBWaveMaxAndMinString = ref(false);

//輸入微調分組
const maxGroupNameInput = ref('');
const minGroupNameInput = ref('');
const inputFunctionOpen = ref(true);

const showRawBarChart = ref(false);
const showFilterBarChart = ref(false);
const showFinalGroupingBarChart = ref(false);

const loading = ref(false);

// //分完組的舊檔名對應新檔名 Map
const finalFileNameMap = ref(new Map());

//分組確定輸入案件名稱
const inputCaseName = ref('');
const endGrouping = ref(false);

//是否開啟 "產生分好組的 Excel" 按鈕
const openSaveOldAndNewFileNameButton = ref(true);

//切換最後波形的平均值
const selectedWaveType = ref(null); // 用於儲存下拉選單的選定值
const selectWaveName = ref(['A', 'B', 'C']);
const selectAWave = ref(false);
const selectBWave = ref(false);
const selectCWave = ref(false);

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

const barColors = ref([]);

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

  try{
    const formData = new FormData();
    for(let i = 0; i < selectedFile.value.length; i++){
      formData.append("files", selectedFile.value[i]);
    }

    loading.value = true;  //開始加載

    const response = await axiosApi.post("/c_wave/groupingByTable", formData);
    ABCWaveTableData.value = response.data;

    const fileName = [];
    const aWaveAverage = [];
    const bWaveAverage = [];
    const cWaveAverage = [];
    const colors = [];
    let num = 0;
    let sumLA = 0.0;
    let sumLB = 0.0;
    let sumLC = 0.0;
    let sumRA = 0.0;
    let sumRB = 0.0;
    let sumRC = 0.0;

    for(let i = 0; i < ABCWaveTableData.value.length; i++){
      fileName.push(ABCWaveTableData.value[i].groupName + '-L');
      fileName.push(ABCWaveTableData.value[i].groupName + '-R');
      aWaveAverage.push(ABCWaveTableData.value[i].leftEyeAverageAWave);
      aWaveAverage.push(ABCWaveTableData.value[i].rightEyeAverageAWave);
      bWaveAverage.push(ABCWaveTableData.value[i].leftEyeAverageBWave);
      bWaveAverage.push(ABCWaveTableData.value[i].rightEyeAverageBWave);
      cWaveAverage.push(ABCWaveTableData.value[i].leftEyeAverageCWave);
      cWaveAverage.push(ABCWaveTableData.value[i].rightEyeAverageCWave);
      colors.push(fixedColors[i])
      colors.push(fixedColors[i])
      sumLA += ABCWaveTableData.value[i].leftEyeAverageAWave;
      sumRA += ABCWaveTableData.value[i].rightEyeAverageAWave;
      sumLB += ABCWaveTableData.value[i].leftEyeAverageBWave;
      sumRB += ABCWaveTableData.value[i].rightEyeAverageBWave;
      sumLC += ABCWaveTableData.value[i].leftEyeAverageCWave;
      sumRC += ABCWaveTableData.value[i].rightEyeAverageCWave;
      num++;
    }
    cWaveTotalAverage.value = (sumLC + sumRC) / (num * 2);
    aWaveAverage.push((sumLA + sumRA) / (num * 2));
    bWaveAverage.push((sumLB + sumRB) / (num * 2));
    cWaveAverage.push(cWaveTotalAverage.value);
    fileName.push('totalAverage');
    colors.push('black');

    groupName.value = fileName;
    AWaveAverageTableData.value = aWaveAverage;
    BWaveAverageTableData.value = bWaveAverage;
    CWaveAverageTableData.value = cWaveAverage;
    barColors.value = colors;

    loading.value = false;  // 完成加載

    drawWaveChart('aWave-chart', chartInstanceA, groupName.value, AWaveAverageTableData.value, barColors.value, 'A Wave');
    drawWaveChart('bWave-chart', chartInstanceB, groupName.value, BWaveAverageTableData.value, barColors.value, 'B Wave');
    drawWaveChart('cWave-chart', chartInstanceC, groupName.value, CWaveAverageTableData.value, barColors.value, 'C Wave');
    showRawBarChart.value = true;
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
    }
  }
};

const filterButton = (highInput, lowInput) => {

  const a = Array.from(AWaveAverageTableData.value);
  const b = Array.from(BWaveAverageTableData.value);
  const c = Array.from(CWaveAverageTableData.value);
  const n = Array.from(groupName.value);
  const co = Array.from(barColors.value);
  let deleteDataNameList = [];
  for(let i = 0; i < (c.length - 1); i++){
    if(c[i] > highInput * cWaveTotalAverage.value || c[i] < lowInput * cWaveTotalAverage.value){
      deleteDataNameList.push(n[i].substring(0, 5));
      if(i % 2 === 0){
        a.splice(i, 2);
        b.splice(i, 2);
        c.splice(i, 2);
        n.splice(i, 2);
        co.splice(i, 2);
        firstFilterAWaveTableData.value = a;
        firstFilterBWaveTableData.value = b;
        firstFilterCWaveTableData.value = c;
        firstFilterGroupName.value = n;
        firstFilterBarColors.value = co;
        i--;
      } else {
        a.splice((i-1), 2);
        b.splice((i-1), 2);
        c.splice((i-1), 2);
        n.splice((i-1), 2);
        co.splice((i-1), 2);
        firstFilterAWaveTableData.value = a;
        firstFilterBWaveTableData.value = b;
        firstFilterCWaveTableData.value = c;
        firstFilterGroupName.value = n;
        firstFilterBarColors.value = co;
        i -= 2;
      }
    }
  }

  deleteMouseNoList.value = deleteDataNameList;

  //計算剩餘老鼠數量的所有公因數
  //剩餘老鼠數量的最大公因數
  let greatestCommonFactor = (firstFilterCWaveTableData.value.length - 1) / 2;
  console.log(greatestCommonFactor)
  let localCommonFactorList = [];
  for(let i = 1; i <= greatestCommonFactor; i++){
    if(greatestCommonFactor % i === 0){
      localCommonFactorList.push(i);
    }
  }

  commonFactorList.value = localCommonFactorList;

  let dataMap = new Map();
  let dataMapForTooltips = new Map();

  for(let i = 0; i < (firstFilterCWaveTableData.value.length - 1); i++){
    let dataList = [];
    let jsonDataList = [];

    dataList.push(firstFilterAWaveTableData.value[i]);
    dataList.push(firstFilterAWaveTableData.value[i + 1]);
    dataList.push(firstFilterBWaveTableData.value[i]);
    dataList.push(firstFilterBWaveTableData.value[i + 1]);
    dataList.push(firstFilterCWaveTableData.value[i]);
    dataList.push(firstFilterCWaveTableData.value[i + 1]);

    jsonDataList.push({"Left A Wave Average": firstFilterAWaveTableData.value[i].toFixed(2)});
    jsonDataList.push({"Right A Wave Average":firstFilterAWaveTableData.value[i + 1].toFixed(2)});
    jsonDataList.push({"Left B Wave Average":firstFilterBWaveTableData.value[i].toFixed(2)});
    jsonDataList.push({"Right B Wave Average":firstFilterBWaveTableData.value[i + 1].toFixed(2)});
    jsonDataList.push({"Left C Wave Average":firstFilterCWaveTableData.value[i].toFixed(2)});
    jsonDataList.push({"Right C Wave Average":firstFilterCWaveTableData.value[i + 1].toFixed(2)});

    jsonDataList.push({"A Wave Average": ((firstFilterAWaveTableData.value[i] + firstFilterAWaveTableData.value[i + 1]) / 2).toFixed(2)});
    jsonDataList.push({"B Wave Average": ((firstFilterBWaveTableData.value[i] + firstFilterBWaveTableData.value[i + 1]) / 2).toFixed(2)});
    jsonDataList.push({"C Wave Average": ((firstFilterCWaveTableData.value[i] + firstFilterCWaveTableData.value[i + 1]) / 2).toFixed(2)});

    dataMap.set(firstFilterGroupName.value[i].substring(0, firstFilterGroupName.value[i].indexOf('-')), dataList);
    dataMapForTooltips.set(firstFilterGroupName.value[i].substring(0, firstFilterGroupName.value[i].indexOf('-')), jsonDataList);
    dataList = []; // 每次新的 6 個值時重置 dataList
    i++;
  }

  finalDataMap.value = dataMap;
  finalDataMapForTooltips.value = dataMapForTooltips;

  drawWaveChart('firstFilterAWave-chart', chartInstanceFirstA, firstFilterGroupName.value, firstFilterAWaveTableData.value, firstFilterBarColors.value, 'A Wave');
  drawWaveChart('firstFilterBWave-chart', chartInstanceFirstB, firstFilterGroupName.value, firstFilterBWaveTableData.value, firstFilterBarColors.value, 'B Wave');
  drawWaveChart('firstFilterCWave-chart', chartInstanceFirstC, firstFilterGroupName.value, firstFilterCWaveTableData.value, firstFilterBarColors.value, 'C Wave');
  showFilterBarChart.value = true;
}

//處理加按鈕邏輯
const increment = () => {
  let currentIndex = commonFactorList.value.indexOf(inputGroupCount.value);
  if (currentIndex < commonFactorList.value.length - 1) {
    inputGroupCount.value = commonFactorList.value[currentIndex + 1];
  }
}

//處理減按鈕邏輯
const decrement = () => {
  let currentIndex = commonFactorList.value.indexOf(inputGroupCount.value);
  if (currentIndex > 0) {
    inputGroupCount.value = commonFactorList.value[currentIndex - 1];
  }
}

//驗證輸入值是否在 commonFactorList 中
const validateInputCount = (event) => {
  const value = parseInt(event.target.value, 10);

  //如果值不在 commonFactorList 中，恢復預設值
  if (!commonFactorList.value.some(num => num === value)) {
    inputGroupCount.value = commonFactorList.value[0]; // 恢復預設值
  } else {
    inputGroupCount.value = value; // 更新值
  }
}

// 監聽 inputCount 的變化，調整 inputValues 的長度
watch(
    inputGroupCount,
    (newCount) => {
          // 動態更新 inputValues 的長度，保持與 inputCount 相同
          if (newCount > finalGroupName.value.length) {
            // 增加新的輸入欄位
            finalGroupName.value = [...finalGroupName.value, ...Array(newCount - finalGroupName.value.length).fill('')];
          } else {
            // 移除多餘的輸入欄位
            finalGroupName.value = finalGroupName.value.slice(0, newCount);
          }
        }
);

//分組按鈕
const groupingButton = (inputGroupCount) => {
  let valueArr = [];
  let filterCWaveTableDataMap = new Map();

  //cWaveTotalAverage 減去左右眼 C Wave 值相加平均取絕對值，並存入 Array 與 Map
  for(let i = 0; i < (firstFilterCWaveTableData.value.length - 1); i++){
    let valueGroupName = firstFilterGroupName.value[i].substring(0, firstFilterGroupName.value[i].indexOf('-'));
    let value = Math.abs(cWaveTotalAverage.value - ((firstFilterCWaveTableData.value[i] + firstFilterCWaveTableData.value[i + 1]) / 2));
    valueArr.push(value);
    filterCWaveTableDataMap.set(value, valueGroupName);
    i++;
  }

  //由差距小到大排名
  valueArr.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  let finalGroupAnimalNameArr = [];

  for(let i = 0; i < valueArr.length; i++){
    finalGroupAnimalNameArr.push( filterCWaveTableDataMap.get(valueArr[i]));
  }

  //S型縱向分組
  finalGroupArr.value = sShapeColumns(finalGroupAnimalNameArr, inputGroupCount);

  showFinalGroupingBarChart.value = true;

  console.log(finalDataMapForTooltips.value)
}

//S型縱向分組函式
function sShapeColumns(array, columns) {
  let result = Array.from({ length: columns }, () => []); // 建立指定列數的空陣列

  for (let i = 0; i < array.length; i++) {
    // 計算當前的列位置
    let colIndex = i % columns;

    // 每組交錯放入不同列
    if (Math.floor(i / columns) % 2 === 1) {
      // 若為奇數組，從下往上放
      result[columns - colIndex - 1].push(array[i]);
    } else {
      // 若為偶數組，從上往下放
      result[colIndex].push(array[i]);
    }
  }

  return result;
}

//拖移完成要執行的 function
const onDragEnd = (evt) => {
  const toGroupIndex = evt.to.dataset.groupIndex; // 用於取得目標群組的索引
  const fromGroupIndex = evt.from.dataset.groupIndex;
  const fromItemIdx = evt.oldIndex;  // 拖曳項目的原始索引
  const toItemIdx = evt.newIndex;    // 拖曳項目的新目標索引

  const [draggingFromMouseNo] = finalGroupArr.value[fromGroupIndex].splice(fromItemIdx, 1);
  //效果同上，第二種寫法：const draggingFromMouseNo = finalGroupArr.value[fromGroupIndex].splice(fromItemIdx, 1)[0];

  if(draggingFromMouseNo !== undefined){
    finalGroupArr.value[toGroupIndex].splice(toItemIdx, 0, draggingFromMouseNo);
    finalGroupArr.value[toGroupIndex].splice(toItemIdx, 1);
    finalGroupArr.value[fromGroupIndex].splice(fromItemIdx, 0, draggingFromMouseNo);
  }
  console.log(fromGroupIndex, fromItemIdx)
  console.log(toGroupIndex, toItemIdx)


  const [draggingToMouseNo] = finalGroupArr.value[toGroupIndex].splice(toItemIdx, 1);
  console.log(draggingToMouseNo)
  finalGroupArr.value[toGroupIndex].splice(toItemIdx, 0, draggingToMouseNo);
  const [changeDraggingFromMouseNo] = finalGroupArr.value[toGroupIndex].splice(toItemIdx + 1, 1);
  console.log(changeDraggingFromMouseNo)
  finalGroupArr.value[fromGroupIndex].splice(fromItemIdx, 0, changeDraggingFromMouseNo);

  isDragging.value = false;

  for(let i = 0; i < finalGroupArr.value.length; i++){
    console.log(finalGroupArr.value[i]);
  }
};

watch(
    () => finalGroupArr.value,
    () => {
      if (
          chartInstanceGroupLeftA.value && chartInstanceGroupLeftB.value && chartInstanceGroupLeftC.value &&
          chartInstanceGroupRightA.value && chartInstanceGroupRightB.value && chartInstanceGroupRightC.value &&
          chartInstanceGroupA.value && chartInstanceGroupB.value && chartInstanceGroupC.value
      ) {
        chartInstanceGroupLeftA.value.destroy();
        chartInstanceGroupLeftB.value.destroy();
        chartInstanceGroupLeftC.value.destroy();
        chartInstanceGroupRightA.value.destroy();
        chartInstanceGroupRightB.value.destroy();
        chartInstanceGroupRightC.value.destroy();
        chartInstanceGroupA.value.destroy();
        chartInstanceGroupB.value.destroy();
        chartInstanceGroupC.value.destroy();
      }

      if (finalGroupArr.value.length > 0) {
        isChartDrawing.value = true;  //繪製前鎖定多選框

        let sumLeftA = 0.0;
        let sumLeftB = 0.0;
        let sumLeftC = 0.0;
        let sumRightA = 0.0;
        let sumRightB = 0.0;
        let sumRightC = 0.0;
        let sumA = 0.0;
        let sumB = 0.0;
        let sumC = 0.0;
        // let leftAWaveList = [];
        // let leftBWaveList = [];
        // let leftCWaveList = [];
        // let rightAWaveList = [];
        // let rightBWaveList = [];
        // let rightCWaveList = [];
        // let aWaveList = [];
        // let bWaveList = [];
        // let cWaveList = [];
        let sumLeftAList = [];
        let sumLeftBList = [];
        let sumLeftCList = [];
        let sumRightAList = [];
        let sumRightBList = [];
        let sumRightCList = [];
        let sumAList = [];
        let sumBList = [];
        let sumCList = [];
        // let leftASDList = [];
        // let leftBSDList = [];
        // let leftCSDList = [];
        // let rightASDList = [];
        // let rightBSDList = [];
        // let rightCSDList = [];
        // let aSDList = [];
        // let bSDList = [];
        // let cSDList = [];
        let colors = [];

        for(let i = 0; i < finalGroupArr.value.length; i++){
          // leftAWaveList = []
          // leftBWaveList = [];
          // leftCWaveList = [];
          // rightAWaveList = [];
          // rightBWaveList = [];
          // rightCWaveList = [];
          // aWaveList = [];
          // bWaveList = [];
          // cWaveList = [];
          colors.push(fixedColors[i]);
          for(let j = 0; j < finalGroupArr.value[i].length; j++){
            let leftEyeAWave = finalDataMap.value.get(finalGroupArr.value[i][j])[0];
            // leftAWaveList.push(leftEyeAWave);
            let leftEyeBWave = finalDataMap.value.get(finalGroupArr.value[i][j])[2];
            // leftBWaveList.push(leftEyeBWave);
            let leftEyeCWave = finalDataMap.value.get(finalGroupArr.value[i][j])[4];
            // leftCWaveList.push(leftEyeCWave);
            let rightEyeAWave = finalDataMap.value.get(finalGroupArr.value[i][j])[1];
            // rightAWaveList.push(rightEyeAWave);
            let rightEyeBWave = finalDataMap.value.get(finalGroupArr.value[i][j])[3];
            // rightBWaveList.push(rightEyeBWave);
            let rightEyeCWave = finalDataMap.value.get(finalGroupArr.value[i][j])[5];
            // rightCWaveList.push(rightEyeCWave);
            let bothEyesAWave = (finalDataMap.value.get(finalGroupArr.value[i][j])[0] + finalDataMap.value.get(finalGroupArr.value[i][j])[1]) / 2;
            // aWaveList.push(bothEyesAWave);
            let bothEyesBWave = (finalDataMap.value.get(finalGroupArr.value[i][j])[2] + finalDataMap.value.get(finalGroupArr.value[i][j])[3]) / 2;
            // bWaveList.push(bothEyesBWave);
            let bothEyesCWave = (finalDataMap.value.get(finalGroupArr.value[i][j])[4] + finalDataMap.value.get(finalGroupArr.value[i][j])[5]) / 2;
            // cWaveList.push(bothEyesCWave);

            sumLeftA += leftEyeAWave;
            sumLeftB += leftEyeBWave;
            sumLeftC += leftEyeCWave;
            sumRightA += rightEyeAWave;
            sumRightB += rightEyeBWave;
            sumRightC += rightEyeCWave;
            sumA += bothEyesAWave;
            sumB += bothEyesBWave;
            sumC += bothEyesCWave;
          }

          sumLeftAList.push(sumLeftA / finalGroupArr.value[i].length);
          sumLeftBList.push(sumLeftB / finalGroupArr.value[i].length);
          sumLeftCList.push(sumLeftC / finalGroupArr.value[i].length);
          sumRightAList.push(sumRightA / finalGroupArr.value[i].length);
          sumRightBList.push(sumRightB / finalGroupArr.value[i].length);
          sumRightCList.push(sumRightC / finalGroupArr.value[i].length);
          sumAList.push(sumA / finalGroupArr.value[i].length);
          sumBList.push(sumB / finalGroupArr.value[i].length);
          sumCList.push(sumC / finalGroupArr.value[i].length);
          // leftASDList.push(getStandardDeviation(leftAWaveList));
          // leftBSDList.push(getStandardDeviation(leftBWaveList));
          // leftCSDList.push(getStandardDeviation(leftCWaveList));
          // rightASDList.push(getStandardDeviation(rightAWaveList));
          // rightBSDList.push(getStandardDeviation(rightBWaveList));
          // rightCSDList.push(getStandardDeviation(rightCWaveList));
          // aSDList.push(getStandardDeviation(aWaveList));
          // bSDList.push(getStandardDeviation(bWaveList));
          // cSDList.push(getStandardDeviation(cWaveList));

          sumLeftA = 0.0;
          sumLeftB = 0.0;
          sumLeftC = 0.0;
          sumRightA = 0.0;
          sumRightB = 0.0;
          sumRightC = 0.0;
          sumA = 0.0;
          sumB = 0.0;
          sumC = 0.0;

          finalGroupLeftAWaveList.value = sumLeftAList;
          finalGroupLeftBWaveList.value = sumLeftBList;
          finalGroupLeftCWaveList.value = sumLeftCList;
          finalGroupRightAWaveList.value = sumRightAList;
          finalGroupRightBWaveList.value = sumRightBList;
          finalGroupRightCWaveList.value = sumRightCList;
          finalGroupAWaveList.value = sumAList;
          finalGroupBWaveList.value = sumBList;
          finalGroupCWaveList.value = sumCList;
          // finalGroupLeftAWaveSDList.value = leftASDList;
          // finalGroupLeftBWaveSDList.value = leftBSDList;
          // finalGroupLeftCWaveSDList.value = leftCSDList;
          // finalGroupRightAWaveSDList.value = rightASDList;
          // finalGroupRightBWaveSDList.value = rightBSDList;
          // finalGroupRightCWaveSDList.value = rightCSDList;
          // finalGroupAWaveSDList.value = aSDList;
          // finalGroupBWaveSDList.value = bSDList;
          // finalGroupCWaveSDList.value = cSDList;
          finalGroupColors.value = colors;
        }
        drawFinalGroupWaveChart('groupLeftAWave-chart', chartInstanceGroupLeftA, finalGroupName.value, finalGroupLeftAWaveList.value, finalGroupColors.value, 'A Wave (Left Eye)');
        drawFinalGroupWaveChart('groupLeftBWave-chart', chartInstanceGroupLeftB, finalGroupName.value, finalGroupLeftBWaveList.value, finalGroupColors.value, 'B Wave (Left Eye)');
        drawFinalGroupWaveChart('groupLeftCWave-chart', chartInstanceGroupLeftC, finalGroupName.value, finalGroupLeftCWaveList.value, finalGroupColors.value, 'C Wave (Left Eye)');
        drawFinalGroupWaveChart('groupRightAWave-chart', chartInstanceGroupRightA, finalGroupName.value, finalGroupRightAWaveList.value, finalGroupColors.value, 'A Wave (Right Eye)');
        drawFinalGroupWaveChart('groupRightBWave-chart', chartInstanceGroupRightB, finalGroupName.value, finalGroupRightBWaveList.value, finalGroupColors.value, 'B Wave (Right Eye)');
        drawFinalGroupWaveChart('groupRightCWave-chart', chartInstanceGroupRightC, finalGroupName.value, finalGroupRightCWaveList.value, finalGroupColors.value, 'C Wave (Right Eye)');
        drawFinalGroupWaveChart('groupAWave-chart', chartInstanceGroupA, finalGroupName.value, finalGroupAWaveList.value, finalGroupColors.value, 'A Wave (Both Eyes)');
        drawFinalGroupWaveChart('groupBWave-chart', chartInstanceGroupB, finalGroupName.value, finalGroupBWaveList.value, finalGroupColors.value, 'B Wave (Both Eyes)');
        drawFinalGroupWaveChart('groupCWave-chart', chartInstanceGroupC, finalGroupName.value, finalGroupCWaveList.value, finalGroupColors.value, 'C Wave (Both Eyes)');
      }
    },
    { deep: true }
);

watch(
    () => selectedWaveType.value,
    () => {
      if(selectedWaveType.value === 'A'){
        selectAWave.value = true;
        selectBWave.value = false;
        selectCWave.value = false;
      } else if(selectedWaveType.value === 'B'){
        selectAWave.value = false;
        selectBWave.value = true;
        selectCWave.value = false;
      } else if(selectedWaveType.value === 'C'){
        selectAWave.value = false;
        selectBWave.value = false;
        selectCWave.value = true;
      } else {
        selectAWave.value = false;
        selectBWave.value = false;
        selectCWave.value = false;
      }
    }
);

//計算 StandardDeviation
function getStandardDeviation(number) {
  if (number.length < 2) {
    return undefined;
  }
  const n = number.length;
  const mean = number.reduce((a, b) => a + b) / n;
  return Math.sqrt(
      number.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / (n - 1));
}

const clearFilterButton = () => {
  if (chartInstanceFirstA.value && chartInstanceFirstB.value && chartInstanceFirstC.value) {
    chartInstanceFirstA.value.destroy();
    chartInstanceFirstB.value.destroy();
    chartInstanceFirstC.value.destroy();
  }
  firstFilterAWaveTableData.value = [];
  firstFilterBWaveTableData.value = [];
  firstFilterCWaveTableData.value = [];
  firstFilterGroupName.value = [];
  firstFilterBarColors.value = [];
  highInput.value = 0.0;
  lowInput.value = 0.0;
  showFilterBarChart.value = false;
};

const clearInput = () => {
  window.location.reload();
};

//畫柱狀圖函式
const drawWaveChart = (elementId, chartInstance, groupName, data, colors, title) => {
  const ctx = document.getElementById(elementId).getContext('2d');
  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: groupName,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: colors,
        fill: false,
        pointRadius: 0
      }],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        annotation: {
          annotations: {
            averageLine: {
              type: 'line',
              yMin: data[data.length - 1],
              yMax: data[data.length - 1],
              borderColor: 'red',
              borderWidth: 2,
              borderDash: [6, 6] // 虛線樣式
            }
          }
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 25,
            weight: "bold"
          }
        }
      },
      scales: {
        x: {
          title: {
            display: false,
            text: '老鼠編號',
          },
          ticks: {
            display: false
          }
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
};

//畫分完組柱狀圖函式
const drawFinalGroupWaveChart = (elementId, chartInstance, finalGroupName, data, colors, title) => {
  const ctx = document.getElementById(elementId).getContext('2d');

  chartInstance.value = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: finalGroupName,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderColor: colors,
        fill: false,
        pointRadius: 0
      }],
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title,
          font: {
            size: 20,
            weight: "bold"
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: '組別',
          },
          ticks: {
            display: true
          }
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


const showData = (item) => {
  if (!isDragging.value) {
    hoveredItem.value = item;
  }
}

const hideData = () => {
  hoveredItem.value = null;
}

const onDragStart = () => {
  isDragging.value = true;
  hoveredItem.value = null;
}

const formatAsJson = (data) => {
  if (Array.isArray(data)) {
    // 將陣列中的每個物件格式化成 "key: value" 的樣式，並用逗號分隔
    return data.map(item =>
        Object.entries(item)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
    ).join('\n');
  }
  return '';
}

const checkFolderName = async () => {

  let data = {
    "inputCaseName": inputCaseName.value
  };

  const response = await axiosApi.post("/common/checkCWaveFolderName", data);

  if(response.data === true){
    openSaveOldAndNewFileNameButton.value = true;
    await SweetAlert2.fire({
      icon: 'error',
      title: '資料夾名稱已存在',
      html: `<P>請重新輸入！</P>`
    });
    inputCaseName.value = '';
  } else {
    openSaveOldAndNewFileNameButton.value = false;
    await SweetAlert2.fire({
      icon: 'success',
      title: '可使用此資料夾名稱'
    });
  }
}

const saveOldAndNewFileName = async () => {
  const fileNameStore = useFileNameStore(); // 使用 pinia Store
  const { finalFileNameMap, updateFileNameMap } = fileNameStore;

  for (let i = 0; i < finalGroupName.value.length; i++) {
    for (let j = 0; j < finalGroupArr.value[i].length; j++) {
      const newFileName =
          (i * finalGroupArr.value[i].length + (j + 1)) < 10
              ? `${finalGroupName.value[i]}_0${i * finalGroupArr.value[i].length + (j + 1)}`
              : `${finalGroupName.value[i]}_${i * finalGroupArr.value[i].length + (j + 1)}`;

      //使用 Pinia 更新 Map
      updateFileNameMap(finalGroupArr.value[i][j], newFileName);
    }
  }
  console.log(finalFileNameMap)
  console.log(finalFileNameMap.value)
  for (let i = 0; i < finalGroupName.value.length; i++) {
    for (let j = 0; j < finalGroupArr.value[i].length; j++) {
      if ((i * finalGroupArr.value[i].length + (j + 1)) < 10) {
        finalFileNameMap.set(finalGroupArr.value[i][j], finalGroupName.value[i] + '_0' + (i * finalGroupArr.value[i].length + (j + 1)));
      } else {
        finalFileNameMap.set(finalGroupArr.value[i][j], finalGroupName.value[i] + '_' + (i * finalGroupArr.value[i].length + (j + 1)));
      }
    }
  }
  console.log(finalFileNameMap)
  let data = {
    "cWaveNewAndOldFileNameMapSet": Object.fromEntries(finalFileNameMap), //從 Pinia Map 中獲取資料
    "inputCaseName": inputCaseName.value
  };

  const response = await axiosApi.post("/c_wave/reNameCWaveFile", data);
  await SweetAlert2.fire({
    icon: 'success',
    title: response.data
  });

  openSaveOldAndNewFileNameButton.value = true;
  endGrouping.value = true;
}

const copyTableLeftEyeValues = (index) => {
  let leftFinalGroupNameList = []
  let leftAWaveList = []
  let leftBWaveList = [];
  let leftCWaveList = [];

  for(let i = 0; i < finalGroupArr.value[index].length; i++){
    if((index * finalGroupArr.value[index].length + (i + 1)) < 10){
      let leftGroupName = finalGroupName.value[index] + '_0' + (index * finalGroupArr.value[index].length + (i + 1)) + '-L' +
          ' (原 ' + finalGroupArr.value[index][i] + '-L)';
      leftFinalGroupNameList.push(leftGroupName);
      let leftEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[0];
      leftAWaveList.push(leftEyeAWave);
      let leftEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[2];
      leftBWaveList.push(leftEyeBWave);
      let leftEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[4];
      leftCWaveList.push(leftEyeCWave);
    } else {
      let leftGroupName = finalGroupName.value[index] + '_' + (index * finalGroupArr.value[index].length + (i + 1)) + '-L' +
          ' (原 ' + finalGroupArr.value[index][i] + '-L)';
      leftFinalGroupNameList.push(leftGroupName);
      let leftEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[0];
      leftAWaveList.push(leftEyeAWave);
      let leftEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[2];
      leftBWaveList.push(leftEyeBWave);
      let leftEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[4];
      leftCWaveList.push(leftEyeCWave);
    }
  }

  const allValues = [leftFinalGroupNameList, leftAWaveList, leftBWaveList, leftCWaveList].map(col => col.join('\t')).join('\n');

  // 複製值到剪貼簿
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

const copyTableRightEyeValues = (index) => {
  let rightFinalGroupNameList = [];
  let rightAWaveList = []
  let rightBWaveList = [];
  let rightCWaveList = [];

  for(let i = 0; i < finalGroupArr.value[index].length; i++){
    if((index * finalGroupArr.value[index].length + (i + 1)) < 10){
      let rightGroupName = finalGroupName.value[index] + '_0' + (index * finalGroupArr.value[index].length + (i + 1)) + '-R' +
          ' (原 ' + finalGroupArr.value[index][i] + '-R)';
      rightFinalGroupNameList.push(rightGroupName);
      let rightEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[1];
      rightAWaveList.push(rightEyeAWave);
      let rightEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[3];
      rightBWaveList.push(rightEyeBWave);
      let rightEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[5];
      rightCWaveList.push(rightEyeCWave);
    } else {
      let rightGroupName = finalGroupName.value[index] + '_' + (index * finalGroupArr.value[index].length + (i + 1)) + '-R' +
          ' (原 ' + finalGroupArr.value[index][i] + '-R)';
      rightFinalGroupNameList.push(rightGroupName);
      let rightEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[1];
      rightAWaveList.push(rightEyeAWave);
      let rightEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[3];
      rightBWaveList.push(rightEyeBWave);
      let rightEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[5];
      rightCWaveList.push(rightEyeCWave);
    }
  }

  const allValues = [rightFinalGroupNameList, rightAWaveList, rightBWaveList, rightCWaveList].map(col => col.join('\t')).join('\n');

  // 複製值到剪貼簿
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

const copyTableAllEyesValues = (index) => {
  let finalGroupNameList = [];
  let AWaveList = []
  let BWaveList = [];
  let CWaveList = [];

  for(let i = 0; i < finalGroupArr.value[index].length; i++){
    if((index * finalGroupArr.value[index].length + (i + 1)) < 10){
      let leftGroupName = finalGroupName.value[index] + '_0' + (index * finalGroupArr.value[index].length + (i + 1)) + '-L' +
          ' (原 ' + finalGroupArr.value[index][i] + '-L)';
      finalGroupNameList.push(leftGroupName);
      let rightGroupName = finalGroupName.value[index] + '_0' + (index * finalGroupArr.value[index].length + (i + 1)) + '-R' +
          ' (原 ' + finalGroupArr.value[index][i] + '-R)';
      finalGroupNameList.push(rightGroupName);
      let leftEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[0];
      AWaveList.push(leftEyeAWave);
      let rightEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[1];
      AWaveList.push(rightEyeAWave);
      let leftEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[2];
      BWaveList.push(leftEyeBWave);
      let rightEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[3];
      BWaveList.push(rightEyeBWave);
      let leftEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[4];
      CWaveList.push(leftEyeCWave);
      let rightEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[5];
      CWaveList.push(rightEyeCWave);
    } else {
      let leftGroupName = finalGroupName.value[index] + '_' + (index * finalGroupArr.value[index].length + (i + 1)) + '-L' +
          ' (原 ' + finalGroupArr.value[index][i] + '-L)';
      finalGroupNameList.push(leftGroupName);
      let rightGroupName = finalGroupName.value[index] + '_' + (index * finalGroupArr.value[index].length + (i + 1)) + '-R' +
          ' (原 ' + finalGroupArr.value[index][i] + '-R)';
      finalGroupNameList.push(rightGroupName);
      let leftEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[0];
      AWaveList.push(leftEyeAWave);
      let rightEyeAWave = finalDataMap.value.get(finalGroupArr.value[index][i])[1];
      AWaveList.push(rightEyeAWave);
      let leftEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[2];
      BWaveList.push(leftEyeBWave);
      let rightEyeBWave = finalDataMap.value.get(finalGroupArr.value[index][i])[3];
      BWaveList.push(rightEyeBWave);
      let leftEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[4];
      CWaveList.push(leftEyeCWave);
      let rightEyeCWave = finalDataMap.value.get(finalGroupArr.value[index][i])[5];
      CWaveList.push(rightEyeCWave);
    }
  }

  const allValues = [finalGroupNameList, AWaveList, BWaveList, CWaveList].map(col => col.join('\t')).join('\n');

  // 複製值到剪貼簿
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

const cWaveCalculateButton = () => {

  let c = Array.from(finalGroupCWaveList.value);
  let valueGetName = new Map();
  for(let i = 0; i < c.length; i++){
    valueGetName.set(c[i], finalGroupName.value[i]);
  }

  c.sort(function(a, b) {
    return b - a
  });

  waveCalculate(valueGetName.get(c[0]), valueGetName.get(c[c.length - 1]), finalGroupCWaveList, 4, 5);
}

const bWaveCalculateButton = () => {

  let bWave = Array.from(finalGroupBWaveList.value);
  let valueGetName = new Map();
  for(let i = 0; i < bWave.length; i++){
    valueGetName.set(bWave[i], finalGroupName.value[i]);
  }

  bWave.sort(function(a, b) {
    return b - a
  });

  const maxIndex = finalGroupName.value.indexOf(valueGetName.get(bWave[0]));
  const minIndex = finalGroupName.value.indexOf(valueGetName.get(bWave[bWave.length - 1]));

  maxGroupBWaveName.value = finalGroupName.value[maxIndex];
  minGroupBWaveName.value = finalGroupName.value[minIndex];

  let dataCompareList = [];
  let dataCompareMap = new Map();

  for(let i = 0; i < finalGroupArr.value[maxIndex].length; i++){
    let maxGroupName = finalGroupArr.value[maxIndex][i];
    let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[4];
    let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[5];
    let maxCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
    for(let j = 0; j < finalGroupArr.value[minIndex].length; j++){
      let minGroupName = finalGroupArr.value[minIndex][j];
      let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[4];
      let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[5];
      let minCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
      let value = Math.abs(maxCWave - minCWave);
      if(value < maxCWave * 0.05){
        dataCompareList.push(value);
        dataCompareMap.set(value, (maxGroupName + '-' + minGroupName));
      }
    }
  }

  dataCompareList.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  // 檢查 dataCompareList 是否為空
  if (dataCompareList.length === 0) {
    SweetAlert2.fire({
      icon: 'warning',
      title: '無可交換的老鼠',
      text: '找不到 C Wave 相近，可互相交換的老鼠。'
    });
    return;
  }

  maxBWaveMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(0, dataCompareMap.get(dataCompareList[0]).indexOf('-'))
  minBWaveMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(dataCompareMap.get(dataCompareList[0]).indexOf('-') + 1, dataCompareMap.get(dataCompareList[0]).indexOf('-') + 6);

  let maxGroupBWaveItemIndex = finalGroupArr.value[maxIndex].indexOf(maxBWaveMouseNo.value);
  let minGroupItemBWaveIndex = finalGroupArr.value[minIndex].indexOf(minBWaveMouseNo.value);

  const [fromMouseNo] = finalGroupArr.value[maxIndex].splice(maxGroupBWaveItemIndex, 1);
  finalGroupArr.value[minIndex].splice(minGroupItemBWaveIndex, 0, fromMouseNo);
  const [toMouseNo] = finalGroupArr.value[minIndex].splice(minGroupItemBWaveIndex + 1, 1);
  finalGroupArr.value[maxIndex].splice(maxGroupBWaveItemIndex, 0, toMouseNo);

  showBWaveMaxAndMinString.value = true;
}

const waveCalculate = (inputFrom, inputTo, finalGroupWaveList, leftWaveNo, rightWaveNo) => {

  const maxIndex = finalGroupName.value.indexOf(inputFrom);
  const minIndex = finalGroupName.value.indexOf(inputTo);

  maxGroupName.value = finalGroupName.value[maxIndex];
  minGroupName.value = finalGroupName.value[minIndex];

  let closest = ((finalGroupWaveList.value[maxIndex] - finalGroupWaveList.value[minIndex]) * finalGroupArr.value[minIndex].length) / 2;

  let dataCompareList = [];
  let dataCompareMap = new Map();

  for(let i = 0; i < finalGroupArr.value[maxIndex].length; i++){
    let maxGroupName = finalGroupArr.value[maxIndex][i];
    let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[leftWaveNo];
    let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[rightWaveNo];
    let maxCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
    for(let j = 0; j < finalGroupArr.value[minIndex].length; j++){
      let minGroupName = finalGroupArr.value[minIndex][j];
      let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[leftWaveNo];
      let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[rightWaveNo];
      let minCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
      let value = Math.abs(closest - (maxCWave - minCWave));
      dataCompareList.push(value);
      dataCompareMap.set(value, (maxGroupName + '-' + minGroupName));
    }
  }

  dataCompareList.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  maxMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(0, dataCompareMap.get(dataCompareList[0]).indexOf('-'));
  minMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(dataCompareMap.get(dataCompareList[0]).indexOf('-') + 1);
  let maxGroupItemIndex = finalGroupArr.value[maxIndex].indexOf(maxMouseNo.value);
  let minGroupItemIndex = finalGroupArr.value[minIndex].indexOf(minMouseNo.value);

  const [fromMouseNo] = finalGroupArr.value[maxIndex].splice(maxGroupItemIndex, 1);
  finalGroupArr.value[minIndex].splice(minGroupItemIndex, 0, fromMouseNo);
  const [toMouseNo] = finalGroupArr.value[minIndex].splice(minGroupItemIndex + 1, 1);
  finalGroupArr.value[maxIndex].splice(maxGroupItemIndex, 0, toMouseNo);

  showMaxAndMinString.value = true;
}

const cWaveCalculate = (inputFrom, inputTo) => {

  const maxIndex = finalGroupName.value.indexOf(inputFrom);
  const minIndex = finalGroupName.value.indexOf(inputTo);

  maxGroupName.value = finalGroupName.value[maxIndex];
  minGroupName.value = finalGroupName.value[minIndex];

  let closest = ((finalGroupCWaveList.value[maxIndex] - finalGroupCWaveList.value[minIndex]) * finalGroupArr.value[minIndex].length) / 2;

  let dataCompareList = [];
  let dataCompareMap = new Map();

  for(let i = 0; i < finalGroupArr.value[maxIndex].length; i++){
    let maxGroupName = finalGroupArr.value[maxIndex][i];
    let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[4];
    let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[maxIndex][i])[5];
    let maxCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
    for(let j = 0; j < finalGroupArr.value[minIndex].length; j++){
      let minGroupName = finalGroupArr.value[minIndex][j];
      let leftEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[4];
      let rightEyeMaxCWave = finalDataMap.value.get(finalGroupArr.value[minIndex][j])[5];
      let minCWave = (leftEyeMaxCWave + rightEyeMaxCWave) / 2;
      let value = Math.abs(closest - (maxCWave - minCWave));
      dataCompareList.push(value);
      dataCompareMap.set(value, (maxGroupName + '-' + minGroupName));
    }
  }

  dataCompareList.sort(function(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });

  maxMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(0, dataCompareMap.get(dataCompareList[0]).indexOf('-'));
  minMouseNo.value = dataCompareMap.get(dataCompareList[0]).substring(dataCompareMap.get(dataCompareList[0]).indexOf('-') + 1);
  let maxGroupItemIndex = finalGroupArr.value[maxIndex].indexOf(maxMouseNo.value);
  let minGroupItemIndex = finalGroupArr.value[minIndex].indexOf(minMouseNo.value);

  const [fromMouseNo] = finalGroupArr.value[maxIndex].splice(maxGroupItemIndex, 1);
  finalGroupArr.value[minIndex].splice(minGroupItemIndex, 0, fromMouseNo);
  const [toMouseNo] = finalGroupArr.value[minIndex].splice(minGroupItemIndex + 1, 1);
  finalGroupArr.value[maxIndex].splice(maxGroupItemIndex, 0, toMouseNo);

  showMaxAndMinString.value = true;
}

const openInputFunction = () => {
  inputFunctionOpen.value = inputFunctionOpen.value !== true;
}

//回到最上面
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};
</script>

<style scoped>

.navbar {
  background-color: #dcfce7;
}

.chartBlockA{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}

.chartBlockB{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}

.chartBlockC{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}

.chartBlockFilterA{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}
.chartBlockFilterB{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}
.chartBlockFilterC{
  height: 200px;
  width: 1000px;
  margin: 0 auto;
}

.chartBlockGroupLeftA{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupLeftB{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupLeftC{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupRightA{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupRightB{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupRightC{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupA{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupB{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

.chartBlockGroupC{
  height: 200px;
  width: 300px;
  margin: 0 auto;
}

/* 取消預設上下鍵按鈕 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>