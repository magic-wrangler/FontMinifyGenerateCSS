declare namespace Home {
  export interface RootOject {
    title: string;
    uploadConfig: UploadConfig;
    textareaconfig: Textareaconfig;
    operationConfig: OperationConfig;
  }

  export interface UploadConfig {
    title: string;
    desc: string;
    btnTxt: string;
  }

  export interface Textareaconfig {
    placeholder: string;
  }

  export interface OperationConfig {
    basic: string;
    punctuation: string;
    custom: string;
  }
}
