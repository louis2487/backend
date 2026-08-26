

const pg = require('./db.js');
const logger = require('../config/winston');

function runQuery(method, sql) {
    return new Promise(async (resolve, reject) => {
        const poolClient = await pg.connect();
        try {
            await poolClient.query('BEGIN');

            logger.info("==>RunQuery===========================================>>")
            logger.info(method)
            logger.info(sql)
            logger.info("==>RunQuery===========================================>>")
            const result = await poolClient.query(sql);
            await poolClient.query('COMMIT');
            resolve(result.rows);
        } catch (e) {
            await poolClient.query('ROLLBACK');
            reject(e);
        } finally {
            // 명시적 해제
            poolClient.release();
        }

    })
};

module.exports = runQuery;
