const mysql = require('mysql2');
const configOptions = require('./config')
class MyConnect {
    /**
     * initialization
     * @param {configOptions} options 
     */
    constructor(options) {
        this.debug = options.debug || false
        this.connection = mysql.createConnection({
            host: options.host,
            user: options.user,
            port: options.port,
            database: options.database,
            password: options.password,
            pool: true,
        });
    }
    /**
     * query via sql command directly
     * 使用sql语句直接查询
     * @param {string} sql the sql command
     * @returns 
     */
    query(sql){
        return new Promise((resolve, reject) => {
            this.connection.query(sql,
                (err, results, fields) => {
                    if (err) reject(err)
                    else {
                        resolve(results)
                    }
                }
            );
        })
    }
    /**
     * execute via sql command directly
     * 直接执行sql语句
     * @param {string} sql the sql command
     * @returns 
     */
    execute(sql){
        return new Promise((resolve, reject) => {
            this.connection.execute(sql,
                (err, result, fields) => {
                    if (err) reject(err)
                    else resolve(result)
                }
            );
        })
    }
    table(tableName) {
        return new MyQuery(this, tableName)
    }
}
class MyQuery {
    /**
     * set up an instance of MyQuery
     * 实例化MyQuery对象
     * @param {MyConnect} myConnect 
     * @param {string} tableName 
     * @version 1.0.0
     * @returns MyQuery
     */
    constructor(myConnect, tableName) {
        this.connection = myConnect.connection
        this.debug = myConnect.debug
        this.tableName = tableName
        this.conditions = []
        this.groupConditions = [];
        this.fetchSql = false;
        return this
    }

    /**
     * limit the columns you want to select,use ',' to slice the columns
     * 限定查询列名，使用英文逗号分割
     * @param {string} fieldString 
     * @version 1.0.0
     * @returns MyQuery
     */
    field(fieldString) {
        this.fields = fieldString
        return this
    }

    /**
     * set up the where condition
     * 设置where条件，可多次调用
     * @param {string} column 
     * @param {string} exp 
     * @param {string} value 
     * @version 1.0.0
     * @returns MyQuery
     */
    where(column, exp, value) {
        // console.log(typeof value == 'string')
        let condition = (typeof value == 'string') ? `${column} ${exp} '${value}'` : `${column} ${exp} ${value}`
        this.conditions.push(condition)
        return this
    }

    /**
     * using condition array to setup the where condition
     * 使用数组进行where条件设置
     * @param {array} whereArray 
     * @version 1.0.0
     */
    map(whereArray) {
        this.conditions.push(...whereArray)
        return this
    }
    /**
     * set up the sort rule,like 'id desc','id asc'...
     * 设置排序规则，如"id desc"、"id asc"...
     * @param {string} sort 
     * @version 1.0.0
     * @returns MyQuery
     */
    order(sort) {
        this.sort = "ORDER BY " + sort
        return this
    }

    /**
     * limit the result rows you want to select, offset is not required
     * 限制返回条数，偏移量非必需
     * @param {integer} length 
     * @param {integer} offset 
     * @version 1.0.0
     * @returns MyQuery
     */
    limit(length, offset = 0) {
        this.limitStr = `LIMIT ${(offset || 0)}, ${length}`
        return this
    }

    /**
     * join method,only available with find and select
     * @param {string} tableName 
     * @param {string} onCondition 
     * @param {string} joinType 
     */
    join(tableName,onCondition,joinType='INNER'){
        this.joinStr = `${joinType} JOIN \`${tableName}\` ON ${onCondition} `
        return this
    }
    /**
     * group by field,only enabled in select method
     * GROUP BY ,只对select操作有效
     * @version 1.0.2
     * @param {string} field 
     */
    group(field){
        this.groupby = ` GROUP BY ${field}`
        return this
    }

    /**
     * set up the group condition 
     * 设置having条件
     * @param {string} column 
     * @param {string} exp 
     * @param {string||number||null} value 
     * @version 1.0.2
     * @returns MyQuery
     */
    having(column, exp, value) {
        // console.log(typeof value == 'string')
        let condition = (typeof value == 'string') ? `${column} ${exp} '${value}'` : `${column} ${exp} ${value}`
        this.groupConditions.push(condition)
        return this
    }

    /**
     * using condition array to setup the group condition
     * 使用数组进行group条件设置
     * @param {array} havingArray 
     * @version 1.0.0
     */
    have(havingArray) {
        this.groupConditions.push(...havingArray)
        return this
    }

    /**
     * 
     * @returns MyQuery
     */
    fetch(){
        this.fetchSql = true;
        return this
    }

    /**
     * return the first record under the rules you defind before
     * 返回你规则下的第一条数据
     * @version 1.0.0
     * @returns TextRow
     */
    find() {
        this.limitStr = `LIMIT 0, 1`
        let sql = this.#buildSelectSql()
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.query(sql,
                (err, results, fields) => {
                    if (err) reject(err)
                    else {
                        if (results.length) resolve(results[0])
                        else resolve(null)
                    }
                }
            );
        })
    }

    /**
     * return all the records under the rules you defind before
     * 返回你规则下的全部数据
     * @version 1.0.0
     * @returns TextRow[]
     */
    select() {
        let sql = this.#buildSelectSql()
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.query(sql,
                (err, results, fields) => {
                    if (err) reject(err)
                    else resolve(results)
                }
            );
        })
    }

    /**
     * update the records under your conditons
     * 更新通过where条件查询到的记录
     * @param {JSON} data 
     * @version 1.0.0
     * @returns Number
     */
    save(data) {
        let sql = this.#buildUpdateSql(data);
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.execute(sql,
                (err, result, fields) => {
                    if (err) reject(err)
                    else resolve(result.changedRows)
                }
            );
        })
    }

    /**
     * delete the records under your conditions
     * @version 1.0.0
     * @returns Number
     */
    delete() {
        let sql = this.#buildDeleteSql();
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.execute(sql,
                (err, result, fields) => {
                    if (err) reject(err)
                    else resolve(result.changedRows)
                }
            );
        })
    }

    /**
     * insert a new record
     * 插入新记录
     * @version 1.0.1
     * @param {JSON} data 
     */
    insert(data) {
        let sql = this.#buildInsertSql(data);
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.execute(sql,
                (err, result, fields) => {
                    if (err) reject(err)
                    else resolve(result.affectedRows)
                }
            );
        })
    }

    /**
     * return the count under the rules
     * 返回满足条件的记录条数
     * @returns number
     */
    count(){
        let sql = this.#buildCountSql()
        if (this.debug) console.log(`[easy_query] ${sql}`)
        if (this.fetchSql) return sql
        return new Promise((resolve, reject) => {
            this.connection.query(sql,
                (err, results, fields) => {
                    if (err) reject(err)
                    else{
                        resolve(results[0].easy_query_count)
                    }
                }
            );
        })
    }
    /**
     * quickly select records by page 
     * 快速分页查询，limit方法失效
     * @param {number} limit how many items per page
     * @param {number} page current page number
     */
    async page(limit , page){
        if (this.fetchSql) return "fetch method not avaliable on page method"
        let totalCount = await this.count()
        let totalPage = Math.ceil(totalCount/limit)
        let currentPage = page
        this.limit(limit,(page - 1)*limit)
        let list = await this.select();
        return {
            totalPage,currentPage,totalCount,list
        }
    }
    /**
     * private method:build the sql select string
     * 私有方法:组建查询语句
     * @returns string
     */
    #buildSelectSql() {
        let sql = 'SELECT ' + (this.fields || "*") + ' FROM `' + this.tableName + '` '
        if (this.joinStr) sql += this.joinStr
        if (this.conditions.length) sql += "WHERE " + this.conditions.join(" AND ")
        if (this.groupby) sql += this.groupby
        if (this.groupConditions.length && this.groupby) sql += " HAVING " + this.groupConditions.join(" AND ")
        if (this.sort) sql += " " + this.sort
        if (this.limitStr) sql += " " + this.limitStr
        return sql
    }

    /**
     * private method:build the sql count string
     * 私有方法:组建查询语句
     * @returns string
     */
     #buildCountSql() {
        let sql = 'SELECT count(1) as easy_query_count FROM `' + this.tableName + '` '
        if (this.conditions.length) sql += "WHERE " + this.conditions.join(" AND ")
        if (this.groupby) sql += this.groupby
        if (this.groupConditions.length && this.groupby) sql += " HAVING " + this.groupConditions.join(" AND ")
        return sql
    }

    /**
     * private method:build the sql select string
     * 私有方法:组建查询语句
     * @returns string
     */
    #buildUpdateSql(data) {
        let updateData = []
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                updateData.push(`${key} = '${data[key]}'`)
            }
        }
        let sql = 'UPDATE `' + this.tableName + '` SET ' + updateData.join(",") + " ";
        if (this.conditions.length) sql += "WHERE " + this.conditions.join(" AND ")
        return sql
    }

    /**
     * private method:build the sql delete string
     * 私有方法:组建删除语句
     * @returns String
     */
    #buildDeleteSql() {
        let sql = 'DELETE FROM `' + this.tableName + "` ";
        if (this.conditions.length) sql += "WHERE " + this.conditions.join(" AND ")
        return sql
    }

    #buildInsertSql(data) {
        let keys = []
        let values = []
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                if (data[key] !== null){
                    keys.push(key)
                    values.push("'" + data[key] + "'")
                }
            }
        }
        let sql = 'INSERT INTO `' + this.tableName + "`(`" + keys.join("`,`") + "`) values(" + values.join(",") + ")"
        return sql
    }
}
module.exports = MyConnect