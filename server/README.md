# 字体压缩和CSS生成服务器

这是一个Node.js服务器，用于处理字体文件并生成压缩后的CSS。

## 功能

- 上传字体文件
- 根据指定文本生成压缩后的字体文件和CSS
- 提供API接口获取生成的CSS内容
- 使用日期文件夹确保文件的组织性
- 基于会话ID的用户数据隔离，避免多用户上传同名文件冲突

## 安装

```bash
cd server
npm install
```

## 运行

```bash
npm start
```

服务器将在 http://localhost:3000 上运行。

## 文件夹结构

上传的文件和生成的CSS将按照以下结构组织：

```
uploads/
  ├── YYYY-MM-DD/                  # 按日期创建的文件夹
  │   ├── sessionId/               # 会话ID文件夹
  │   │   ├── fontName/           # 字体名称文件夹
  │   │   │   ├── font.ttf        # 上传的字体文件
  │   │   │   └── index.txt       # 包含要提取的文字
  │   │   └── ...
  │   └── ...
  └── ...

output/
  ├── YYYY-MM-DD/                  # 按日期创建的文件夹
  │   ├── sessionId/               # 会话ID文件夹
  │   │   ├── fontName.css        # 生成的CSS文件
  │   │   └── ...
  │   └── ...
  └── ...
```

## 会话ID机制

为了解决多用户同时上传同名字体文件可能导致的冲突问题，系统引入了基于会话ID的用户数据隔离机制：

- 每个用户会话会分配一个唯一的会话ID
- 会话ID作为文件路径和文件名的一部分，确保不同用户的文件不会相互覆盖
- 会话ID在首次请求时自动创建，并在后续请求中需要提供
- 会话数据会在7天后自动清理，以避免服务器存储空间过度占用

## API接口

### 上传字体文件

```
POST /api/upload-fonts
```

参数：
- `fonts`: 字体文件（可多个）
- `text`: 需要提取的文字
- `sessionId`: 会话ID（可选，首次请求不需要提供，服务器会自动生成并返回）

返回：
- `success`: 布尔值，表示上传是否成功
- `message`: 提示信息
- `sessionId`: 会话ID，用于后续请求

### 生成CSS

```
POST /api/generate-css
```

参数：
- `text`: 需要提取的文字
- `base64`: 是否使用base64编码（默认为true）
- `local`: 是否使用local字体（默认为true）
- `fontFamily`: 自定义字体名称（可选）
- `sessionId`: 会话ID（必需，使用上传接口返回的会话ID）
- `fontNames`: 要处理的字体名称列表（可选，数组格式，如果不提供则处理所有上传的字体）

注意：
1. 不再需要上传字体文件，系统会自动使用之前通过 `/api/upload-fonts` 上传的文件
2. 当用户在界面上删除某些字体后，应通过`fontNames`参数指定当前需要处理的字体，避免处理已删除的字体

### 获取CSS内容

```
GET /api/css/:fontName
```

参数：
- `fontName`: 字体名称
- `sessionId`: 会话ID（必需，使用上传接口返回的会话ID）

## 示例

```javascript
// 上传字体文件（首次请求，获取会话ID）
const formData = new FormData();
formData.append('fonts', fontFile);
formData.append('text', '需要提取的文字');

fetch('http://localhost:3000/api/upload-fonts', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log(data);
  // 保存会话ID，用于后续请求
  const sessionId = data.sessionId;
  
  // 使用会话ID生成CSS
  const cssFormData = new FormData();
  cssFormData.append('fonts', fontFile);
  cssFormData.append('text', '需要提取的文字');
  cssFormData.append('sessionId', sessionId);
  
  fetch('http://localhost:3000/api/generate-css', {
    method: 'POST',
    body: cssFormData
  })
  .then(response => response.json())
  .then(data => console.log(data));
  
  // 使用会话ID获取CSS内容
  fetch(`http://localhost:3000/api/css/fontName?sessionId=${sessionId}`)
  .then(response => response.text())
  .then(css => console.log(css));
});
```