import { createInterface } from "readline";

/// 表声明
export var Topic = AV.Object.extend('Topic')
export var User = AV.Object.extend('User')
export var Idea = AV.Object.extend('Idea')
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
const USER_ROLE = {
  ADMIN: 'admin',
  NORMAL: 'normal',
  VISITOR: 'visitor',
  SILENT: 'silent',
  BLACK: 'black'
}

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
