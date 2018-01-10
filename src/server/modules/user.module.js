import mysql from 'mysql';
import bcrypt from 'bcrypt';
import config from '../../config/config';
import APPError from '../helper/AppError';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

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
            resolve(`新增成功！ user_id: ${result.insertId}`); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

/* User PUT 修改 */
const modifyUser = (insertValues, userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // User資料表修改指定id一筆資料
        connection.query('UPDATE User SET ? WHERE user_id = ?', [insertValues, userId], (error, result) => {
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

/* User  DELETE 刪除 */
const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // User資料表刪除指定id一筆資料
        connection.query('DELETE FROM User WHERE user_id = ?', userId, (error, result) => {
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
              reject(new APPError.LoginError1()); // 信箱尚未註冊
            } else {
              const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
              const userPassword = insertValues.user_password; // 使用者登入輸入的密碼
              bcrypt.compare(userPassword, dbHashPassword).then((res) => { // 使用bcrypt做解密驗證
                if (res) {
                  resolve('登入成功'); // 登入成功
                } else {
                  reject(new APPError.LoginError2()); // 登入失敗 輸入的密碼有誤
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


export default {
  selectUser,
  createUser,
  modifyUser,
  deleteUser,
  selectUserLogin
};
