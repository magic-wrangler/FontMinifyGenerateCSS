// ESM版本的字体处理脚本
import Fontmin from 'fontmin';
import fs from 'fs';
import through from 'through2';
import { fileURLToPath } from 'url';
import path from 'path';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontDir = path.join(__dirname, 'fonts');
console.log('%c🤪 ~ file: index.mjs:12 [] -> fontDir : ', 'color: #310e2', fontDir);

// 获取所有字体文件夹
const fontDirList = fs.readdirSync(fontDir).map((item) => path.join(fontDir, item));
console.log('%c🤪 ~ file: index.mjs:15 [] -> fontDirList : ', 'color: #112324', fontDirList);

fontDirList.forEach((item) => {
  // 忽略隐藏文件
  if (path.basename(item).charAt(0) === '.') {
    return;
  }
  const fileList = fs.readdirSync(item);
  const fontFile = fileList.filter((item) => /.*.ttf$/.test(item))[0];
  // 从文件夹下的index.txt中提取，目标字体
  const inputFile = fs.readFileSync(path.join(item, 'index.txt'), 'utf8');
  console.log('%c🤪 ~ file: index.mjs:26 [] -> inputFile : ', 'color: #96a8d7', inputFile);

  const fontmin = new Fontmin()
    // 读取目标字体文件
    .src(path.join(item, fontFile))
    // .use(Fontmin.otf2ttf())
    .use(
      Fontmin.glyph({
        text: inputFile,
        hint: false,
      }),
    )
    // 将裁剪后的字体包转为css文件
    .use(
      Fontmin.css({
        base64: true, // inject base64 data:application/x-font-ttf; (gzip font with css).
        fontFamily: fontFile.split('.')[0], // custom fontFamily, default to filename or get from analysed ttf file
        local: true,
      }),
    )
    // 进一步处理css文件，生成目标less文件
    .use(
      through.obj(function (file, encode, cb) {
        console.log('%c🤪 ~ file: index.mjs:49 [] -> file : ', 'color: #d2c8e1', file);
        // 只处理.css后缀的文件
        if (/\.css$/.test(file.path)) {
          // 将.css后缀改为.less后缀
          file.path = file.path.replace(/\.css$/, '.less');
          // 获取css的内容
          const content = file.contents.toString();
          // 获取base64字符串
          const fontBase64 = content.match(/url\(data.*format\("truetype"\)/);
          // 生成less内容
          const result = content.replace(/src:([\s\S]*?)}/, `src: ${fontBase64};\n}`);
          file.contents = Buffer.from(result);
          this.push(file);
        }
        cb();
      }),
    )
    // 输出less文件
    .dest('./src/assets/fonts');

  fontmin.run((err) => {
    if (err) {
      throw err;
    }
  });
});