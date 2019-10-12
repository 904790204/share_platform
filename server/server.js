const express = require('express');
const pool = require('./mysql');
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require("body-parser");
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const utils = require('./assets/utils');

app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// 设置bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
// 设置session
app.use(session({
    store:new FileStore(),
    secret: 'kim.sid',
    resave: false,
    saveUninitialized: true,
    cookie: { path: '/', httpOnly: true, secure: false, maxAge: null }
}));
// 检查登陆
let whitelist = ["/user/login","/user/register"]
app.use('/api', async(req, res,next) => {
    if(whitelist.includes(req.url)){
        next()
    }else{
        if(!req.session.user) return utils.sendContent(res,1001,"登陆信息失效！")
        let userinfo = await pool.AsyncQuery(`SELECT id,username,nickname FROM user WHERE id = ${pool.escape(req.session.user.id)}`,res)
        if(userinfo.length == 1){
            next()
        }
    }
})
// 设置接口
folder = fs.readdirSync(path.resolve(__dirname, 'api'))
folder.forEach(el => {
    let file = el.split('.')[0]
    let lists = require(`./api/${file}`)
    for (let item in lists) {
        app.post(`/api/${file}/${item}`, lists[item]);
    }
});
// 设置404
app.use('/', (req, res) => {
    res.send('404')
})

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`服务启动 http://127.0.0.1:${port}`)
// })

module.exports = app;