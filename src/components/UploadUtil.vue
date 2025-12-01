<template>
  <div class="d-flex align-items-center gap-2">
    <!-- 隱藏 input -->
    <input
        ref="fileInput"
        type="file"
        style="display: none"
        class="form-control"
        multiple
        :disabled="disabled"
        @change="onFileChange"
    />

    <!-- 自訂按鈕 -->
    <button
        class="btn btn-outline-success btn-lg"
        :disabled="disabled"
        style="border-radius: 5px 0 0 5px"
        @click="triggerInput"
    >{{ i18nText.chooseFileText }}</button>

    <!-- 顯示檔案名稱 -->
    <div class="text-muted small">
      <template v-if="fileNames.length">
        <div
            class="custom-file-button"
            @mouseover="showData(fileNames)"
            @mouseleave="hideData"
            :data-bs-toggle="isDragging ? '' : 'tooltip'"
            :data-bs-placement="'bottom'"
            :title="hoveredItem === fileNames ? fileNames.join('\n') : ''"
        >
          {{ i18nText.alreadySelectedText }}：{{ fileNames.length }}{{ fileNames.length > 1 ? i18nText.quantifiers : i18nText.quantifier }}
        </div>
      </template>
      <template v-else>
        <div class="custom-file-button">{{ i18nText.noFileSelectedText }}</div>
      </template>
    </div>
  </div>

  <!-- 上傳中 spinner -->
  <div class="d-flex align-items-center form-control" v-if="loading" style="width: 130px; border: solid; color: green">
    <strong>{{ i18nText.uploadingText }}</strong>
    <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const props = defineProps({
  disabled: Boolean,
  loading: Boolean,
  isDragging: Boolean,

  // i18n
  i18nText: {
    type: Object,
    required: true
  }
})

const emits = defineEmits(['file-change']);

const fileInput = ref(null)
const fileNames = ref([])
const hoveredItem = ref(null)

function triggerInput() {
  fileInput.value?.click()
}

function onFileChange(event) {
  const files = Array.from(event.target.files)
  fileNames.value = files.map(file => file.name)
  emits('file-change', files)
}

function showData(item) {
  hoveredItem.value = item
}
function hideData() {
  hoveredItem.value = null
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
</style>