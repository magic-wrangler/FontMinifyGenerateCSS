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
  sessionId: string;
}

interface GetCssRes {
  cssContent: string;
}

interface GetFilesReq {
  sessionId?: string;
  fileNames: string[];
}

interface Files {
  content: string;
  name: string;
  type: string;
  parentFolder: string;
}

interface GetFilesRes {
  files: Files[];
}

export interface IFontApi {
  /** 上传字体文件 */
  uploadFonts: (req: UploadFontsReq) => Promise<ResType<UploadFontsRes>>;
  /** 生成 css 文件 */
  generateCss: (req: GenerateCssReq) => Promise<ResType<GenerateCssRes>>;
  /** 获取 css 文件内容 */
  getCss: () => Promise<ResType<GetCssRes>>;
  /** 获取指定文件内容 */
  getFiles: (req: GetFilesReq) => Promise<ResType<GetFilesRes>>;
}
