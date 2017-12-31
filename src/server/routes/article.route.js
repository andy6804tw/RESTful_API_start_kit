import express from 'express';
import articleCtrl from '../controllers/article.controller';

const router = express.Router();

router.route('/')
  .get(articleCtrl.articleGet) /** 取得 Article 所有值組 */
  .post(articleCtrl.articlePost); /** 新增 Article 值組 */


export default router;
