const AV = require('../libs/av-weapp-min.js');
import { USER_ROLE } from './constant.js'

/// 创建所有角色
function createRoles () {
  for (var i in USER_ROLE) {
    var roleObj = USER_ROLE[i]
    var roleAcl = new AV.ACL();
    roleAcl.setPublicReadAccess(roleObj.read);
    roleAcl.setPublicWriteAccess(roleObj.write);
    var role = new AV.Role(roleObj.name, roleAcl);
    role.save().then(function (role) {
      console.log('创建成功')
    }).catch(function (error) {
      console.log('----', error);
    });
  }
}

/// 获取Role
function getRole(roleName) {
  return new Promise((resolve, reject) => {
    var roleQuery = new AV.Query(AV.Role)
    roleQuery.equalTo('name', roleName)
    roleQuery.find().then((results) => {
      if(results.length) {
        console.log(`get the role -- ${roleName}`)
        resolve(results[0])
      } else {
        console.log(`has no the role -- ${roleName}`)
        reject()
      }
    }).catch((error) => {
      console.error("getRole error", error)
      reject(error)
    }) 
  })
}

/// 查询用户是否拥有某角色
function checkUserInRole (role, user) {
  user = user || AV.User.current()
  var roleQuery = new AV.Query(AV.Role)
  roleQuery.equalTo('users', user)
  return new Promise((resolve, reject) => {
    roleQuery.find().then((roles) => {
      let filtered = roles.filter(value => value.getName() === role.getName())
      if (filtered.length) {
        console.log("user in role --", role)
        resolve(true)
      } else {
        console.log("user not in role --", role)
        resolve(false)
      }
    }).catch((error) => {
      console.error("checkUserInRole --", error)
      reject(error)
    })
  })
}

/// 设置用户角色
function setUserRole(roleName) {
  var user = AV.User.current()
  getRole(roleName).then((role) => {
    checkUserInRole(role, user).then((isIn) => {
      if (!isIn) {
        console.log(role, '----')
        role.getUsers().add(user)
        return role.save()
      } else {
        return 
      }
    }).then((role) => {
      if (role) { 
        console.log("role set success")
      } else {
        console.log("role has been set")
      }
      
    }).catch((error) => {
      console.error("role set error --", error)
    })
  }).catch((error) => {
    console.error("setUserRole error", error)
  })
}

/// 表声明
var Topic = AV.Object.extend('Topic')
var User = AV.Object.extend('User')
var Idea = AV.Object.extend('Idea')

function createUser(name, role) {
  role = role || USER_ROLE.NORMAL
  var user = new User()
  user.set('name', name)
  user.set('role', role)
  user.set('likedIdeas', [])
  user.set('unlikedIdeas', [])
  user.set('reportedIdeas', [])
  return user
}

/**
创建topic
Topic {
	content: "第一个话题"，
	user: $userReference,
	versions: [[], [], []] // length <= 3
}
*/
function createTopic(content, user) {
  let topic = new Topic()
  topic.set('content', content)
  topic.set('user', user)
  if (user.get('role') === USER_ROLE.ADMIN) {
    topic.save().then(() => {
      console.log("Topic create success")
    }, (error) => {
      console.error("create topic fail", error)
    })
  } else {
    console.error('user has no permission')
  }
}

module.exports = {
  createTopic,
  createUser,
  createRoles,
  getRole,
  checkUserInRole,
  setUserRole
}
