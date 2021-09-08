* Why make this
> Sometimes for some small projects, we do not need to synchronize the database by model setting, but only add, delete, modify and query. We do not need to use the ORM framework, so we get this library.

* How to use this

initialization
``` javascript
const EasyQuery = require('easy_query')
const myQuery = new EasyQuery({
    host: "127.0.0.1",      // the mysql host
    user: "root",           // the mysql user
    database: "test",    // the database you will use
    password: "root",   // the password
    debug:true              // true means the built sql string will be printed in the console
})
```

select
```javascript
const res1 = await myQuery.table('profile').field('id,name,gender,phone').where('id','<',100).order('id desc').limit(3).select()
console.log(res1)
```

find
```javascript
const res = await myQuery.table('profile').field('id,name,gender,phone').where('id','<',100).find()
console.log(res)
```

update
```javascript
const res = await myQuery.table('profile').where('id','<',100).save({gender:"女"})
console.log(res)
```

delete
```javascript
const res = await myQuery.table('profile').where('id','<',100).delete()
console.log(res)    // the changedRows
```