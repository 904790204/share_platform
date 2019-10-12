const pool = require('../mysql');
const utils = require('../assets/utils');
const check = require('../assets/check');
const crypto = require('crypto')
let router = {
    // 注册
    register:async(req, res, next) => {
        if(req.body.username === ''){
            return utils.sendContent(res,1002,"用户名不可为空！")
        }
        if(check.username(req.body.username)){
            return utils.sendContent(res,1002,"用户名必须为为6-18位的字母，数字，下划线组成！")
        }
        if(req.body.password === ''){
            return utils.sendContent(res,1002,"密码不可为空！")
        }
        if(check.password(req.body.password)){
            return utils.sendContent(res,1002,"密码必须为长度6-18位的字母，数字组合！")
        }
        if(req.body.nickname === ''){
            return utils.sendContent(res,1002,"昵称不可为空！")
        }
        let usernames = await pool.AsyncQuery(`SELECT id FROM user WHERE username = ${pool.escape(req.body.username)}`,res)
        if(usernames.length > 0){
            return utils.sendContent(res,1005,"用户名已存在！")
        }
        let nickname = await pool.AsyncQuery(`SELECT id FROM user WHERE username = ${pool.escape(req.body.username)}`,res)
        if(nickname.length > 0){
            return utils.sendContent(res,1005,"昵称已存在！")
        }

        let sqlStr = `INSERT INTO 
                        user (username,password,nickname,create_time,phone) 
                        VALUES (${pool.escape(req.body.username)},
                                ${pool.escape(crypto.createHash('md5').update(req.body.password).digest('base64'))},
                                ${pool.escape(req.body.nickname)},
                                NOW(),
                                ${pool.escape(req.body.phone)})`
        await pool.AsyncQuery(sqlStr,res)
        utils.sendContent(res,100,"注册成功！")
    },
    // 登陆
    login:async(req,res,next) => {
        if(req.body.username === ''||req.body.password === ''){
            return utils.sendContent(res,1002)
        }
        let userinfo = await pool.AsyncQuery(`SELECT id,username,password FROM user WHERE username = ${pool.escape(req.body.username)}`,res)
        if(userinfo.length === 0){
            return utils.sendContent(res,1005,"账号不存在！")
        }
        if(userinfo[0].password !== crypto.createHash('md5').update(req.body.password).digest('base64')){
            return utils.sendContent(res,1005,"密码错误！")
        }
        
        let user={
            id:userinfo[0].id,
            last_time:new Date().getTime()
        }
        req.session.user=user;
        res.json({
            status: 100,
            data:"登陆成功！"
        })
    },
    // 修改
    changePsd:async(req,res,next) => {
        if(req.body.username === ''||req.body.oldPsd === ''||req.body.newPsd === ''||req.body.againPsd === ''){
            return utils.sendContent(res,1002)
        }
        let userinfo = await pool.AsyncQuery(`SELECT id,username,password FROM user WHERE username = ${pool.escape(req.body.username)}`,res)
        if(userinfo.length === 0){
            return utils.sendContent(res,1005,"账号不存在！")
        }
        if(userinfo[0].password !== crypto.createHash('md5').update(req.body.oldPsd).digest('base64')){
            return utils.sendContent(res,1005,"密码错误！")
        }
        if(req.body.againPsd !== req.body.newPsd){
            return utils.sendContent(res,1005,"两次输入密码不一致！")
        }
        let sqlStr = `UPDATE user SET password = ${pool.escape(crypto.createHash('md5').update(req.body.newPsd).digest('base64'))}`
        await pool.AsyncQuery(sqlStr,res)
        utils.sendContent(res,100,"修改成功！")
    },
}

module.exports = router


