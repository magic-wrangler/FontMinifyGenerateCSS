import type { ResType } from '@/api/http';

interface UploadFontsReq {
  fonts: FileList | FileList[];
  text: string;
}

interface UploadFontsRes {
  fontDirs: string[];
}

interface GenerateCssReq {
  fontNames: string[];
  /** 文本内容 */
  text: string;
  /** 是否使用 base64 编码 默认值true */
  base64?: boolean;
  /** 是否使用本地字体  默认值true */
  local?: boolean;
  /** 字体名称 */
  fontFamily?: string;
}

interface GenerateCssRes {
  cssFiles: string;
}

interface GetCssReq {
  fontName: string;
}

interface GetCssRes {
  cssContent: string;
}

export interface IFontApi {
  /** 上传字体文件 */
  uploadFonts: (req: UploadFontsReq) => Promise<ResType<UploadFontsRes>>;
  /** 生成 css 文件 */
  generateCss: (req: GenerateCssReq) => Promise<ResType<GenerateCssRes>>;
  /** 获取 css 文件内容 */
  getCss: (req: GetCssReq) => Promise<ResType<GetCssRes>>;
}

