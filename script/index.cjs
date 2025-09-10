// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fontmin = require('fontmin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const through = require('through2');

const fontDir = './script/fonts';

// 获取所有字体文件夹
const fontDirList = fs.readdirSync(fontDir).map((item) => `${fontDir}/${item}`);

fontDirList.forEach((item) => {
  // 忽略隐藏文件
  if (item.split('/').reverse()[0].charAt(0) === '.') {
    return;
  }
  const fileList = fs.readdirSync(item);
  const fontFile = fileList.filter((item) => /.*.ttf$/.test(item))[0];
  // 从文件夹下的index.txt中提取，目标字体
  const inputFile = fs.readFileSync(`${item}/index.txt`, 'utf8');

  const fontmin = new Fontmin()
    // 读取目标字体文件
    .src(`${item}/${fontFile}`)
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
        // 只处理.css后缀的文件
        if (/\.css$/.test(file.path)) {
          // 将.css后缀改为.less后缀
          file.path = file.path.replace(/\.css$/, '.less');
          // 获取css的内容
          const content = file.contents.toString();
          // 获取base64字符串
          const fontBase64 = content.match(/url\(data.*format\("truetype"\)/);
          // 生成less内容
          const result = content.replace(/src:(.|\n)*}/, `src: ${fontBase64};\n}`);
          file.contents = new Buffer(result);
          this.push(file);
        }
        cb();
      }),
    )
    // 输出less文件
    .dest('./assets/fonts');

  fontmin.run((err) => {
    if (err) {
      throw err;
    }
  });
});
