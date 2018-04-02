import { createInterface } from "readline";

/// 表声明
export var Topic = AV.Object.extend('Topic')
export var User = AV.Object.extend('User')
export var Idea = AV.Object.extend('Idea')

const USER_ROLE = {
  ADMIN: 'Admin',
  NORMAL: 'Normal',
  VISITOR: 'Visitor',
  SILENT: 'Silent',
  BLACK: 'Black'
}
// 创建所有角色
for (role in USER_ROLE) {

}
// 创建管理员
var adminRoleAcl = new AV.ACL();
adminRoleAcl.setPublicReadAccess(true);
adminRoleAcl.setPublicWriteAccess(false);
var administratorRole = new AV.Role(USER_ROLE.ADMIN, adminRoleAcl);
administratorRole.save().then(function (role) {
  console.log("创建管理员成功")
}).catch(function (error) {
  console.log('----', error);
});

// 创建普通用户
var normalRoleAcl = new AV.ACL();
normalRoleAcl.setPublicReadAccess(true);
normalRoleAcl.setPublicWriteAccess(false);
var administratorRole = new AV.Role(USER_ROLE.NORMAL, normalRoleAcl);
administratorRole.save().then(function (role) {
  console.log("创建普通用户成功")
}).catch(function (error) {
  console.log('----', error);
});


/**
 * 创建user
 * User {
 *  name: "小明"
 *  role: "normal",
 *  likedIdeas: [],
 *  unlikedIdeas: [],
 *  reportedIdeas: []
 * }
 */

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
let me = createUser('boring', USER_ROLE.ADMIN)
let xiaoming = createUser('小明', USER_ROLE.NORMAL)

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
      console.error("create topic fail")
    })
  } else {
    console.error('user has no permission')
  }
}
createTopic('第一个主题', boring)
createTopic('第二个主题', xiaoming)
