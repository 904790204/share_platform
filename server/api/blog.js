const utils = require('../assets/utils');
const pool = require('../mysql');
let router = {
    // 新建、编辑
    save:async(req, res, next) => {
        if(!req.body || req.body.title === ''||req.body.content === ''||req.body.module_id === ''){
            return utils.sendContent(res,1002)
        }
        let sqlStr
        if(req.body.id){
            let blogs = await pool.AsyncQuery(`SELECT id FROM blog WHERE id = ${pool.escape(req.body.id)}`,res)
            if(blogs.length === 0) utils.sendContent(res,1005,"文章不存在！")
            sqlStr = `UPDATE blog SET 
                        title = ${pool.escape(req.body.title)},
                        content = ${pool.escape(req.body.content)},
                        module_id = ${pool.escape(req.body.module_id)}
                        WHERE id = ${pool.escape(req.body.id)}`
        }else{
            sqlStr = `INSERT INTO 
                        blog (title,content,user_id,module_id,create_time)
                        VALUES
                        (
                            ${pool.escape(req.body.title)},
                            ${pool.escape(req.body.content)},
                            ${pool.escape(req.session.user.id)},
                            ${pool.escape(req.body.module_id)},
                            NOW()
                        )`
        }
        await pool.AsyncQuery(sqlStr,res)
        res.json({
            status: 100,
            data:'操作成功'
        })
    },
    // 获取文章列表
    getList:async(req, res, next) => {
        if(!req.body){
            return utils.sendContent(res,1002)
        }
        let module_sql = ``
        if(req.body.module_id){
            let modules = await pool.AsyncQuery(`SELECT id FROM module WHERE id = ${pool.escape(req.body.module_id)}`,res)
            if(modules.length === 0) utils.sendContent(res,1005,"模块不存在！")
            module_sql = `&& module_id = ${pool.escape(req.body.module_id)}`
        }
        let page = req.body.page || 1
        let sqlStr = `SELECT id,title,user_id,module_id,DATE_FORMAT(create_time,'%Y-%m-%d %T') AS create_time FROM blog
                        WHERE title = ${pool.escape(req.body.title)} ${module_sql}
                        LIMIT ${(page-1)*10},10`
        let list = await pool.AsyncQuery(sqlStr,res)
        for(let i = 0; i < list.length; i++){
            let module_name = await pool.AsyncQuery(`SELECT name FROM module WHERE id = ${pool.escape(list[i].module_id)}`,res)
            list[i].module_name = module_name[0].name
            let user_name = await pool.AsyncQuery(`SELECT nickname FROM user WHERE id = ${pool.escape(list[i].user_id)}`,res)
            list[i].author = user_name[0].nickname
        }
        res.json({
            status:100,
            data:list
        })
    },
    // 获取文章详情
    getDetail:async(req, res, next) => {
        if(!req.body || !req.body.id){
            return utils.sendContent(res,1002)
        }
        let blog = await pool.AsyncQuery(`SELECT *,DATE_FORMAT(create_time,'%Y-%m-%d %T') AS create_time FROM blog WHERE id = ${pool.escape(req.body.id)}`,res)
        if(blog.length === 0) utils.sendContent(res,1005,"文章不存在！")
        let detail = blog[0]
        let reply = await pool.AsyncQuery(`SELECT *,DATE_FORMAT(create_time,'%Y-%m-%d %T') AS create_time FROM reply WHERE blog_id = ${pool.escape(req.body.id)}`,res)
        detail.replys = utils.toTree(reply)

        res.json({
            status:100,
            data:detail
        })
    },
    // 文章留言提交
    toReply:async(req, res, next) => {
        if(!req.body || !req.body.blog_id || !req.body.content){
            return utils.sendContent(res,1002)
        }
        let blog = await pool.AsyncQuery(`SELECT id FROM blog WHERE id = ${pool.escape(req.body.blog_id)}`,res)
        if(blog.length === 0) utils.sendContent(res,1005,"文章不存在！")
        if(req.body.reply_pid){
            let reply = await pool.AsyncQuery(`SELECT id FROM reply WHERE id = ${pool.escape(req.body.reply_pid)}`,res)
            if(reply.length === 0) utils.sendContent(res,1005,"留言不存在！")
        }
        let sqlStr = `INSERT INTO 
                        reply (blog_id,user_id,pid,content,create_time)
                        VALUES
                        (
                            ${pool.escape(req.body.blog_id)},
                            ${pool.escape(req.session.user.id)},
                            ${pool.escape(req.body.reply_pid || 0)},
                            ${pool.escape(req.body.content)},
                            NOW()
                        )`
        await pool.AsyncQuery(sqlStr,res)
        res.json({
            status:100,
            data:'留言成功！'
        })
    },
}

module.exports = router