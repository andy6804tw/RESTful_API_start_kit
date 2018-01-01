## 本文你將會學到
- 如何新增一筆用戶資料
- 如何修改資料庫一筆用戶資料
- 使用Postman測試POST與GET

## 前言
前兩天已經將 Article 文章的部分做完新增、刪除、修改以及顯示，今天開始要實作另一個資料表用戶，已經熟悉的讀者可以試著先自己做做看，若還是不熟悉的沒關係可以一起照著文章來做。

## 設定路由
在主路由 `index.route.js` 內新增一個 user 的路由，所以到現在目前主路由裡面有兩個路徑分別為 user 和 article。

- index.route.js

```js
// Router
import user from './user.route';

...略

/** User Router */
router.use('/user', user);

...略
```

## 新增(User)

#### user.module.js

在 module 中建立資料庫連線且經由 `connection.query()` 做出資料庫的語法存取，此外傳入值 `insertValues` 是一個物件 Object 型態裡面存著新增使用者的所有資料，這個變數是由 `article.controller.js` 傳過來的。

```js
// user.module.js
import mysql from 'mysql';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});
/* User  POST 新增 */
const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('INSERT INTO User SET ?', insertValues, (error, result) => { // User資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            resolve(`新增成功！ article_id: ${result.insertId}`); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};
export default {
  createUser
};
```

#### user.controller.js

controller 檔案就是接收 module 中 Promise 函式所運行的結果，經由 then 得到一個變數 result 這是個物件可以查看裡面所回傳的訊息，若新增資料成功會回傳成功的訊息，然而 catch 是接收錯誤例外的地方，程式運行有問題就會跑進來此函式並爆出錯誤內容。

```js
// user.controller.js
import userModule from '../modules/user.module';

/* User  POST 新增 */
const userPost = (req, res) => {
  // 取得新增參數
  const insertValues = req.body;
  userModule.createUser(insertValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};
export default {
  userPost
};
```

#### user.route.js

route 是設定每條 api request 的地方，由於是要新增資料所以這邊使用 post 請求方式將資料上傳到資料庫，後面的參數就是指定執行 userCtrl 中的 userGet 函式。

```js
// user.route.js
import express from 'express';
import userCtrl from '../controllers/user.controller';

const router = express.Router();

router.route('/').get(userCtrl.userGet); /** 取得 User 所有值組 */

export default router;
```

#### POST測試

首先將程式碼 `yarn build` 再 `yarn start` 後開啟 Postman 在網址列輸入 `localhost:3000/api/user` 並選擇 POST 請求方式，接下來是要放入 POST 的內容，`Body > raw > 選擇 JSON(application/json)`，將所有要新增的資料寫成 JSON 格式在下面空白處如下圖，最後再點選 Send 送出，最下面就會回傳你的新增結果囉！若有寫入資料庫成功他會回傳新增該筆資料的 id 位置。

```json
{
	"user_name":"Andy10",
	"user_mail":"andy@gmail.com",
	"user_password":"0000"
}
```


## 顯示(User)

#### user.module.js

顯示的意思就是將資料表裡的所有值組撈出來，整個架構跟 POST 一樣只差別在 Query 方式不同，首先也是先動最底層的檔案 `user.module.js` 建立一個名為 selectUser 的箭頭函式並使用 sql 語法中的 SELECT 將 Article 所有欄位的值組全數撈出來。

```js
// user.module.js
...略
/*  User GET 取得  */
const selectUser = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          `SELECT
            *
          FROM
            User`
          , (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else {
              resolve(result); // 撈取成功回傳 JSON 資料
            }
            connection.release();
          }
        );
      }
    });
  });
};
...略
```

#### user.controller.js

controller 一樣建立一個名為 UserGet 的箭頭函示接收 module 中 selectUser 的回傳內容。

```js
// user.controller.js
import userModule from '../modules/user.module';
...略
/*  User GET 取得  */
const userGet = (req, res) => {
  userModule.selectUser().then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};
...略

```

#### user.route.js

在 route 新增今日第二個實作的 request 為 get ，後面放上 `user.controller` 中的 userPost 函式。

```js
// user.route.js
import express from 'express';
import userCtrl from '../controllers/user.controller';

const router = express.Router();

router.route('/')
  .get(userCtrl.userGet) /** 取得 User 所有值組 */
  .post(userCtrl.userPost); /** 新增 User 值組 */


export default router;
```

#### GET測試
將程式碼 `yarn build` 再 `yarn start` 後開啟 Postman 在網址列輸入 `localhost:3000/api/user` 並選擇 GET 請求方式，最後按下 Send 送出查看底下結果，若有回傳 JSON 恭喜你表示撈取成功。
