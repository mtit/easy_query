const mysql = require('mysql2');
class MyConnect {
    constructor(options) {
        this.debug = options.debug||false
        this.connection = mysql.createConnection({
            host: options.host,
            user: options.user,
            database: options.database,
            password:options.password,
            pool:true,
        });
    }
    table(tableName){
        return new MyQuery(this,tableName)
    }
}
class MyQuery{
    /**
     * set up an instance of MyQuery
     * 实例化MyQuery对象
     * @param {MyConnect} myConnect 
     * @param {string} tableName 
     * @returns MyQuery
     */
    constructor(myConnect,tableName) {
        this.connection = myConnect.connection
        this.debug = myConnect.debug
        this.tableName = tableName
        this.conditions = []
        return this
    }

    /**
     * limit the columns you want to select,use ',' to slice the columns
     * 限定查询列名，使用英文逗号分割
     * @param {string} fieldString 
     * @returns MyQuery
     */
    field(fieldString){
        this.fields = fieldString
        return this
    }

    /**
     * set up the where condition
     * 设置where条件，可多次调用
     * @param {string} column 
     * @param {string} exp 
     * @param {string} value 
     * @returns MyQuery
     */
    where(column,exp,value){
        // console.log(typeof value == 'string')
        let condition = (typeof value  == 'string') ? `${column} ${exp} '${value}'` : `${column} ${exp} ${value}`
        this.conditions.push(condition)
        return this
    }

    /**
     * using condition array to setup the where condition
     * 使用数组进行where条件设置
     * @param {array} whereArray 
     */
    map(whereArray){
        this.conditions.push(...whereArray)
        return this
    }
    /**
     * set up the sort rule,like 'id desc','id asc'...
     * 设置排序规则，如"id desc"、"id asc"...
     * @param {string} sort 
     * @returns MyQuery
     */
    order(sort){
        this.sort = "ORDER BY " + sort
        return this
    }

    /**
     * limit the result rows you want to select, offset is not required
     * 限制返回条数，偏移量非必需
     * @param {integer} length 
     * @param {integer} offset 
     * @returns MyQuery
     */
    limit(length,offset=0){
        this.limitStr = `LIMIT ${(offset||0)}, ${length}`
        return this
    }
    

    /**
     * return the first record under the rules you defind before
     * 返回你规则下的第一条数据
     * @returns TextRow
     */
    find(){
        this.limitStr = `LIMIT 0, 1`
        let sql = this.#buildSelectSql()
        if(this.debug)console.log(`[easy_query] ${sql}`)
        return new Promise((resolve,reject)=>{
            this.connection.query(sql,
                    (err, results, fields)=>{
                    if(err) reject(err)
                    else{
                        if(results.length)  resolve(results[0])
                        else resolve(null)
                    }
                }
            );
        })
    }

    /**
     * return all the records under the rules you defind before
     * 返回你规则下的全部数据
     * @returns TextRow[]
     */
    select(){
        let sql = this.#buildSelectSql()
        if(this.debug)console.log(`[easy_query] ${sql}`)
        return new Promise((resolve,reject)=>{
            this.connection.query(sql,
                    (err, results, fields)=>{
                    if(err) reject(err)
                    else resolve(results)
                }
            );
        })
    }

    /**
     * update the records under your conditons
     * 更新通过where条件查询到的记录
     * @param {JSON} data 
     * @returns Number
     */
    save(data){
        let sql = this.#buildUpdateSql(data);
        if(this.debug)console.log(`[easy_query] ${sql}`)
        return new Promise((resolve,reject)=>{
            this.connection.execute(sql,
                    (err, result, fields)=>{
                    if(err) reject(err)
                    else resolve(result.changedRows)
                }
            );
        })
    }

    /**
     * delete the records under your conditions
     * @returns Number
     */
    delete(){
        let sql = this.#buildDeleteSql();
        if(this.debug)console.log(`[easy_query] ${sql}`)
        return new Promise((resolve,reject)=>{
            this.connection.execute(sql,
                    (err, result, fields)=>{
                    if(err) reject(err)
                    else resolve(result.changedRows)
                }
            );
        })
    }

    /**
     * private method:build the sql select string
     * 私有方法:组建查询语句
     * @returns string
     */
     #buildSelectSql(){
        let sql = 'SELECT ' + (this.fields||"*") + ' FROM `'+ this.tableName +'` '
        if(this.conditions.length) sql += "WHERE "+this.conditions.join(" AND ")
        if(this.sort) sql += " "+this.sort
        if(this.limitStr) sql += " "+ this.limitStr
        return sql
    }

    /**
     * private method:build the sql select string
     * 私有方法:组建查询语句
     * @returns string
     */
     #buildUpdateSql(data){
        let updateData = []
        for (const key in data) {
            if (Object.hasOwnProperty.call(data, key)) {
                updateData.push(`${key} = '${data[key]}'`)
            }
        }
        let sql = 'UPDATE `'+ this.tableName +'` SET '+ updateData.join(",") + " ";
        if(this.conditions.length) sql += "WHERE "+this.conditions.join(" AND ")
        return sql
    }

    /**
     * private method:build the sql delete string
     * 私有方法:组建删除语句
     * @returns String
     */
    #buildDeleteSql(){
        let sql = 'DELETE FROM `'+ this.tableName + " ";
        if(this.conditions.length) sql += "WHERE "+this.conditions.join(" AND ")
        return sql
    }
}
module.exports = MyConnect