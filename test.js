const EasyQuery = require('./index')
const myQuery = new EasyQuery({
    host: "127.0.0.1",      // the mysql host
    port: "3306",
    user: "root",           // the mysql user
    database: "test",    // the database you will use
    password: "root",   // the password
    debug:true              // true means the built sql string will be printed in the console
})

// .table method must use first             // .table方法必须首先使用
// .where method can use many times         // .where方法可以多次使用



const doFind = async () => {
    const res = await myQuery.table('profile').field('id,name,gender,phone').order('id desc').find()
    console.log(res)
}
// doFind()

const doSelect = async () => {
    const res1 = await myQuery.table('profile').field('gender,count(1) as cnt').where('id','<',400).group('gender').having('cnt','>',150).fetch().select()
    console.log(res1)
    // const res2 = await myQuery.table('profile').map(["gender = '女'","id BETWEEN 30 AND 300"]).limit(3).select()
    // console.log(res2)
}
// doSelect()

const doUpdate = async () =>{
    const res = await myQuery.table('profile').where('gender','=','女').where('id','<',"30").save({gender:"女"})
    console.log(res)
}
// doUpdate()

const doDelete = async () =>{
    const res = await myQuery.table('profile').where('gender','=','女').where('id','<',"30").delete()
    console.log(res)
}
// doDelete()

const doInsert = async () => {
    const res = await myQuery.table('profile').insert({
        id:1,
        wxUserid:0,
        name:"测试",
        remark:null
    })
    console.log(res)
}

// doInsert()

const doCount = async () => {
    const res1 = await myQuery.table('profile').where('id','<',400).where('gender','=','女').count();
    console.log(res1)
    // const res2 = await myQuery.table('profile').map(["gender = '女'","id BETWEEN 30 AND 300"]).limit(3).select()
    // console.log(res2)
}
// doCount()

const doPage = async () =>{
    const res1 = await myQuery.table('profile').where('id','<',400).where('gender','=','女').page(20,3);
    console.log(res1)
}
// doPage()

const withJoin = async () => {
    const res = await myQuery.table('image').join('poster','poster.id = image.pid','LEFT').where('image.id','<',35).select();
    console.log(res)
}
withJoin()