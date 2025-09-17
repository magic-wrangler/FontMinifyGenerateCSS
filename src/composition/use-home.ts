import { HomeApi } from '@/data-source';
import { useSpinning } from '@/hooks/use-spinning';
import { message } from 'ant-design-vue';
import { emitter, EmitterEvents } from '@/mitt';
import { fontApi } from '@/api/modules/font';
import { throttle } from 'lodash-es';

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

  // 上传的字体文件
  const uploadFiles = ref<FileList | null>(null);

  /**
   * 上传的字体文件的文本内容
   */
  const fontText = ref<string>('');

  /**
   * 选中的字体按钮
   */
  const fontButtonType = ref<FontButtonType[]>([]);

  /**
   * 基本字符
   */
  const isBasicCharacters = computed(() => {
    return fontButtonType.value.includes(FontButtonType.BasicCharacters);
  });

  /**
   * 标点符号
   */
  const isPunctuation = computed(() => {
    return fontButtonType.value.includes(FontButtonType.Punctuation);
  });

  /**
   * 处理选中的字体按钮
   * @param type 字体按钮类型
   */
  const handleCheck = (type: FontButtonType) => {
    if (fontButtonType.value.includes(type)) {
      fontButtonType.value = fontButtonType.value.filter(
        (item) => item !== type
      );
    } else {
      fontButtonType.value.push(type);
    }
  };

  /**
   * 选中的字体范围
   */
  const unicodeRange = ref<UnicodeRange[]>([]);

  const isBasicLatin = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.BasicLatin);
  });

  /**
   * 基本拉丁字母
   */
  const isLatinSupplement = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.LatinSupplement);
  });

  /**
   * 希腊字母
   */
  const isGreek = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.Greek);
  });

  /**
   * 中文字符
   */
  const isCJK = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.CJK);
  });

  /**
   * 韩文
   */
  const isKorean = computed(() => {
    return unicodeRange.value.includes(UnicodeRange.Korean);
  });

  /**
   * 处理选中的字体按钮
   * @param type 字体按钮类型
   */
  const handleCheckUnicodeRange = (type: UnicodeRange) => {
    if (unicodeRange.value.includes(type)) {
      unicodeRange.value = unicodeRange.value.filter((item) => item !== type);
    } else {
      unicodeRange.value.push(type);
    }
  };

  /**
   * 生成压缩字体css
   */
  const handleGenerate = async () => {
    if (!uploadFiles.value) {
      message.error('请上传字体文件');
      return;
    }
    try {
      showSpinning();
      // 上传的字体文件的名称 替换后缀 .ttf
      const fontNames = uploadFiles.value
        ? Array.from(uploadFiles.value).map((item) =>
            item.name.replace('.ttf', '')
          )
        : [];
      const res = await fontApi.generateCss({
        fontNames,
        text: fontText.value,
      });
      if (res.code === 200) {
        hideSpinning();
      }
    } catch (error) {
      hideSpinning();
    }
  };

  const throttleUpdateUploadFiles = throttle(() => updateUploadFiles(), 1000);

  watch(
    () => fontText.value,
    () => {
      if (!!uploadFiles.value?.length) {
        console.log('执行上传');
        throttleUpdateUploadFiles();
      }
    }
  );

  /**
   * 选择文件上传
   * @param file 上传的字体文件
   */
  const handleFileChange = (file: FileList) => {
    updateUploadFiles(file);
  };
  /**
   * 处理上传的字体文件
   * @param file 上传的字体文件
   */
  const updateUploadFiles = async (file?: FileList) => {
    console.log(
      '%c🤪 ~ file: use-home.ts:155 [] -> uploadFiles.value : ',
      'color: #bae48e',
      uploadFiles.value
    );
    const res = await fontApi.uploadFonts({
      fonts: file ? file : (uploadFiles.value as unknown as FileList[]),
      text: fontText.value,
    });
    console.log(
      '%c🤪 ~ file: use-home.ts:135 [] -> res : ',
      'color: #ed71ce',
      res
    );
  };

  onBeforeMount(async () => {
    await getHomeInfo();
    emitter.emit(EmitterEvents.DATA_LOADED, {
      isloading: true,
    });
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
    updateUploadFiles,
    handleFileChange,
  };
};

