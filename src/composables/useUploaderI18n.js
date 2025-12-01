import { useI18n } from 'vue-i18n'
import {computed} from "vue";

export function useUploaderI18n() {
    const { t } = useI18n()

    const i18nText = computed(() => ({
        chooseFileText: t('chooseFile'),
        alreadySelectedText: t('alreadySelected'),
        quantifiers: t('quantifiers'),
        quantifier: t('quantifier'),
        noFileSelectedText: t('noFileSelected'),
        uploadingText: t('uploading'),
        dropDownSelectText: t('DropDownSelect'),
        resetButtonText: t('ResetButton')
    }))

    return { i18nText }
}