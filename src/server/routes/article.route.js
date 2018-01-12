import express from 'express';
import validate from 'express-validation';
import articleCtrl from '../controllers/article.controller';
import paramValidation from '../../config/param-validation';

const router = express.Router();

router.route('/')
  .get(articleCtrl.articleGet) /** 取得 Article 所有值組 */
  .post(validate(paramValidation.createArticle), articleCtrl.articlePost); /** 新增 Article 值組 */

router.route('/:article_id')
  .put(articleCtrl.articlePut) /** 修改 Article 值組 */
  .delete(articleCtrl.articleDelete); /** 刪除 Article 值組 */

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


export default router;
