import { loadLocaleMessages, i18n } from './i18n.base'
import { Lang } from '@/constant/enums'
// import { StorageKey } from '@/constant/storage-key'
import cn from './cn/main.json'
import en from './en/main.json'

// 获取系统语言
// const getSystemLang = (): Lang => {
//   try {
//     // 优先从 localStorage 读取用户设置
//     const savedLang = localStorage.getItem(StorageKey.LANG)
//     if (savedLang && Object.values(Lang).includes(savedLang as Lang)) {
//       return savedLang as Lang
//     }

//     // 全面检测中文环境
//     const browserLang = navigator.language.toLowerCase()
//     return browserLang.startsWith('zh') ? Lang.CN : Lang.EN
//   } catch (e) {
//     console.error('语言检测失败，使用默认中文', e)
//     return Lang.CN
//   }
// }

// 初始化语言并设置到i18n
// const initLang = getSystemLang()
const initLang = Lang.EN

loadLocaleMessages(
  {
    [Lang.CN]: cn,
    [Lang.EN]: en,
  },
  initLang,
)

export default i18n
