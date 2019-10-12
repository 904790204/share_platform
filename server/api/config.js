const utils = require('../assets/utils');
const pool = require('../mysql');
let router = {
    // 获取模块列表
    getModules:async(req, res, next) => {
        let sqlStr = `SELECT id,pid,name FROM module`
        let data = await pool.AsyncQuery(sqlStr,res)
        data = utils.toTree(data)
        res.json({
            status: 100,
            data:data
        })
    }
}

module.exports = router