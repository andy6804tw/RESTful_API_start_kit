## 本文你將會學到
- 如何修改資料庫一筆文章資料
- 如何刪除資料庫一筆文章資料
- 使用Postman測試PUT與DELETE

## 前言
昨天已經將 Article 的新增和顯示實作出來了，今天就來繼續實作修改及實作，基本上整個流程跟昨日差不多，重點還是處理 article 路由底下的內容分別為 `article.module.js`、`article.controller.js`、`article.route.js`。

## 修改Article

#### article.module.js

傳入值 `insertValues` 是使用者要修改的資料為一個物件 Object 型態，這個變數是由 `article.controller.js` 傳過來的，此外旁邊多了一個 `productId` 這個就是你要修改的 id 用在 WHERE 語句供修改哪筆資料。

```js
// article.module.js
...略
/* Article PUT 修改 */
const modifyArticle = (insertValues, productId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // Article資料表修改指定id一筆資料
        connection.query('UPDATE Article SET ? WHERE article_id = ?', [insertValues, productId], (error, result) => {
          if (error) {
            console.error('SQL error: ', error);// 寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 0) { // 寫入時發現無該筆資料
            resolve('請確認修改Id！');
          } else if (result.message.match('Changed: 1')) { // 寫入成功
            resolve('資料修改成功');
          } else { 
            resolve('資料無異動');
          }
          connection.release();
        });
      }
    });
  });
};
...略
```

#### article.controller.js
這邊比較特別的是由於修改資料時要指定是哪一筆值組要修改所以勢必要有id，這邊使用 `req.params` 方式將網址上的 id 參數讀取下來(例如:http://127.0.0.1:3000/api/article/1)後面的1代表就是你要修改的id值。

```js
// article.controller.js
import articleModule from '../modules/article.module';
...略
/* Article PUT 修改 */
const articlePut = (req, res) => {
  // 取得修改id
  const articleId = req.params.article_id;
  // 取得修改參數
  const insertValues = req.body;
  articleModule.modifyArticle(insertValues, articleId).then((result) => {
    res.send(result); // 回傳修改成功訊息
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};
...略
```

#### article.route.js
這支檔案就是要指定你的路徑，因為是修改所以使用 put 請求，有發現到賢面路徑跟 GET 與 POST 不同嗎？是這樣的由於修改資料要取得修改的id所以這邊在網址上要求 `:article_id` 加個冒號代表有個 `req.params` 功能。

```js
// article.route.js
import articleCtrl from '../controllers/article.controller';
...略
/** 修改 Article 值組 */
router.route('/:article_id').put(articleCtrl.articlePut);
...略
```

#### PUT測試
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/article/1` 並選擇 PUT 請求方式，接下來是要放入修改的內容，`Body > raw > 選擇 JSON(application/json)`，將所有要修改的資料寫成 JSON 格式在下面空白處如下圖，最後再點選 Send 送出，修改成功後會有成功的字串，此時代表你成功了修改資料庫的內容，若你輸入的id有誤下面訊息也會提供你錯誤的線索像是查無此id。

```json
{
    "user_id": 1,
    "article_title": "Node.js教學",
    "article_tag": "API",
    "article_content": "修改了內容"
}
```


## 刪除Article

#### article.module.js
刪除作法也跟修改差不多也是要有傳入 id 名為 productId 的參數，使用 `DELETE` 刪除資料表 Article 內的某一筆值組。

```js
// article.module.js
...略
/* Article  DELETE 刪除 */
const deleteArticle = (productId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // Article資料表刪除指定id一筆資料
        connection.query('DELETE FROM Article WHERE article_id = ?', productId, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);// 資料庫存取有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 1) {
            resolve('刪除成功！');
          } else {
            resolve('刪除失敗！');
          }
          connection.release();
        });
      }
    });
  });
};
...略
```

#### article.controller.js
這邊主要是接收刪除的id利用 `req.params.article_id` 儲存到變數 `articleId` 中在丟入 module 內的 `deleteArticle` 刪除函式執行的帶回傳。

```js
// article.controller.js
import articleModule from '../modules/article.module';
...略
/* Article  DELETE 刪除 */
const articleDelete = (req, res) => {
  // 取得刪除id
  const articleId = req.params.article_id;
  articleModule.deleteArticle(articleId).then((result) => {
    res.send(result); // 回傳刪除成功訊息
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};
...略
```

#### article.route.js
加上刪除的路徑並使用 `delete` 請求方式。

```js
import articleCtrl from '../controllers/article.controller';

...略
router.route('/:article_id')
  .put(articleCtrl.articlePut) /** 修改 Article 值組 */
  .delete(articleCtrl.articleDelete); /** 刪除 Article 值組 */

export default router;
```

#### 刪除測試
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/article/1` 並選擇 DELETE 請求方式，完成後按下 Send 送出後即可發現有刪除成功訊息。
