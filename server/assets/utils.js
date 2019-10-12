const code = require('./code');
module.exports = {
    toTree(list,id){
        let tree = []
        list.forEach(item => {
            if((typeof id == "undefined" && (item.pid == 0 || typeof item.pid == "undefined")) || (typeof item.pid != "undefined" && typeof id != "undefined" && item.pid == id)){
                item.children = this.toTree(list,item.id)
                tree.push(item)
            }
        });
        return tree
    },
    sendContent(res,num,text){
        res.json({
            status: num,
            data:typeof text === "undefined" ? code[num].data : text
        })
    }
}