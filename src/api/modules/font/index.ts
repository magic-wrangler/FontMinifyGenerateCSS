import http from '@/api/http';
import * as T from './type';

export const fontApi: T.IFontApi = {
  uploadFonts(req) {
    const formData = new FormData();
    formData.append('text', req.text);
    // 添加文件参数（可以多次append添加多个文件）
    for (const file of req.fonts) {
      // @ts-ignore
      formData.append('fonts', file);
    }
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }
    return http.upload('/upload-fonts', formData);
  },
  generateCss(req) {
    // const formData = new FormData();
    // formData.append('text', req.text);
    // // 添加文件参数（可以多次append添加多个文件）
    // for (const file of req.fonts) {
    //   // @ts-ignore
    //   formData.append('fonts', file);
    // }
    // const sessionId = localStorage.getItem('sessionId');
    // if (sessionId) {
    //   formData.append('sessionId', sessionId);
    // }
    return http.post(
      '/generate-css',
      Object.assign(req, {
        sessionId: localStorage.getItem('sessionId') || undefined,
      })
    );
  },
  getCss() {
    return http.get(`/session/${localStorage.getItem('sessionId')}`);
  },
  getFiles(req) {
    return http.post(
      '/get-files',
      Object.assign(req, {
        sessionId: localStorage.getItem('sessionId') || undefined,
      })
    );
  },
};
