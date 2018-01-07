## 本文你將會學到
- 實作一條登入(Login)的路徑
- 資料庫搜尋某筆使用者是否存在
- 使用bcrypt解密並作登入驗證

## 前言
上一篇已經學會如何將密碼加密並寫入資料庫，今天就來實作登入的 API，首先請各位思考一下登入時前端使用者輸入信箱與密碼，後端 API 就去資料庫撈取信箱與密碼是否吻合，這個流程沒問題，但前端使用者輸入的密碼要怎麼去確認資料庫加密後的密碼兩者是否相同呢？還記得上一篇有提到 bcrypt 的驗證機制能夠將加密後字串與原未加密字串做驗證，廢話不多說就來開始吧！


## 使用者登入

#### 修改 user.module.js
在  `user.module.js` 檔案內新增一個函式 `selectUserLogin` 在這個函式內做 User 資料表的查詢使用 SELECT 和 WHERE 來搜尋是否有 `user_mail` 這筆資料，若無馬上回傳信箱尚未註冊並結束，若有該筆資料則繼續做密碼驗證步驟，首先記得引入 `bycript` 的函式庫，這邊使用 `bcrypt.compare()` 的方法做密碼驗證，裡面有兩個參數第一個參數為 `userPassword` 為前端使用者登入輸入的密碼，`dbHashPassword` 為資料庫所儲存加密後的密碼，這裡是使用promises非同步寫法執行後會回傳一個 `res` 他是個布林值(boolean)，若帳密正確為 true 回傳登入成功字串，反之 false 為密碼錯誤登入失敗。

```js
// user.module.js
import bcrypt from 'bcrypt';
...略
/*  User GET (Login)登入取得資訊  */
const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // User撈取所有欄位的值組
          'SELECT * FROM User WHERE user_mail = ?',
          insertValues.user_mail, (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else if (Object.keys(result).length === 0) {
              resolve('信箱尚未註冊！');
            } else {
              const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
              const userPassword = insertValues.user_password; // 使用者登入輸入的密碼
              bcrypt.compare(userPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
                if (res) {
                  resolve('登入成功'); // 登入成功
                } else {
                  resolve('您輸入的密碼有誤！'); // 登入失敗
                }
              });
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

#### 修改 user.controller.js
在 `user.controller.js` 中新增一個函式名為 `userLogin`  insertValues 為一個物件(Object)型態裡面存有使用者所 POST 的資料包含 `user_mail` 與 `user_password`，最後將這個物件傳入 `user.module.js` 中的函式 `selectUserLogin`，由於是 Promise 寫法所以該函式會回傳結果 `result`，裡面存有登入狀態像是登入成功、查無此信箱、密碼錯誤的訊息，此外還要有個 catch 來接收錯誤，若沒有寫的話 ESLint 會提示要求你補上錯誤例外。

```js
// user.controller.js
import userModule from '../modules/user.module';
...略
/* User  POST 登入(Login) */
const userLogin = (req, res) => {
  // 取得帳密
  const insertValues = req.body;
  userModule.selectUserLogin(insertValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};
...略
```

#### 修改 user.route.js
在 `user.route.js` 新增一個路徑為 `/login` 並且使用 POST 請求，因為登入時會要求使用者輸入信箱與密碼所以才要利用 POST 來接收資料，這些資料將會在 `user.controller` 中的 `userLogin` 函式中被撈取出來。

```js
// user.route.js
import userCtrl from '../controllers/user.controller';
...略
router.route('/login').post(userCtrl.userLogin); /** User 登入 */
...略
```

## 登入測試
將程式碼 `yarn build` 再 `yarn start` 後，開啟Postman在網址列輸入 `http://127.0.0.1:3000/api/user/login` 並選擇 POST 請求方式，接下來是要放入修改的內容，`Body > raw > 選擇 JSON(application/json)`，將信箱與密碼用 JSON 格式送出。

**登入成功**

輸入一筆當時建立用戶的信箱與密碼，登入成功後會取得`登入成功`的訊息。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070109-1.png">
<img src="/images/posts/it2018/img1070109-2.png">

**帳號錯誤(未註冊)**

隨便輸入一筆資料庫無存在的信箱送出後，會跑出`信箱尚未註冊！`的訊息。

```json
{
	"user_mail":"abcd@gmail.com",
	"user_password":"password10"
}
```

<img src="/images/posts/it2018/img1070109-3.png">
<img src="/images/posts/it2018/img1070109-4.png">

**登入失敗(密碼錯誤)**

輸入一筆有註冊的信箱但密碼故意輸入錯誤，可以發現回傳`您密碼輸入有誤！`的訊息。

```json
{
	"user_mail":"andy@gmail.com",
	"user_password":"abcde"
}
```

<img src="/images/posts/it2018/img1070109-5.png">
<img src="/images/posts/it2018/img1070109-6.png">

