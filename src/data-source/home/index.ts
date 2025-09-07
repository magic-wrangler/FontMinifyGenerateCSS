import EN from './json/en.json'
import CN from './json/cn.json'
import { Lang } from '@/constant/enums'
import { getData } from '@/data-source/service'

export const getHomeData = async () => {
  const dataMap = {
    [Lang.EN]: EN,
    [Lang.CN]: CN,
  }

  return await getData(dataMap)
}
