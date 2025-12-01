import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useFileNameStore = defineStore('fileName', () => {
    // 定義 finalFileNameMap，預設為一個 Map
    const finalFileNameMap = ref(new Map());

    // 方法：更新 Map 的值
    const updateFileNameMap = (key, value) => {
        finalFileNameMap.value.set(key, value);
    };

    // Map 轉換為普通對象
    const getFileNameMap = () => {
        return Object.fromEntries(finalFileNameMap.value);
    };

    // 方法：清空 Map
    const clearFileNameMap = () => {
        finalFileNameMap.value.clear();
    };

    return {
        finalFileNameMap,
        updateFileNameMap,
        getFileNameMap,
        clearFileNameMap,
    };
});