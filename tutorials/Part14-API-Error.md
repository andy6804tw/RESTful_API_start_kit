---
layout: post
title: '[Node.js打造API] (實作)自定義API Error拋出錯誤訊息'
categories: '2018iT邦鐵人賽'
description: ''
keywords: api
---

## 本文你將會學到
- 了解 HTTP Status Code (狀態碼)
- 使用 Node 的 http-status 組件
- 自定義 API Error 拋出錯誤訊息

## 前言
[HTTP Status Code](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status) 又稱為狀態碼，相信各位一定不陌生，相信各位對 404 not found 有的別深的印象，而它代表找不到網頁或失去連結，狀態碼真的那麼重要嗎？他能夠做什麼？這篇文章就是要帶你了解所有常見的狀態碼，與他真正的使用的時機。

## 事前準備
今天要繼續實作的程式是延續 [[Node.js打造API] (實作)使用者登入與密碼驗證](https://andy6804tw.github.io/2018/01/09/user-login/) 的專案繼續實作，想跟著今天的實作可以先下載下面的整包程式，記得要先 `yarn install` 將整個依賴的軟體安裝回來。

程式碼：https://github.com/andy6804tw/RESTful_API_start_kit/releases/tag/V13.0.0


## 何謂 HTTP Status Code？
HTTP 狀態碼指的是從伺服器端回應(HTTP Response)的狀態，主要是給開發者看的狀態碼，而所有狀態碼的第一個數字代表了五種狀態之一，最基本常見會用到 200 成功、304 未修改、400 客戶端參數錯誤、401 登入失敗、403 權限不夠、404 找無此資源、500 伺服器錯誤。

- 1xx 資訊回應
- 2xx 成功回應
- 3xx 重定向訊息
- 4xx 用戶端錯誤回應
- 5xx 伺服器錯誤回應


<img src="http://faq.biznetgiocloud.com/images/1_4.png" width="650">

[圖片來源](http://faq.biznetgiocloud.com/index.php?action=artikel&cat=1&id=240&artlang=en)

## 如何在 Node.js 中加狀態碼？
其實很簡單直接在標頭加個 `status()` 的函示裡面寫上相對應的狀態碼即可，你可以簡單寫一個 GET 的 Request 到 Postman 做測試，可以發現紅色框框處即是我們剛所設定的狀態，若你沒指定狀態系統會自動幫你補上狀態像是 200 或 500，若要更詳細的錯誤碼就必須要自己定義加上去了。

#### 方法一 
第一種方式直接填上相對應數字，每個數字都有他固定的意義你可以到[這個](https://developer.mozilla.org/zh-TW/docs/Web/HTTP/Status)網頁去查詢狀態碼。

```js
app.get('/', (req, res) => {
  res.status(202).send(`歡迎光臨`);
});
```

<img src="/images/posts/it2018/img1070110-1.png">


#### 方法二 
第一種方法雖然簡單，但常常為了要找出相對應的狀態碼而去網路查詢它對應的敘述太麻煩了，所以這邊建議使用 Node.js 的 http-status 組件來管理狀態碼。

##### 1. 安裝 http-status
安裝 Node.js 的 http-status 組件

```bash
yarn add http-status
```

##### 2. 使用方法

```js
app.get('/', (req, res) => {
  res.status(httpStatus.BAD_GATEWAY).send(`進入 502 Bad Gateway`);
});
```

<img src="/images/posts/it2018/img1070110-2.png">

## 實作 User Login 拋出錯誤訊息
昨日的文章[[Node.js打造API] (實作)使用者登入與密碼驗證](https://andy6804tw.github.io/2018/01/09/user-login/)，最後的測試你有沒有發現密碼錯誤或是信箱為註冊時他的狀態碼是回傳 200 呢？你可以回去那篇文章看看是否真是這樣，是的沒錯！今天就是要在這兩個例子上實作 HTTP Status Code，並以 JSON 格式拋出錯誤例外訊息。

#### 1. 安裝 http-status
在你的專案中安裝 Node.js 的 http-status 組件。

```bash
yarn add http-status
```

#### 2. 建立 AppError.js
若你的[記憶力](https://andy6804tw.github.io/2017/12/26/express-mvc-tutorial/)夠好到話應該還記得一開始有先叫你建立一個空的名叫 helper 資料夾，當時候有說這個資料夾是了定義 API 拋出例外的地方，今天就來完成它吧！

首先在這個空資料夾新增一個名叫 `AppError.js` 的檔案，在這支檔案我們使用 Class 類別方法建立一個 `ExtendableError` 的類別去繼承 `Error` 在這類別中我們使用建構子多載方式去改寫建構子初始化的內容像是錯誤訊息(message)、HTTP狀態(status)，HTTP 狀態碼(code)，間單來說 `ExtendableError` 就是一個我們客製化 API Error 的板模，之後要新增錯誤例外就繼承它就好，板模建立好後就來做一個信箱未註冊的 API Error，建立一個類別名為 `LoginError1` 並繼承 `ExtendableError`，`ExtendableError`就是我們剛所定義好的 API Error板模，繼承後一樣自定義一個建構子，並在建構子內呼叫父建構子(super)來初始化 API Error `message` 為錯誤訊息填上 `信箱尚未註冊！`，`status` 為 HTTP Status Code 狀態碼，這邊使用 http-status 組件來定義 401 `httpStatus.NOT_FOUND`，最後 code 填上 401 這個錯誤代碼是提供給測試端的人若有問題會得到 401 代碼好做錯誤回報，401 的意思是登入失敗，密碼錯誤地按照相同步驟並命名 LoginError2。

```js
import httpStatus from 'http-status';

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic, code) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.status = status;
    this.isPublic = isPublic;
    this.code = code;
    this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}
/**
 * 信箱尚未註冊 Error
 * @extends ExtendableError
 */
class LoginError1 extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = '信箱尚未註冊！', status = httpStatus.NOT_FOUND, isPublic = true, code = 401) {
    super(message, status, isPublic, code);
    this.name = 'LoginError';
  }
}
/**
 * 密碼錯誤 Error.
 * @extends ExtendableError
 */
class LoginError2 extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor(message = '您輸入的密碼有誤！', status = httpStatus.NOT_FOUND, isPublic = true, code = 401) {
    super(message, status, isPublic, code);
    this.name = 'LoginError';
  }
}

export default {
  LoginError1,
  LoginError2
};
```

#### 3. 修改 user.module.js
首先記得在文件最上方引入 `import APPError from '../helper/AppError';` 好可以去呼叫錯誤例外，其中我們要修改兩個地方都是在 `selectUserLogin` 裡面，原先密碼錯誤跟信箱尚未註冊都是利用 `resolve()` 回傳訊息因此會得到 200 code 但我們現在已經寫好 API Error 了所以就可以使用 `reject()` 並將我們寫好的 Error 放進去，當遇到密碼錯誤或是信箱尚未註冊時就會由 Middleware 來拋出錯誤的 JSON 訊息了。

<img src="/images/posts/it2018/img1070110-3.png">

#### 4. 修改 user.controller.js
在 module 中 `resolve()` 的錯誤訊息會在 controller 中的 catch 被接收並經由 next() 傳送到 Middleware 中將錯誤訊息顯示出來。

```js
...略
/* User  POST 登入(Login) */
const userLogin = (req, res, next) => {
  // 取得帳密
  const insertValues = req.body;
  userModule.selectUserLogin(insertValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((error) => { next(error); }); // 失敗回傳錯誤訊息
};
...略
```

#### 5. 修改 express.js
在 express.js 中定義一個 API Error 的 Middleware，因為每個的錯誤訊息都會經由拋出例外並由 `next()` 傳入 Middleware 所以我們就必須在 express.js 中去擷取錯誤訊息並把它顯示出來，下面程式碼你會看到有新增兩個 Middleware 第一個 Middleware 為 joi 的錯誤擷取，應該還記得 joi 是什麼吧！他能夠在你 POST 資料前先檢查格式是否正確，若資料不符合家是也會跳出錯誤 Error 訊息。第二個 Middleware 是所有的錯誤最終都會進來的地方，他會將你的錯誤訊息用 JSON 格式顯示出來。

```js
import APPError from '../server/helper/AppError';
...略
// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
  let errorMessage;
  let errorCode;
  let errorStatus;
  // express validation error 所有傳入參數驗證錯誤
  if (err instanceof expressValidation.ValidationError) {
    if (err.errors[0].location === 'query' || err.errors[0].location === 'body') {
      errorMessage = err.errors[0].messages;
      errorCode = 400;
      errorStatus = httpStatus.BAD_REQUEST;
    }
    const error = new APPError.APIError(errorMessage, errorStatus, true, errorCode);
    return next(error);
  }
  return next(err);
});

// error handler, send stacktrace only during development 錯誤後最後才跑這邊
app.use((err, req, res, next) => {
  res.status(err.status).json({
    message: err.isPublic ? err.message : httpStatus[err.status],
    code: err.code ? err.code : httpStatus[err.status],
    stack: config.env === 'development' ? err.stack : {}
  });
  next();
});
...略
```

其實這一步驟沒有做也是可以執行，但你的錯誤訊息會被包在 HTML 標籤裡面，如下圖你可以跟最後登入的測試結果做比對就知道意思了。

<img src="/images/posts/it2018/img1070110-6.png">


## 登入測試
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/user/login` 並選擇 POST 請求方式，接下來是要放入修改的內容，`Body > raw > 選擇 JSON(application/json)`，將信箱與密碼用 JSON 格式送出，送出後觀察底下 Body 的回應訊息。


**帳號錯誤(未註冊)**

隨便輸入一筆資料庫無存在的信箱送出後，會由 API Error 所拋出的例外跑出 `信箱尚未註冊！` 的訊息以及提它相關資訊。

```json
{
	"user_mail":"abcd@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070110-4.png">

**登入失敗(密碼錯誤)**

輸入一筆有註冊的信箱但密碼故意輸入錯誤，會由 API Error 所拋出的例外跑出 `您密碼輸入有誤！` 的訊息以及提它相關資訊。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"abcde"
}
```

<img src="/images/posts/it2018/img1070110-5.png">


## 結語
今天實作的內容來做個結論，各位可以將今天實作解果跟昨天上一篇文的實作結果相比較，你可以發現 Body 回應的錯誤訊息更明確了，一眼就知道是發生什麼錯誤，這是有優點的對於開發階段來說程式碼的 Bug 錯誤是常有的，定義好自己的 API Error 能夠增加團隊的工作效率，也能夠明確的知道錯誤地方。
