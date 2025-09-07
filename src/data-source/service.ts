import { useI18n } from 'vue-i18n'
import { Lang } from '@/constant/enums'

// 抽离公共逻辑
export async function getData<T>(dataMap: Record<Lang, T>): Promise<T> {
  const { locale } = useI18n()
  const refLocale = locale as unknown as Ref<Lang>
  let data = dataMap[Lang.CN]
  switch (refLocale.value) {
    case Lang.EN:
      data = dataMap[Lang.EN]
      break
  }
  return data
}
