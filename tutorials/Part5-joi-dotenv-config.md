## 本章節會學到
- 了解與建立 dotenv 環境參數
- 了解 joi 功用與建立
- joi + dotenv 改寫 config.js 建立全域變數

## 什麼是 dotenv ?
[dotenv](https://www.npmjs.com/package/dotenv) 是將 `.env` 文件中的環境參數加載到 process.env。這個檔要建立在最外層資料夾，在其他文件中先引入 `require('dotenv').config()` 後只要再呼叫 `PROCESS.ENV.[變數名稱]` 就能將此環境參數撈出來了，通常還會搭配 joi 來做設定，此外這邊要注意的是 `.env` 檔是特有的隱藏檔並不會被同步上傳傳到 GitHub 上，這樣每次 clon 下來都要手動建立一個新的檔案很麻煩，所以我都會額外建立一個叫 `.example.env` 的副本，每次 clone 下來直接在終端機鍵入 `cp .example.env .env`， `cp` 是 Linux 複製檔案的指令(copy)，那行指令的意思是將複製一個 `.example.env` 檔案並且命名為 `.env`。

### 設定 dotenv 環境參數

##### 1.安裝 dotenv
  ```bash
  yarn add dotenv
  ```

##### 2.建立 `.env` 檔

- 首先新增一個 `.example.env` 的檔案

在這個檔案中初始化三個變數分別為 PORT(阜號)、 NODE_ENV(開發模式)、VERSION(版本)。

```js
/* .example.env 全域變數的設定檔範本 */
PORT=3000
NODE_ENV=development
VERSION=1.0.0
```

- 使用 `cp` 指令產生副本 `.env` 

`cp` 是 Linux 的其中一道指令，它具有複製的功能，cp 也就是英文 (copy) 的意思，下面指令的意思是將複製一個 `.example.env` 檔案並且命名為 `.env`。

```bash
cp .example.env .env
```

## 什麼是 joi ?
joi 就好比是一個驗證器，你可以自己規範 schema 來限制資料格式，有點像是正規表示法，這邊來舉個例子好了，利如 PORT 只允許輸入數字若輸入字串就會被阻擋 `PORT: Joi.number()` ，這樣有好處萬一有使用者不按照規範輸入數值他會在 middleware 拋出一個錯誤告訴你這邊有問題要你馬上修正。



### 使用 joi 來驗證環境參數

##### 1.安裝 joi

  ```bash
  yarn add joi
  ```

##### 2.修改 `config.js` 檔

  在此篇教學中我們有先建立此檔了當時很死的把變數寫在這裡面，所以這邊就搭配環境參數把剛設定的參數引入進來，其中在變數產生時我們利用 joi 來驗證該變數是否符合格式規範，首先要在最上宣告 `require('dotenv').config()` 這樣系統才會抓到 `.env` 設定檔。

   ```js
   /* config.js */
    import Joi from 'joi';

    // require and configure dotenv, will load vars in .env in PROCESS.ENV
    require('dotenv').config();

    // 建立每個變數 joi 驗證規則
    const envVarSchema = Joi.object().keys({
      NODE_ENV: Joi.string().default('development').allow(['development', 'production']), // 字串且預設值為development 並只允許三種參數
      PORT: Joi.number().default(8080), // 數字且預設值為 8080
      VERSION: Joi.string() // 字串
    }).unknown().required();

    // process.env 撈取 .env 內的變數做 joi 驗證
    const { error, value: envVars } = Joi.validate(process.env, envVarSchema);

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    const config = {
      version: envVars.VERSION, // 版本
      env: envVars.NODE_ENV,  // 開發模式
      port: envVars.PORT  // 阜號
    };

    export default config;  // 匯出共用
   ```

   joi 的 [GitHub](https://github.com/hapijs/joi/blob/v13.0.2/API.md) 官方文件中有很多關於變數的規範，有興趣可以看去看看。

## 測試
全部修改完畢後就可以啟動來測試囉！記得先 `yarn build` 再 `yarn start` 來執行程式。

