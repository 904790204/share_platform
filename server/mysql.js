const mysql = require('mysql')
const utils = require('./assets/utils')

let pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: 'Xes@2019',
	database: 'feshare',
	port: 8888
})
pool.AsyncQuery = function(sql, res) {
	return new Promise((resolve, reject) => {
		pool.query(sql, (err, results, fields) => {
			if (err) return utils.sendContent(res, 1004, err)
			resolve(JSON.parse(JSON.stringify(results)))
		})
	})
}

module.exports = pool
