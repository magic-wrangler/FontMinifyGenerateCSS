import { HomeApi } from '@/data-source';
import { useSpinning } from '@/hooks/use-spinning';
import { message } from 'ant-design-vue';
import { emitter, EmitterEvents } from '@/mitt';
import { fontApi } from '@/api/modules/font';
import { throttle } from 'lodash-es';
import { ALL_CHARS } from '@/constant/basic';
import { downloadMultipleFiles } from '@/utils';

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

  const fontPreview = ref<string>('');

  const fontPreviewStyle = computed(() => {
    return {
      'font-family': fontNames.value.join(', '),
    };
  });

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

  const fontNames = ref<string[]>([]);

  watch(() => uploadFiles.value, (newVal) => {
    if (newVal) {
      fontNames.value = Array.from(newVal).map((item) => {
        const path = item.name.split('.');
        path[1] = path[1].toLowerCase();
        return path.join('.').replace('.ttf', '');
      });
    }
  })

  /**
   * 处理选中的字体按钮
   * @param type 字体按钮类型
   */
  const handleCheck = (type: FontButtonType) => {
    if (fontButtonType.value.includes(type)) {
      fontButtonType.value = fontButtonType.value.filter(
        (item) => item !== type
      );
      // 移除字符类型 从 fontText 中移除特定字符
      // 使用字符串方法而非正则表达式，避免特殊字符问题
      const charsToRemove = ALL_CHARS.split('');
      for (const char of charsToRemove) {
        fontText.value = fontText.value.split(char).join('');
      }
    } else {
      // 添加字符类型
      fontButtonType.value.push(type);
      // fontText 拼接字符 ALL_CHARS
      fontText.value += ALL_CHARS;
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
      const res = await fontApi.generateCss({
        fontNames: fontNames.value,
        text: fontText.value,
      });
      if (res.code === 200) {
        await getGeneratedCss();
        hideSpinning();
      }
    } catch (error) {
      hideSpinning();
    }
  };

  const getGeneratedCss = async () => {
    const res = await fontApi.getFiles({
      fileNames: fontNames.value,
    });
    if (res.code === 200) {
      const { files } = res.data!;
      const cssFile = files.filter((item) => item.type === 'css');
      cssFile.forEach((css) => insertCss(css.content, css.parentFolder));
    }
  };

  /**
   * 插入 css style 内容至 网页
   * */
  const insertCss = (cssContent: string, fontName: string) => {
    // 创建新的样式标签
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = cssContent;
    style.setAttribute('data-font-name', fontName);
    document.head.appendChild(style);
  };

  // 删除 css style 内容至 网页
  const removeCss = (fontName: string) => {
    const oldStyle = document.querySelector(
      `style[data-font-name="${fontName}"]`
    );
    if (oldStyle) {
      oldStyle.remove();
    }
  }

  const handleDelete = (fontName: string) => {
    const name = fontName.split('.')[0];
    removeCss(name);
  }

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
    await fontApi.uploadFonts({
      fonts: file ? file : (uploadFiles.value as unknown as FileList[]),
      text: fontText.value,
    });
  };

  /**
   * 下载字体压缩包
   */
  const handleDownloadFontZip = async () => {
    const res = await fontApi.getFiles({
      fileNames: fontNames.value,
    });
    if (res.code === 200) {
      const { files } = res.data!;
      await downloadMultipleFiles(files);
    }
  };

  onBeforeMount(async () => {
    await getHomeInfo();
    emitter.emit(EmitterEvents.DATA_LOADED, {
      isloading: true,
    });
  });

  return {
    fontPreview,
    spinning,
    homeInfo,
    uploadFiles,
    fontText,
    fontButtonType,
    isBasicCharacters,
    isPunctuation,
    fontPreviewStyle,
    handleCheck,
    handleGenerate,
    updateUploadFiles,
    handleFileChange,
    handleDownloadFontZip,
    handleDelete,
  };
};

