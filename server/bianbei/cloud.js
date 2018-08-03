var AV = require('leanengine')
var checker = require('./utils/checker')
const { USER_ROLE_CONSTANT } = require('./utils/constant')
/**
 * 一个简单的云代码方法
 */
// AV.Cloud.define('hello', function(request) {
//   return 'Hello world!'
// })

// AV.Cloud.beforeSave('Topic', function(request) {
//   var user = request.currentUser
//   if (!user) {
//     throw new AV.Cloud.Error('没有登录')
//   }
//   return checker.isUserInRole(user, USER_ROLE_CONSTANT.ADMIN).then((isIn) => {
//     if (!isIn) {
//       throw new AV.Cloud.Error('你不是管理员')
//     }
//   }).catch(e => {
//     res.send({
//       code: e.code,
//       msg: e.rawMessage
//     })
//   })
// })
