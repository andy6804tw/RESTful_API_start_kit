---
layout: post
title: '[Node.js打造API] (實作)用JWT取代傳統Session來驗證使用者身份'
categories: '2018iT邦鐵人賽'
description: 'JSON Web Token'
keywords: api
---

## 本文你將會學到
- 了解 JWT 運作原理 
- 實作使用者登入並取得一組 API Token

## 前言
為什麼要有 API Token 呢？各位可以想想若今天我要存取特別資料例如交易紀錄或是發文紀錄，這些資料都有獨特性也就是這些資料只有你能做存取與修改，所以在訪問某些重要的 API 前就必須要有一個 Token 來驗證你是否有權限來訪問裡面的資料，那我們該怎去實作呢？早期作法就是使用 Session 並且生成一個 Session 的 Token 我們稱 SessionID，所謂 SessionID 就是一個既不會重複，又不容易被找到規律以免被仿造的字符串，你可以自己隨機產生一組字串，可能用當下時間戳記、年、月、日、時、分、秒來當種子搭配英文26個字母外加標點符號經亂數搗亂後所產生的一組字串可能長度30、20之類的，每次訪問某特別 API 前就由 SessionID 來做 Token 驗證，但這不是今天的重點！今天要用一個比較新的方法而且更方便更快速的來產生我們要的 API Token 就是 JWT ！

## 何謂 JWT
JWT 是 JSON Web Token 的縮寫，通常用來解決身份認證的問題，JWT 是一個很長的 base64 字串在這字串中分為三個部分別用點號來分隔，第一個部分為 `Header` ，裡面分別儲存型態和加密方法，通常系統是預設 `HS256` 雜湊演算法來加密，官方也提供許多演算法加密也可以手動更改加密的演算法，第二部分為 payload，它和 Session 一樣，可以把一些自定義的數據存儲在 `Payload` 裡例如像是用戶資料，第三個部分為 `Signature`，做為檢查碼是為了預防前兩部分被中間人偽照修改或利用的機制。

- Header(標頭): 用來指定 hash algorithm(預設為 HMAC SHA256)
- Payload(內容): 可以放一些自己要傳遞的資料
- Signature(簽名): 為簽名檢查碼用，會有一個 serect string 來做一個字串簽署

把上面三個用「.」接起來就是一個完整的 JWT 了！更多詳細內容可以參考[這篇](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/)文章。

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJBbmR5MTAiLCJ1c2VyX21haWwiOiJhbmR5QGdtYWlsLmNvbSIsInVzZXJfcGFzc3dvcmQiOiJwYXNzd29yZDEwIiwiaWF0IjoxNTE1MTQwNDg0fQ.P41UlFdYNIho2EA8T5k9iNK0EMC-Wn06RKk_0FFNjLo
```

<img src="/images/posts/it2018/img1070111-1.png">

流程： 使用者登入 -> 產生 API Token -> 進行 API 路徑存取時先 JWT 驗證 -> 驗證成功才允許訪問該 API


## 安裝 jsonwebtoken
安裝 Node.js 的 jsonwebtoken 組件。

```bash
yarn add jsonwebtoken   
``` 

## 修改 user.module.js
開啟 `user.module.js` 並修改 `selectUserLogin` 函式中登入成功的地方，首先建立一個 payload 內容為你要傳遞的資料，這邊放入使用者的資訊包含 id、姓名、信箱，密碼這邊就不用存了一方面也是安全，建立好 payload 後就可以利用 jsonwebtoken 組件 來產生一個 Token 囉！我們使用 `jwt.sign()` 來取得 Token ，該方法有兩個參數第一部份是 Payload + 狀態資料，所謂的狀態資料有 expiresIn、notBefore、audience、subject、issuer，其中我們有使用 expiresIn(exp) 這是設定 Token 的時效性，格式為時間戳記這邊範例就以15分鐘為例，第二個參數為 Signature 是個字串型態的簽署金鑰，這個金鑰是保密的也只存放在後端不能前端用戶知道，否則會被不法人士利用來修改內容，此秘密金鑰在最後的 API 驗證才會使用到。

最後取得了 Token 就回傳結果，這邊使用 ES6 的物件生成寫法 `Object.assign()` 裡面用大括號包起來內容回傳 HTTP 狀態碼、登入訊息、和一組 API Token。

<img src="/images/posts/it2018/img1070111-2.png">

```js
/** user.module.js
 selectUserLogin 程式片段 **/
...略
// 產生 JWT
const payload = {
  user_id: result[0].user_id,
  user_name: result[0].user_name,
  user_mail: result[0].user_mail
};
// 取得 API Token
const token = jwt.sign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 15) }, 'my_secret_key');
resolve(Object.assign({ code: 200 }, { message: '登入成功', token })); // 登入成功
...略
```

## 登入測試
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/user/login` 並選擇 POST 請求方式，接下來是要放入修改的內容，`Body > raw > 選擇 JSON(application/json)`，將信箱與密碼用 JSON 格式送出。

**登入成功**

輸入一筆當時建立用戶的信箱與密碼，登入成功後會取得一個 JSON 物件，包含 HTTP 狀態碼、登入訊息、和一組 API Token。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070111-3.png">
