import { HelpApi } from '@/data-source';

export const useHelp = () => {
  // 帮助信息
  const helpData = ref<Help.RootObject>();

  // 获取帮助信息
  const getHelpData = async () => {
    const res = await HelpApi.getHelpData();
    helpData.value = res;
  };

  onBeforeMount(async () => {
    await getHelpData();
  });

  return {
    helpData,
  };
};
