import Joi from 'joi';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config();

const envVarSchema = Joi.object().keys({
  NODE_ENV: Joi.string().default('development').allow(['development', 'production']),
  PORT: Joi.number().default(8080),
  VERSION: Joi.string()
}).unknown().required();

const { error, value: envVars } = Joi.validate(process.env, envVarSchema);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  version: envVars.VERSION,
  env: envVars.NODE_ENV,
  port: envVars.PORT
};

export default config;
