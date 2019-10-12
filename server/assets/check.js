module.exports = {
    username:(val)=>{
        let reg = /^[a-zA-Z0-9_-]{6,18}$/
        return !reg.test(val)
    },
    password:(val)=>{
        let reg = /^.*(?=.{6,18})(?=.*\d)(?=.*[a-zA-Z]).*$/
        return !reg.test(val)
    }
}