## Express安裝與設定路由

### 這節將會學到
- 如何安裝 Express
- 使用 Express 建立路由
- 建置一個 MVC 中的 Module 與 Controller 環境


## Tree
```bash
┌── config
│   ├── config.js  // joi驗證與匯出全域變數
│   └── express.js  // express與其他middleware設定
├── server
│   ├── controllers  // 處理控制流程和回應
│   ├── helper  // 處理例外Error
│   ├── modules // 後端資料庫進行運作
│   └── routes  // 各路徑的設定點
│       └── index.route.js  // 主路由
│
└── index.js  // 程式進入點
    
```

## 教學

### 設定全域變數

1. 安裝 dotenv
  ```bash
  yarn add dotenv
  ```

2. 建立 `.env` 檔
    
    dotenv 是將.env文件中的全域變數加載到 process.env。這個檔要建立在最外層資料夾，在其他文件中只要呼叫 `PROCESS.ENV.[變數名稱]` 就能將此全域變數撈出來了，通常還會搭配 joi 來做設定。

  ```
      /* .env 全域變數的設定檔 */

      PORT=3000
      NODE_ENV=development
      VERSION=1.0.0

  ```

### 使用 joi 來驗證全域變數

1. 安裝 joi
  ```bash
  yarn add joi
  ```

2. 建立 `config.js` 檔

    在 `/src/config` 底下建立一個 `config.js` 裡面專門建立一個 config  物件變數並匯出

  ```js
  import Joi from 'joi';

  // require and configure dotenv, will load vars in .env in PROCESS.ENV
  require('dotenv').config();

  // 建立每個變數 joi 驗證規則
  const envVarSchema = Joi.object().keys({
    NODE_ENV: Joi.string().default('development').allow(['development', 'production']),
    PORT: Joi.number().default(8080),
    VERSION: Joi.string()
  }).unknown().required();

  const { error, value: envVars } = Joi.validate(process.env, envVarSchema);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  const config = {
    version: envVars.VERSION,
    env: envVars.NODE_ENV,
    port: envVars.PORT
  };

  export default config;

  ```
 
### 安裝 Express

```bash
yarn add express
```

建立：
- index.js
- express.js
- index.router,js
