[![npm version](https://img.shields.io/npm/v/easier_query.svg?style=flat-square)](https://www.npmjs.org/package/easier_query)
[![npm downloads](https://img.shields.io/npm/dm/easier_query.svg?style=flat-square)](http://npm-stat.com/charts.html?package=easier_query)
[![install size](https://packagephobia.now.sh/badge?p=easier_query)](https://packagephobia.now.sh/result?p=easier_query)

## Why make this
> Sometimes, for some small projects, we do not need to synchronize the table by model setting, just add, delete, modify and query. We do not need to use the ORM framework, so we get this library.



## Installation
``` shell
npm i easier_query
```

## Usage
### Initialization
``` javascript
const EasyQuery = require('easier_query')
const myQuery = new EasyQuery({
    host: "127.0.0.1",      // the mysql host
    user: "root",           // the mysql user
    port: "3306",           // the mysql server port
    database: "test",       // the database you will use
    password: "root",       // the password
    debug:true              // true means the built sql string will be printed in the console
})
```
### query
``` javascript
const res = await myQuery.query("select id,name,gender from profile order by id asc limit 10")
console.log(res)
```

### execute
``` javascript
const res = await myQuery.execute("delete from profile where id = 20")
console.log(res)
```

### select
``` javascript
const res1 = await myQuery.table('profile').field('id,name,gender,phone').where('id','<',100).order('id desc').limit(3).select()
console.log(res1)
// group select
const res2 = await myQuery.table('profile').field('gender,count(1) as cnt').group('gender').having('cnt','>',3).select()
console.log(res2)
```

### find
``` javascript
const res = await myQuery.table('profile').field('id,name,gender,phone').where('id','<',100).find()
console.log(res)
```

### update
``` javascript
const res = await myQuery.table('profile').where('id','<',100).save({gender:"female"})
console.log(res)
```

### delete
``` javascript
const res = await myQuery.table('profile').where('id','<',100).delete()
console.log(res)    // the changedRows
```

### insert
``` javascript
let data = {
    name:"lucy",
    age:"18",
    gender:"female"
}
const res = await myQuery.table('profile').insert(data)
console.log(res)    // the affectedRows
```

### fetch
> fecth() must be used before find、select、delete、save、insert
``` javascript
let data = {
    name:"lucy",
    age:"18",
    gender:"female"
}
const res =  myQuery.table('profile').fetch().insert(data)
console.log(res)    // return the sql string
```

* version 1.0.3
### count
``` javascript
const res1 = await myQuery.table('profile').where('id','<',400).where('gender','=','女').count();
console.log(res1)
```

### page
``` javascript
const res1 = await myQuery.table('profile').where('id','<',400).where('gender','=','女').page(20,3);
console.log(res1)
```

### join
*notice that the column name may be ambiguous.*
```javascript
const withJoin = async () => {
    const res = await myQuery.table('image').join('poster','poster.id = image.pid','LEFT').where('image.id','<',35).select();
    console.log(res)
}
withJoin()
```


## Changelog
* 1.0.7
> fixed the `delete` bug.
* 1.0.6
> add `query` and `execute` method, and it seems to be the final edition. focus on bug fixing.
* 1.0.5
> add `join` method
* 1.0.4
> add `port` option,and make ide hinting code
* 1.0.3
> add  `count` and `page` method
* 1.0.2
> add `group` , `fetch` , `having` and `have` method

## Motto
***Manners Maketh Man***