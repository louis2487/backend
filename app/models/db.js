const dbConfig = require("../config/db.config.js");
const pg = require('pg');

const connection = new pg.Pool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  port:dbConfig.PORT,
  options: '-c search_path=public,jangsucrops',
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
})

module.exports = connection;
