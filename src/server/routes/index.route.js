import express from 'express';
// Router
import article from './article.route';
import user from './user.route';

import config from './../../config/config';

const router = express.Router();


/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`此路徑是: localhost:${config.port}/api`);
});

/** Article Router */
router.use('/article', article);
/** User Router */
router.use('/user', user);


export default router;
