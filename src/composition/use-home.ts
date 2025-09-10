import { HomeApi } from '@/data-source';
import { useSpinning } from '@/hooks/use-spinning';

export enum FontButtonType {
  BasicCharacters = 'BasicCharacters',
  Punctuation = 'Punctuation',
}

export enum UnicodeRange {
  BasicLatin = 'U+0000-007F',
  LatinSupplement = 'U+0080-00FF',
  Greek = 'U+0370-03FF',
  CJK = 'U+4E00-9FFF',
  Korean = 'U+AC00-D7AF',
}

export const useHome = () => {
  const { spinning, showSpinning, hideSpinning } = useSpinning();

  // 首页信息
  const homeInfo = ref();

  // 获取首页信息
  const getHomeInfo = async () => {
    const res = await HomeApi.getHomeData();
    homeInfo.value = res;
  };

  const uploadFiles = ref<FileList | null>(null);

  const fontText = ref<string>('');

  const fontButtonType = ref<FontButtonType[]>([]);

  const isBasicCharacters = computed(() => {
    return fontButtonType.value.includes(FontButtonType.BasicCharacters);
  });

  const isPunctuation = computed(() => {
    return fontButtonType.value.includes(FontButtonType.Punctuation);
  });

  const handleCheck = (type: FontButtonType) => {
    if (fontButtonType.value.includes(type)) {
      fontButtonType.value = fontButtonType.value.filter(
        (item) => item !== type
      );
    } else {
      fontButtonType.value.push(type);
    }
  };

  const unicodeRange = ref<UnicodeRange[]>([]);

  const isBasicLatin = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.BasicLatin);
  });

  const isLatinSupplement = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.LatinSupplement);
  });

  const isGreek = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.Greek);
  });

  const isCJK = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.CJK);
  });

  const isKorean = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.Korean);
  });

  const handleCheckUnicodeRange = (type: UnicodeRange) => {
    if (unicodeRange.value.includes(type)) {
      unicodeRange.value = unicodeRange.value.filter((item) => item !== type);
    } else {
      unicodeRange.value.push(type);
    }
  };

  const handleGenerate = () => {
    showSpinning();
    console.log();
    setTimeout(() => {
      // hideSpinning();
    }, 2000);
  };

  onBeforeMount(async () => {
    await getHomeInfo();
  });

  return {
    spinning,
    homeInfo,
    uploadFiles,
    fontText,
    fontButtonType,
    isBasicCharacters,
    isPunctuation,
    unicodeRange,
    isBasicLatin,
    isLatinSupplement,
    isGreek,
    isCJK,
    isKorean,
    handleCheckUnicodeRange,
    handleCheck,
    handleGenerate,
  };
};

