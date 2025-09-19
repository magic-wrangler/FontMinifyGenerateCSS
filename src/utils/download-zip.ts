// 首先安装 JSZip: npm install jszip
// 首先安装 FileSaver: npm install file-saver

import JSZip from 'jszip';
// @ts-ignore
import { saveAs } from 'file-saver';

export async function downloadMultipleFiles(files: any, zipName = 'download.zip') {
  const zip = new JSZip();
  
  // 添加所有文件到zip
  files.forEach((file: any) => {
    if (file.contentEncoding === 'base64') {
      // 对于base64编码的文件，直接添加
      zip.file(file.name, file.content, { base64: true });
    } else if (file.contentEncoding === 'utf8') {
      // 对于文本文件，直接添加文本内容
      zip.file(file.name, file.content);
    }
  });
  
  // 生成zip文件并下载
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, zipName);
}

// 使用示例
// downloadMultipleFiles(filesArray, 'fonts.zip');