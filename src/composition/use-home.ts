import { HomeApi } from '@/data-source';

export const useHome = () => {
  // 首页信息
  const homeInfo = ref();

  // 获取首页信息
  const getHomeInfo = async () => {
    const res = await HomeApi.getHomeData();
    homeInfo.value = res;
  };

  onBeforeMount(async () => {
    await getHomeInfo();
  });

  return {
    homeInfo,
  };
};

