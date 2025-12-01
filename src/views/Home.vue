<template>
  <h1>{{ $t('Home-title') }}</h1>
<!--  <div v-for="(group, index) in finalGroupArr" :key="index" style="display: flex; align-items: center; white-space: pre;">-->
<!--    <h3 style="margin-right: 8px;">{{ finalGroupName[index] }}：</h3>-->
<!--    <VueDraggable-->
<!--        ref="el"-->
<!--        v-model="finalGroupArr[index]"-->
<!--        :list="group"-->
<!--        item-key="id"-->
<!--        group="shared"-->
<!--        @start="onDragStart(index)"-->
<!--        @end="onDragEnd(index)"-->
<!--        style="display: flex; gap: 8px;"-->
<!--    >-->
<!--      <template v-for="(subGroup, idx) in group" :key="idx">-->
<!--        <div v-for="(item, subIdx) in subGroup" :key="subIdx" style="display: flex; gap: 8px;">-->
<!--          <h4 :data="item">-->
<!--            {{ item }}-->
<!--            <span v-if="subIdx < subGroup.length - 1">&nbsp;&nbsp;</span>-->
<!--          </h4>-->
<!--        </div>-->
<!--      </template>-->
<!--    </VueDraggable>-->
<!--  </div>-->
<!--  <div v-for="(item, index) in items" :key="index" style="display: flex; align-items: center; white-space: pre">-->
<!--    <h3>Item {{ index + 1 }}:</h3>-->
<!--    <div v-for="(value, subIndex) in item" :key="subIndex" style="display: flex; gap: 8px;">-->
<!--      &lt;!&ndash; 顯示子陣列中的每個值 &ndash;&gt;-->
<!--      <VueDraggable-->
<!--          ref="el"-->
<!--          v-model="items[index][subIndex]"-->
<!--          :list="item"-->
<!--          item-key="id"-->
<!--          group="shared"-->
<!--          @start="onDragStart(index)"-->
<!--          @end="onDragEnd(index)"-->
<!--          style="display: flex; gap: 8px;"-->
<!--      >-->
<!--      <h4>{{ value }}</h4><span v-if="subIndex < item.length - 1">&nbsp;&nbsp;</span>-->
<!--      </VueDraggable>-->
<!--      &lt;!&ndash; 綁定 input 並獲取每個子值的變更 &ndash;&gt;-->
<!--&lt;!&ndash;      <input v-model="items[index][subIndex]" @input="handleInput(index, subIndex, value)" />&ndash;&gt;-->
<!--    </div>-->
<!--  </div>-->
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import {Chart, registerables} from 'chart.js';

Chart.register(...registerables);

const allArrays = ref([]);  // 存放所有生成的 arrays
const items = ref([["A1", "A2", "A3"],
  ["B1", "B2", "B3"],
  ["C1", "C2", "C3"]]);

const generateNewArray = () => {
  // 生成新的 array，並將其加入到 allArrays 中
  const newArray = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
  allArrays.value.push(newArray);  // 將生成的新 array 加入 allArrays
};

const finalGroupArr = ref([
  ['Item 1', 'Item 2'],
  ['Item 3', 'Item 4']
])

const finalGroupName = ref(['Group A', 'Group B'])

// 儲存拖曳來源和目標的索引
const currentDraggingIndex = ref(0);

// 開始拖曳時設定來源索引
function onDragStart(index, subIndex, newValue) {
  console.log(`Item ${index}, SubItem ${subIndex}: ${newValue}`);
}

// 結束拖曳時顯示來源與目標群組
function onDragEnd(index, subIndex, newValue) {
  // console.log(`完成拖曳的來源群組: Group ${finalGroupName.value[currentDraggingIndex.value]}`)
  // console.log(`完成拖曳的目標群組: Group ${finalGroupName.value[targetIndex]}`)
  // currentDraggingIndex.value = null
  console.log(`Item ${index}, SubItem ${subIndex}: ${newValue}`);
}

function handleInput(index, subIndex, newValue) {
  // 取得每個子陣列的值
  console.log(`Item ${index}, SubItem ${subIndex}: ${newValue}`);
  // 更新 items 中的值
  this.items[index][subIndex] = newValue;
}

</script>

<style scoped>

</style>