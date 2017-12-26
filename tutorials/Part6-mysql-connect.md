
本文你將會學到
- joi + dotenv  建立資料庫全域變數
- 使用 mysql 建立 Connection Pool(連線池) 
- 測試 API 是否與資料庫連線成功

## 前言
前幾篇文章一步步的帶你從零開始建立環境，然而上篇文章中也完成了資料庫欄位的設計，此篇就教導你如何將所設定資料庫和 API 做連線吧！

## 建立資料庫全域變數
說到全域變數就離不開 joi + dotenv 和 `config.js` 這支檔案了，所有有關全域變數初始化設定都在 `config.js` 裡面，要養成習慣把常用到的變數與私有不被修改的值集中管理，這也是 MVC 架構的一個精髓，方便明確又好管理維護。

##### 1. 修改 `.env` 檔

這支環境檔前篇文章有提到過，現在要做資料庫連線所有會有下列這些變數， 連接阜號(MYSQL_PORT)、主機名稱 (MYSQL_HOST)、用戶名稱 (MYSQL_USER)、資料庫密碼(MYSQL_PASS)、資料庫名稱(MYSQL_DATABASE)，各位還記得以下資訊嗎？最後記得把以下程式碼一樣複製到 `.example.env` 日後做副本用。

- MYSQL_HOST
  - localhost等於127.0.0.1
- MYSQL_PORT
  - mysql預設值3306
- MYSQL_USER
  - 請填上當時在Sequel Pro所建立的用戶名稱預設通常為 root
- MYSQL_PASS
  - 請填上安裝mysql時所給的或自己設定密碼
- MYSQL_DATABASE
  - DATABASE資料庫名稱


```js
/* .env 與 .example.env */
PORT=3000
NODE_ENV=development
MYSQL_HOST=localhost 
MYSQL_PORT=3306  
MYSQL_USER=root 
MYSQL_PASS=[mysql密碼] 
MYSQL_DATABASE=Community 
VERSION=1.0.0
```

##### 2. 修改 config.js

在 `config.js` 中分別在變數 envVarSchema 中加入 MYSQL 環境參數的 joi。

```js
/* config.js */
import Joi from 'joi';

// require and configure dotenv, will load vars in .env in process.env
require('dotenv').config();

const envVarSchema = Joi.object().keys({
  NODE_ENV: Joi.string().default('development').allow(['development', 'production']), // 字串且預設值為development 並只允許兩種參數
  PORT: Joi.number().default(8080), // 數字且預設值為 8080
  MYSQL_PORT: Joi.number().default(3306), //數字且預設值為3306
  MYSQL_HOST: Joi.string().default('127.0.0.1'), //字串取預設值為127.0.0.1
  MYSQL_USER: Joi.string(), // 字串
  MYSQL_PASS: Joi.string(), // 字串
  MYSQL_NAME: Joi.string(), // 字串
  VERSION: Joi.string() // 字串
}).unknown().required();

// process.env 撈取 .env 內的變數做 joi 驗證
const { error, value: envVars } = Joi.validate(process.env, envVarSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  version: envVars.VERSION, // API版本
  env: envVars.NODE_ENV, // 開發模式(development、production)
  port: envVars.PORT, // API 阜號
  mysqlPort: envVars.MYSQL_PORT, // 連接阜號(MYSQL_PORT)
  mysqlHost: envVars.MYSQL_HOST, // 主機名稱 (MYSQL_HOST)
  mysqlUserName: envVars.MYSQL_USER, // 用戶名稱 (MYSQL_USER)
  mysqlPass: envVars.MYSQL_PASS, // 資料庫密碼(MYSQL_PASS)
  mysqlDatabase: envVars.MYSQL_DATABASE // 資料庫名稱(MYSQL_DATABASE)
};

export default config; // 匯出共用
```

## 撰寫連線測試路由

##### 1. 安裝mysql

這邊要來寫一個路由來測試連線了，首先來安裝 mysql 套件並安裝到 dependencies 裡。

```bash
yarn add mysql
```

##### 2. 修改`index.route.js`

打開之前所先建立的 `index.route.js` 裡面有一支之前寫的路徑 `http://localhost:3000/api`，然而在下面同時新增另一個路徑名為 `sqlTest` 在這個路徑內寫一個資料庫的測試連線，我們使用資料庫連線池(Pooling connections) 方法跟資料庫做連接，所謂的連線池的意思是當你要撈取資料就會請求一個連線直到結束存取 API 時就釋放掉連線到連線池中，供下一個使用者使用，若沒有可用連線，則會建立新的連線放到連線池中。

```js
import express from 'express';
import mysql from 'mysql';

import config from './../../config/config';

const router = express.Router();


/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`此路徑是: localhost:${config.port}/api`);
});

/* mysql連線測試 */
router.get('/sqlTest', (req, res) => {
  const connectionPool = mysql.createPool({ // 建立一個連線池
    connectionLimit: 10, // 限制池子連線人數
    host: config.mysqlHost, // 主機名稱
    user: config.mysqlUserName, // 用戶名稱 
    password: config.mysqlPass, // 資料庫密碼
    database: config.mysqlDatabase // 資料庫名稱
  });
  connectionPool.getConnection((err, connection) => { //建立一個連線若錯誤回傳err
    throw new Error('App is error from inner!');
    if (err) {
      res.send(err);
      console.log('連線失敗！');
    } else {
      res.send('連線成功！');
      console.log(connection);
    }
  });
});

export default router;

```

## 測試
在終端機先輸入 `yarn build` 再 `yarn start` 啟動程式，並在瀏覽器輸入 `localhost:3000/api/sqlTest` 進入連線測試的路由，若連線成功畫面會顯示連線成功字串，若失敗則會顯示錯誤資訊。

