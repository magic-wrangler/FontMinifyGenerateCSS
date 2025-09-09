# FontMinifyGenerateCSS

一个用于压缩字体文件和生成CSS代码的Web工具，旨在优化Web性能。

## 项目简介

FontMinifyGenerateCSS是一个基于Vue 3和TypeScript的Web应用，它允许用户上传字体文件，指定文本子集，选择压缩选项，并生成优化的字体文件和相应的CSS代码。通过减小字体文件大小和只保留必要的字形，可以显著提高网页加载速度和性能。

## 主要功能

- **字体文件上传**：支持多种字体格式（TTF、OTF、WOFF、WOFF2）的上传
- **文本子集化**：指定需要包含在字体中的特定字符
- **Unicode范围选择**：支持多种Unicode范围，包括基本拉丁字母、拉丁文补充、希腊语、中日韩统一表意文字和韩文音节
- **压缩选项**：提供多种压缩设置，平衡文件大小和字体质量
- **CSS代码生成**：自动生成包含@font-face规则的CSS代码
- **预览和下载**：查看压缩结果并下载优化后的字体文件和CSS代码

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **UI组件库**：Ant Design Vue
- **CSS工具**：UnoCSS
- **国际化**：Vue I18n
- **路由**：Vue Router

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 使用指南

1. **上传字体文件**：点击上传按钮或将字体文件拖放到指定区域
2. **指定文本子集**：在文本框中输入需要包含在子集字体中的特定文本或字符
3. **选择Unicode范围**：根据需要选择要包含的Unicode范围
4. **选择压缩选项**：设置压缩参数以平衡文件大小和字体质量
5. **生成和下载**：查看压缩结果，下载优化后的字体文件和CSS代码

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

[MIT License](LICENSE)
