# 基于会话的临时ID方案设计

## 1. 方案概述

### 1.1 背景

当前系统在多用户同时上传相同字体文件时存在冲突问题。由于移除了哈希值命名机制，当不同用户上传同名字体文件时，会导致文件覆盖、CSS内容混淆等问题。为解决此问题，我们提出基于会话的临时ID方案，为每个用户会话分配唯一标识符，实现用户数据隔离。

### 1.2 方案目标

- 解决多用户上传同名字体文件的冲突问题
- 保持文件组织结构的清晰性
- 最小化对现有代码的修改
- 确保系统稳定性和可扩展性
- 提供合理的临时文件清理机制

## 2. 实现步骤

### 2.1 会话ID的生成与存储

#### 2.1.1 会话ID生成

会话ID将采用以下方式生成：

```javascript
// 生成唯一的会话ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}
```

这种方式结合了时间戳和随机字符串，确保ID的唯一性。

#### 2.1.2 会话ID存储

会话ID将通过以下方式存储：

1. **前端存储**：使用localStorage或sessionStorage存储会话ID
   ```javascript
   // 在前端存储会话ID
   localStorage.setItem('fontSessionId', sessionId);
   ```

2. **API请求传递**：在每次API请求中传递会话ID
   ```javascript
   // 在API请求中包含会话ID
   const formData = new FormData();
   formData.append('sessionId', localStorage.getItem('fontSessionId'));
   ```

### 2.2 文件路径和命名修改

#### 2.2.1 文件夹结构修改

修改后的文件夹结构将包含会话ID：

```
/uploads
  /YYYY-MM-DD
    /sessionId_1
      /fontName1
        fontName1.ttf
        fontName1.css
      /fontName2
        fontName2.ttf
        fontName2.css
    /sessionId_2
      /fontName1
        fontName1.ttf
        fontName1.css
```

#### 2.2.2 文件路径生成逻辑

```javascript
// 生成带会话ID的文件路径
function generateFilePath(dateFolder, sessionId, fontName) {
  return path.join(uploadsDir, dateFolder, sessionId, fontName);
}
```

### 2.3 服务端实现修改

#### 2.3.1 上传字体API端点修改

```javascript
// 上传字体API端点
app.post('/api/upload', upload.array('fonts'), (req, res) => {
  try {
    // 获取会话ID，如果不存在则创建新的
    const sessionId = req.body.sessionId || generateSessionId();
    
    // 创建日期文件夹
    const dateFolder = createDateFolder();
    
    // 创建会话文件夹
    const sessionFolder = path.join(uploadsDir, dateFolder, sessionId);
    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
    }
    
    // 处理上传的文件...
    // 使用会话ID创建文件夹和移动文件
    
    // 返回结果，包含会话ID
    res.json({
      success: true,
      sessionId: sessionId,
      // 其他返回信息...
    });
  } catch (error) {
    // 错误处理...
  }
});
```

#### 2.3.2 生成CSS的API端点修改

```javascript
// 生成CSS的API端点
app.post('/api/generate-css', (req, res) => {
  try {
    // 获取会话ID
    const sessionId = req.body.sessionId;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: '缺少会话ID' });
    }
    
    // 创建日期文件夹
    const dateFolder = createDateFolder();
    
    // 使用会话ID构建文件路径
    const sessionFolder = path.join(uploadsDir, dateFolder, sessionId);
    
    // 处理字体文件，生成CSS...
    
    // 返回结果
    res.json({
      success: true,
      // 其他返回信息...
    });
  } catch (error) {
    // 错误处理...
  }
});
```

#### 2.3.3 获取CSS内容的API端点修改

```javascript
// 获取CSS内容的API端点
app.get('/api/css/:fontName', (req, res) => {
  try {
    // 获取会话ID
    const sessionId = req.query.sessionId;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: '缺少会话ID' });
    }
    
    const fontName = req.params.fontName;
    
    // 查找最新的日期文件夹
    const dateFolders = fs.readdirSync(uploadsDir)
      .filter(folder => /^\d{4}-\d{2}-\d{2}$/.test(folder))
      .sort((a, b) => b.localeCompare(a));
    
    if (dateFolders.length === 0) {
      return res.status(404).json({ success: false, message: '未找到字体文件' });
    }
    
    // 在最新的日期文件夹中查找会话文件夹
    const latestDateFolder = dateFolders[0];
    const sessionFolder = path.join(uploadsDir, latestDateFolder, sessionId);
    
    if (!fs.existsSync(sessionFolder)) {
      return res.status(404).json({ success: false, message: '未找到会话数据' });
    }
    
    // 查找字体CSS文件
    const cssFilePath = path.join(sessionFolder, fontName, `${fontName}.css`);
    
    if (!fs.existsSync(cssFilePath)) {
      return res.status(404).json({ success: false, message: '未找到CSS文件' });
    }
    
    // 读取CSS内容并返回
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    
    // 根据请求头返回不同格式
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      res.json({ success: true, css: cssContent });
    } else {
      res.type('text/css').send(cssContent);
    }
  } catch (error) {
    // 错误处理...
  }
});
```

### 2.4 fontProcessor.js文件修改

需要修改字体处理器，使其支持会话ID：

```javascript
// 处理字体文件并生成CSS
function processFont(fontPath, outputDir, fontName, options = {}) {
  // 确保输出目录存在
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // 处理字体文件...
  
  // 生成CSS文件
  const cssFilePath = path.join(outputDir, `${fontName}.css`);
  fs.writeFileSync(cssFilePath, cssContent);
  
  return {
    cssFilePath,
    // 其他返回信息...
  };
}
```

### 2.5 前端适配

#### 2.5.1 会话ID管理

```typescript
// 在use-home.ts中添加会话ID管理
import { ref, onMounted } from 'vue';
import { STORAGE_KEY } from '../constant/storage-key';

export function useSessionId() {
  const sessionId = ref('');
  
  onMounted(() => {
    // 检查是否已有会话ID
    let storedSessionId = localStorage.getItem(STORAGE_KEY.FONT_SESSION_ID);
    
    // 如果没有，则生成新的会话ID
    if (!storedSessionId) {
      storedSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem(STORAGE_KEY.FONT_SESSION_ID, storedSessionId);
    }
    
    sessionId.value = storedSessionId;
  });
  
  return {
    sessionId
  };
}
```

#### 2.5.2 API请求修改

```typescript
// 修改上传文件函数
const uploadFonts = async (files: File[]) => {
  const formData = new FormData();
  
  // 添加会话ID
  formData.append('sessionId', sessionId.value);
  
  // 添加文件
  files.forEach(file => {
    formData.append('fonts', file);
  });
  
  try {
    const response = await axios.post('/api/upload', formData);
    
    // 如果服务器返回新的会话ID，则更新本地存储
    if (response.data.sessionId) {
      sessionId.value = response.data.sessionId;
      localStorage.setItem(STORAGE_KEY.FONT_SESSION_ID, response.data.sessionId);
    }
    
    return response.data;
  } catch (error) {
    // 错误处理...
  }
};

// 修改生成CSS函数
const generateCSS = async (options: GenerateCSSOptions) => {
  try {
    const response = await axios.post('/api/generate-css', {
      ...options,
      sessionId: sessionId.value
    });
    
    return response.data;
  } catch (error) {
    // 错误处理...
  }
};

// 修改获取CSS内容函数
const getCSSContent = async (fontName: string) => {
  try {
    const response = await axios.get(`/api/css/${fontName}?sessionId=${sessionId.value}`);
    
    return response.data;
  } catch (error) {
    // 错误处理...
  }
};
```

## 3. 优势与注意事项

### 3.1 方案优势

1. **完全隔离用户数据**：每个会话的文件存储在独立的文件夹中，避免冲突
2. **实现简单**：只需在现有路径中添加会话ID层级，修改较小
3. **向后兼容**：不影响现有的日期文件夹组织结构
4. **无需用户登录**：基于会话的临时ID不要求用户注册或登录
5. **可扩展性好**：未来可以轻松扩展为基于用户账户的永久存储

### 3.2 注意事项

1. **会话过期处理**：需要考虑会话ID的有效期和过期处理
2. **存储空间管理**：同一字体可能被多个会话重复存储，需要定期清理
3. **前端刷新处理**：确保页面刷新后会话ID不丢失
4. **错误处理**：完善会话ID缺失或无效时的错误处理

### 3.3 文件清理机制

为避免存储空间浪费，建议实现以下清理机制：

1. **基于时间的清理**：定期清理超过一定时间（如7天）未访问的会话文件夹

```javascript
// 清理过期会话文件夹的定时任务
function cleanupExpiredSessions() {
  const dateFolders = fs.readdirSync(uploadsDir)
    .filter(folder => /^\d{4}-\d{2}-\d{2}$/.test(folder));
  
  const now = Date.now();
  const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7天的毫秒数
  
  dateFolders.forEach(dateFolder => {
    const dateFolderPath = path.join(uploadsDir, dateFolder);
    
    // 获取日期文件夹中的所有会话文件夹
    const sessionFolders = fs.readdirSync(dateFolderPath)
      .filter(folder => folder.startsWith('session_'));
    
    sessionFolders.forEach(sessionFolder => {
      const sessionFolderPath = path.join(dateFolderPath, sessionFolder);
      const stats = fs.statSync(sessionFolderPath);
      
      // 如果会话文件夹超过7天未修改，则删除
      if (now - stats.mtimeMs > expirationTime) {
        fs.rmdirSync(sessionFolderPath, { recursive: true });
        console.log(`已清理过期会话文件夹: ${sessionFolderPath}`);
      }
    });
  });
}

// 每天执行一次清理任务
setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);
```

2. **基于存储空间的清理**：当存储空间达到一定阈值时，优先清理最旧的会话文件夹

## 4. 总结

基于会话的临时ID方案通过为每个用户会话分配唯一标识符，并将其作为文件路径和文件名的一部分，实现了用户数据的隔离，有效解决了多用户上传同名字体文件的冲突问题。该方案实现简单，对现有代码的修改较小，同时保持了良好的可扩展性和向后兼容性。

通过合理的文件清理机制，可以避免存储空间的浪费，确保系统的长期稳定运行。该方案不要求用户注册或登录，适用于当前系统的使用场景，同时为未来可能的用户账户系统提供了良好的过渡。