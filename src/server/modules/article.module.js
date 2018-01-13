import mysql from 'mysql';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});


/*  Article GET 取得  */
const selectArticle = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // Article撈取所有欄位的值組
          `SELECT
            *
          FROM
            Article`
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
  });
};

/* Article  POST 新增 */
const createArticle = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('INSERT INTO Article SET ?', insertValues, (error, result) => { // Article資料表寫入一筆資料
          if (error) {
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

/* Article PUT 修改 */
const modifyArticle = (insertValues, userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // Article資料表修改指定id一筆資料
        connection.query('UPDATE Article SET ? WHERE article_id = ?', [insertValues, userId], (error, result) => {
          if (error) {
            // 寫入資料庫有問題時回傳錯誤
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

/* Article  DELETE 刪除 */
const deleteArticle = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // Article資料表刪除指定id一筆資料
        connection.query('DELETE FROM Article WHERE article_id = ?', userId, (error, result) => {
          if (error) {
            // 資料庫存取有問題時回傳錯誤
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

/*  Article GET JWT取得個人文章  */
const selectPersonalArticle = (token) => {
  return new Promise((resolve, reject) => {
    // JWT解密驗證
    jwt.verify(token, 'my_secret_key', (err, decoded) => {
      if (err) {
        reject(err); // 驗證失敗回傳錯誤
      } else {
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
      }
    });
  });
};


export default {
  selectArticle,
  createArticle,
  modifyArticle,
  deleteArticle,
  selectPersonalArticle
};
