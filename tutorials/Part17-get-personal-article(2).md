---
layout: post
title: '[Node.js打造API] (實作)使用JWT來存取API內容(下)'
categories: '2018iT邦鐵人賽'
description: 'JSON Web Token'
keywords: api
---

## 本文你將會學到
- 如何將 JWT 做解密驗證
- 使用 HTTP header 中的 Authorization 傳送 Bearer Token
- 實作一個 API 撈取並顯示自己所發佈過的文章(完成後半部資料庫撈取文章)

## 前言
昨天已經成功的使用 HTTP header 中的 Authorization 並傳送 Bearer Token 到 Middleware 做字串切割後傳到 Controller 取得 API Token，最後傳送到 Module 做 JWT 驗證並回應 Payload 資料，今天就來繼續完成 API 撈取並顯示自己所發佈過的文章的資料庫存取部分，JWT 驗證成功後會取得一個物件(Object)這邊稱他 decoded 格式如下：

```json
//decoded物件
{
    "payload": {
        "user_id": 1,
        "user_name": "Andy10",
        "user_mail": "andy@gmail.com"
    },
    "exp": 1515811450,
    "iat": 1515810550
}
```

我們要取得 `decoded` 中的 `user_id` 資訊並拿 `user_id` 去撈取資料表中的所有 Article 資料，這就是我們今天要實作的內容。

## 事前準備
今天要繼續實作的程式是延續 [[Node.js打造API] (實作)使用JWT來存取API內容(上)](https://andy6804tw.github.io/2018/01/12/get-personal-article(1)/) 的專案繼續實作，想跟著今天的實作可以先下載下面的整包程式，記得要先 `yarn install` 將整個依賴的 Node.js 組件安裝回來。

程式碼：https://github.com/andy6804tw/RESTful_API_start_kit/releases/tag/V16.0.0

## 修改 article.module.js
昨天已經建立了 `selectPersonalArticle` 函式並且成功的接收 controller 傳過來的 API Token 並將它做 JWT 解密驗證，今天繼續完成後面撈取資料庫部分(昨日註解的地方)，首先取得 Payload 裡的用戶 id 因為他是用一個物件(Object)包起來所以我們取得資料的方式為 `decoded.payload.user_id` ，這樣就能知道是要撈取哪一位使用者的文章了！最後我們建立一個資料庫連線並且用 SQL 語法去撈取(SELECT) Article 資料表裡的所有欄位(*)並設立條件(WHERE)當 `user_id` 為變數 `userId`，這裡用問號方式來實作後面的中括號變數就是相對應的值，當然你也可以使用 ES6 的樣板字串（Template literals) \`SELECT * FROM Article WHERE user_id = ${userId}\` ，使用「\`」能將字串與程式變數同時寫在一起 `${變數}` 同時也能使用多行字串，最後資料庫撈取成功後就回傳他的結果。

<img src="/images/posts/it2018/img1070113-7.png">

```js
...略
/*  Article GET JWT取得個人文章  selectPersonalArticle */
  // JWT 驗證成功 ->取得用戶 user_id
  const userId = decoded.payload.user_id;
  // JWT 驗證成功 -> 撈取該使用者的所有文章
  connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
    if (connectionError) {
      reject(connectionError); // 若連線有問題回傳錯誤
    } else {
      connection.query( // Article 撈取 user_id 的所有值組
        'SELECT * FROM Article WHERE user_id = ?', [userId]
        , (error, result) => {
          if (error) {
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else {
            resolve(result); // 撈取成功回傳 JSON 資料
          }
          connection.release();
        }
      );
    }
  });
...略
```

## 測試

#### 1. POST多筆文章資料
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/article` 並選擇 POST 請求方式，之後將所有資料 `user_id`、`article_title`、`article_tag`、`article_content` 放至 `Body > raw > 選擇 JSON(application/json)` 並用物件 JSON 型態包裝起來，最後按 Send 送出，你可以試著重複新增多筆資料和不同使用者的文章，照理來說這隻 API 應該也要利用 JWT 來取得 `user_id` 但為了方便測試請各位先自行手動填入 `user_id` 記住使用者 id 要與資料庫內的 `user_id` 相對應。


```json
{
    "user_id": 1,
    "article_title": "[Day-3] Node.js 入門介紹",
    "article_tag": "2018鐵人賽",
    "article_content": "何謂 Node.js Node.js 是以 JavaScript 語言為基礎，是一個開放的原始碼 (Open Source) 的應用程式框架 (Applicat..."
}
```
<img src="/images/posts/it2018/img1070113-5.png">
<img src="/images/posts/it2018/img1070113-6.png">

#### 2. 登入
新增多筆文章後在 Postman 網址列輸入 `http://127.0.0.1:3000/api/user/login` 並選擇 POST 請求方式，接下來是要放一筆當時建立用戶的信箱與密碼至 `Body > raw > 選擇 JSON(application/json)` 並用物件 JSON 型態包裝起來，完成後送出取得 API Token ，最後再拿此 API Token 來訪問今天實作的 API 內容。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070113-1.png">
<img src="/images/posts/it2018/img1070113-2.png">

#### 3. JWT驗證並訪問API內容
在 Postman 網址列輸入 `http://127.0.0.1:3000/api/article/personal` 後選擇 GET 並點選 Headers 並將 Key 放上 Authorization ，而 Value 放上 Bearer+JWT(注意記得空白隔開)，如下。

```
Key: Authorization
Value: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7InVzZXJfaWQiOjEsInVzZXJfbmFtZSI6IkFuZHkxMCIsInVzZXJfbWFpbCI6ImFuZHlAZ21haWwuY29tIn0sImV4cCI6MTUxNTgxNDc0NywiaWF0IjoxNTE1ODEzODQ3fQ.evjIOCsOwolFEn3Nj4BESlQ-OH-JPlwLnTZFgcNOoWc
```

<img src="/images/posts/it2018/img1070113-3.png">

**JWT驗證成功並取得該用戶的所有文章**

我們利用 JWT 解密並取得 Payload 中的 `user_id` 並知道是要撈取資料庫中哪位使用者的資料，最後將所有文章值組列出來。


<img src="/images/posts/it2018/img1070113-4.png">
