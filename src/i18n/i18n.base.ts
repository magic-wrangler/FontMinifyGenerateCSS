import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
})

export const loadLocaleMessages = async (lang: Record<string, any>, initLang?: string) => {
  // 设置语言
  Object.keys(lang).forEach((key) => {
    i18n.global.setLocaleMessage(key, lang[key])
  })

  // 初始化语言
  if (initLang) {
    i18n.global.locale.value = initLang
  }

  // 如果没有value，默认取key
  const originI18n = i18n.global.t
  i18n.global.t = (key: string) => originI18n(key) || key
}
