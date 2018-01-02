import Joi from 'joi';

export default {
  // POST /api/article
  createArticle: {
    body: {
      user_id: Joi.number().required(), // 數字＋必填
      article_title: Joi.string().required(), // 字串＋必填
      article_tag: Joi.string().required(), // 字串＋必填
      article_content: Joi.string().min(20).required() // 文章長度至少20字
    }
  },
  // POST /api/user
  createUser: {
    body: {
      user_name: Joi.string().required(), // 字串＋必填
      user_mail: Joi.string().email().trim().required(), // 限定email格式並移除多餘空白
      user_password: Joi.string().regex(/[a-zA-Z0-9]{6,30}$/).required() // 最小長度6最大30，只允許英文大小寫和數字
    }
  }
};

