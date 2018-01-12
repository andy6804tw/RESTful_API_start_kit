---
layout: post
title: '[Node.js打造API] (實作)使用JWT訪問API內容(1)'
categories: '2018iT邦鐵人賽'
description: 'JSON Web Token'
keywords: api
---

## 本文你將會學到
- 如何將 JWT 做解密驗證
- 使用 HTTP header 中的 Authorization 傳送 Bearer Token
- 實作一個API撈取並顯示自己所發佈過的文章

## 前言
做天已經完成了使用者登入並取得一組 API Token 的 JWT ，今天就來實作利用 JWT 的身份驗證來存取 API 內容，若對 JWT 能夠做什麼還是很模糊的沒關係，我這邊舉一個最常見的例子就是買飲料，相信各位有到連鎖飲料店購買飲料過例如像是星巴克，結帳後店員會給你一張收據上面有你的取單編號，等你取飲料的時候店員會要求查看你手上的單號確保你是顧客，上面各個例子可以完整的對應到我們的實作，JWT 就是你的取單編號，而店員做檢查的動作就像要存取某個 API 時要用 JWT 來做驗證道理一樣。

## 修改 article.module.js
在 `article.module.js` 中新增一個 `selectPersonalArticle` 的函式並使用 ES6 的 Promise 寫法，我們用 `jwt.verify()` 方法來做 JWT 驗證，在此方法中有三個參數，第一參數為你的 API Token 也就是 JWT 而變數 `token` 是由 `article.controller.js` 中傳過來的，第二個參數為 `Signature` 簽署密碼為字串型態記得要與當時登入時所簽署的密碼一樣否則會出問題，第三個參數為 function callback 也就是回傳結果，其中 err 為錯誤訊息、payload 為 JWT 解密後儲存的資料，還記得當時候是把用戶姓名、信箱跟用戶 id 一同寫進去 payload 中並使用 `Object.assign()`  加密產生 JWT。

```js
// article.module.js
import jwt from 'jsonwebtoken';
...略
/*  Article GET JWT取得個人文章  */
const selectPersonalArticle = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'my_secret_key', (err, payload) => {
      if (err) {
        reject(err); // 驗證失敗回傳錯誤
      } else {
        /* ...撈取資料庫該用戶的所有文章
           ...
           ...
           ...
        */
        resolve(payload); // 驗證成功回傳 payload data
      }
    });
  });
};
...略
```

## 修改 article.controller.js
在此檔案中新增一個 `articlePersonalGet` 函式並呼叫 `article.module` 中的 `selectPersonalArticle` 方法並傳遞參數 `req.token` 過去，其中 `req.token` 為 JWT(API Token) 是經由 Middleware 所傳遞過來的參數，若 JWT 驗證成功會進入 `then()` 並把結果顯示出來，若失敗則會跳出例外 Error 並交給 `catch()` 處理錯誤訊息，這邊為了方便展示所以就不用 API Error 寫法來處理了，想練習的讀者可以試著自己寫寫看。

```js
// article.controller.js
import articleModule from '../modules/article.module';
...略
/*  Article GET JWT取得個人文章  */
const articlePersonalGet = (req, res) => {
  articleModule.selectPersonalArticle(req.token).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.status(401).send(err); }); // 失敗回傳錯誤訊息
};
...略
```

## 修改 article.route.js
首先我們建立一個函式並命名 `ensureToken`，它是一個我們自定義的 Middleware，你也可以使用 Node.js 的 [Passport](https://www.npmjs.com/package/passport) 組件來完成身份驗證，不過這邊先以簡單方式實作出來就好，建立好後在函式裡面去撈取 Headers 的 authorization 參數，因為在訪問該 API 時會將 JWT 放入 Header 裡供後端來擷取，這個函式就是在做這件事，其中我們要將 Header 讀到的 Bearer Token 用字串切割(split)取得索引值1的值並放到 req(request) 中給 `article.controller.js` 檔案中的 `articlePersonalGet` 函式去讀取做驗證。

第二步驟建立一個 GET 請求方法，路徑為 `/personal`，這裡比較特別的是中間放上 `ensureToken` 做為 Middleware，若 Headers 中的 authorization 無帶有參數則馬上回傳你尚未登入的訊息，若成功取得並字串處理後進入 `next()`，也就是最後的 `articleCtrl.articlePersonalGet`。


```js
// article.route.js
import articleCtrl from '../controllers/article.controller';
...略
const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.status(403).send(Object.assign({ code: 403 }, { message: '您尚未登入！' }));
  }
};

router.get('/personal', ensureToken, articleCtrl.articlePersonalGet);
...略
```

## 測試
#### 1. 登入
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/user/login` 並選擇 POST 請求方式，接下來是要放一筆當時建立用戶的信箱與密碼至 `Body > raw > 選擇 JSON(application/json)` 並用物件 JSON 型態包裝起來，完成後送出。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070112-1.png">
<img src="/images/posts/it2018/img1070112-2.png">


#### 2. JWT驗證並訪問API內容
在 Postman 網址列輸入 `http://127.0.0.1:3000/api/article/personal` 後選擇 GET 並點選 Headers 並將 Key 放上 Authorization Value 放上 Bearer+JWT，如下，至於為啥需要加前綴這篇文章先不提。

```
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOjIsInVzZXJfbmFtZSI6IkFuZHkyIiwidXNlcl9tYWlsIjoiYW5keTJAZ21haWwuY29tIn0sImV4cCI6MTUxNTY1MDU2MCwiaWF0IjoxNTE1NjQ5NjYwfQ.Ui1d-cZ9kShsgY5_zTySaYZqiaVIpv9t4J0WPVg889k
```

<img src="/images/posts/it2018/img1070112-3.png">

**JWT驗證成功並取得Payload資料**

<img src="/images/posts/it2018/img1070112-4.png">

**JWT驗證失敗**

當你的 JWT 內容有誤驗證就會失敗，然而你就不能正常訪問該 API 內容。

<img src="/images/posts/it2018/img1070112-5.png">

**JWT過期**

JWT是有時效性的，還記得我們當時設定 expiresIn(exp) 為 15 分鐘，若過期他會顯示錯誤訊息，這些錯誤訊息是 JWT 自己產生的當然你也可以將錯誤資訊改寫並放入 API Error 這邊為了維持程式可讀性就不示範了。

<img src="/images/posts/it2018/img1070112-6.png">

**尚未登入**

若你的 Header 尚未填入 Bearer Token 的話則會要求你先登入並取得 API Token(JWT)。

<img src="/images/posts/it2018/img1070112-7.png">
