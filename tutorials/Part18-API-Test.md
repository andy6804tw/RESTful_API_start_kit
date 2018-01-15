---
layout: post
title: '[Node.js打造API] 使用mocha來做單元測試'
categories: '2018iT邦鐵人賽'
description: 'JSON Web Token'
keywords: api
---

## 本文你將會學到
- 何謂單元測試(Unit Test)
- 了解兩種單元測試類型、四種斷言庫
- 使用 mocha+Supertest 來做單元測試
- 使用 Chai 斷言庫(Assertion Library)

## 前言
為何要做單元測試呢？間單來說單元測試就是一個自動化的測試，開我們專案開發中難免會遇到 bug 或是遇到明明 A 沒問題但 B 被修改後 A 就有問題了，AB 修正後換 C 又有問題了，當然這些錯誤並不會馬上知道通常是要進行存取使用時才會發現問題，所以在開發時經常使用單元測試來確保每次的修改是否會造成其他地方錯誤。

## 事前準備
今天要繼續實作的程式是延續 [[Node.js打造API] (實作)使用JWT來存取API內容(下)](https://andy6804tw.github.io/2018/01/12/get-personal-article(2)/) 的專案繼續實作，想跟著今天的實作可以先下載下面的整包程式，記得要先 `yarn install` 將整個依賴的 Node.js 組件安裝回來。

程式碼：https://github.com/andy6804tw/RESTful_API_start_kit/releases/tag/V17.0.0

## TDD vs. BDD 開發模式
單元測試分為 TDD(測試驅動開發) 和 BDD(行為驅動開發) 兩種類型都是敏捷開發中的一項核心實踐和技術，其中 TDD 是一種開發方法裡實踐後就成為了單元測試，藉由先定義規格，再撰寫程式的方式來開發軟體，而 BDD 簡單來說繼承了 TDD 除了在實作前先寫測試外，還要再測試時寫規格並且能夠順利的正常執行，下面做了一個簡單的比較：

| |	TDD（Test-Driven Development）| BDD（Behavior Driven Development）|
|------------- | ------------- | ------------- |
|名稱| 測試驅動開發|行為驅動開發|
|說明|藉由先定義規格，再撰寫程式的方式來開發軟體，概念是以通過測試來推動整個開發的進行。|繼承 TDD 以使用者導向下去做測試，並且有一份正確的規格下去做驗證。|

## 單元測試框架
在 JavaScript 中有很多測試的框架可以使用，例如有 [mocha](https://github.com/mochajs/mocha)、[jasmine](https://github.com/jasmine/jasmine)、[ava](https://github.com/avajs/ava)、[tap](https://github.com/tapjs/node-tap)......等，其中在 Node.js 的單元測試中 mocha 是最多人使用的。今天的教學也是會用到 mocha 來做單元測試。

## 斷言庫
在 JavaScript 一樣提供了很多斷言庫選擇，它可以幫助開發者在單元測試的過程中判定某個值是否符合預期，其中本篇教學是使用 chai 斷言庫。

- Node.js 內建的 Assert
- chai
- Should.js
- expect.js

## 使用 mocha 來做單元測試
由於時間關係就簡單的帶各位測試 API 中的一小部分，我們就測試文章(Article)的 GET 以及前幾天剛實作完的取得個人文章的路徑。

##### 1. 安裝 mocha
安裝 Node.js 的 mocha 組件。

```bash
yarn add -D mocha
```

##### 2. 安裝 chai
安裝 Node.js 的 chai 組件。

```bash
yarn add -D chai
```

##### 3. 安裝 SuperTest
[SuperTest](https://github.com/visionmedia/supertest) 提供一個輕量級的 HTTP Request 請求庫，通常測試於 Node.js API 都會使用 SuperTest 來做一個連線請求，簡單來說你就把它當作是一個 AJAX 就行了。

安裝 Node.js 的 supertest 組件。

```bash
yarn add -D supertest
```

##### 4. 建立測試檔案
在最外層資料夾新增一個名叫 test 的資量夾並新增一個 `article.test.js` 的檔案，引入 chai 斷言庫與 supertest，最後再將我們的 API 進入點引入並使用 `supertest` 來設定 API 測試路徑。

首先在執行單測前通過 mocha 的 before hook 向數據庫裡添加了一條 `user/login` 的測試，將帳密 POST 出去測試成功後會取得 API Token 並存起來等等提供給 `/article/personal` 使用。

再來建立一個 `describe()` 你描述標測試的功能或方法，且在此區域中可執行多條測試 `it()`，我們建立兩個測試內容第一個為取得所有文章資料並使用 GET 請求方式，且最後使用 expect 斷言來檢查每個資料型態是否與資料庫設計的欄位格式吻合，使用 [expect/should](http://chaijs.com/api/bdd/) 的優點就是斷言規則相當明確與口語化一眼就可以知道它在做什麼。

最後一條測試是 `/article/personal` 路徑，這條路徑就是利用 JWT 取得該使用者的所有文章，我們使用 `.set()` 方法定義一個 Authorization 並將 Bearer Token 放入 Header 中並預期他會回應 200 Status Code。


- `describe()` 描述區塊測試內容，可視為一個測試的群組，裡面可以跑很多條測試。
- `it()` 可撰寫每條測試內容
- `before()` 測試開始前會先跑完裡面內容
- `beforeEach()` 在每個測試開始前會先執行此區塊
- `after()` 全部測試完畢後則會進入此區塊
- `afterEach()` 在每個測試結束後會執行此區塊

```js
// article.test.js
/* global describe it before */
const { expect } = require('chai');

const supertest = require('supertest');
require('../dist/index.bundle');

const api = supertest('http://localhost:3000/api'); // 定義測試的 API 路徑
let APItoken; // 全域變數等待 before() 取得 Token

before((done) => {
  api.post('/user/login') // 登入測試
    .set('Accept', 'application/json')
    .send({
      user_mail: 'andy@gmail.com',
      user_password: 'password10'
    })
    .expect(200)
    .end((err, res) => {
      APItoken = res.body.token; // 登入成功取得 JWT
      done();
    });
});

describe('Article', () => {
  it('Article should be an object with keys and values', (done) => {
    api.get('/article') // 測試取得所有文章
      .expect(200)
      .end((err, res) => {
        if (err) {
          done(err);
        }
        // 斷言做資料驗證(文章id、用戶id、文章標題、文章標籤、文章內容)
        expect(res.body[0]).to.have.property('article_id');
        expect(res.body[0].article_id).to.be.a('number');
        expect(res.body[0]).to.have.property('user_id');
        expect(res.body[0].user_id).to.be.a('number');
        expect(res.body[0]).to.have.property('article_title');
        expect(res.body[0].article_title).to.be.a('string');
        expect(res.body[0]).to.have.property('article_tag');
        expect(res.body[0].article_tag).to.be.a('string');
        expect(res.body[0]).to.have.property('article_content');
        expect(res.body[0].article_content).to.be.a('string');
        done();
      });
  });
  it('should return a 200 response', (done) => {
    api.get('/article/personal') // 測試取得某用戶的所有文章
      .set('Authorization', `Bearer ${APItoken}`) // 將 Bearer Token 放入 Header 中的 Authorization
      .expect(200, done);
  });
});
```

## 成果測試
在終端機直接執行 mocha 即可馬上觀看測試結果，若發生錯誤請先將專案 `yarn build` 一次產生 dist 資料夾才能讀到編譯後的 API 檔案。

<img src="/images/posts/it2018/img1070115-1.gif">
