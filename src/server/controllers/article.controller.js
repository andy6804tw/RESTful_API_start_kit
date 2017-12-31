import articleModule from '../modules/article.module';


/**
 * Article 資料表
 */

/*  Article GET 取得  */
const articleGet = (req, res) => {
  articleModule.selectArticle().then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

/* Article  POST 新增 */
const articlePost = (req, res) => {
  // 取得新增參數
  const insertValues = req.body;
  articleModule.createArticle(insertValues).then((result) => {
    res.send(result); // 成功回傳result結果
  }).catch((err) => { return res.send(err); }); // 失敗回傳錯誤訊息
};

const test = (req, res) => {
  res.send('測試');
};


export default {
  test,
  articleGet,
  articlePost
};
