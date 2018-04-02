const AV = require('../libs/av-weapp-min.js');
const CONSTANT = require('./constant.js')

/// 表声明
var Topic = AV.Object.extend('Topic')
var User = AV.Object.extend('User')
var Idea = AV.Object.extend('Idea')

function createUser(name, role) {
  role = role || CONSTANT.USER_ROLE.NORMAL
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
  if (user.get('role') === CONSTANT.USER_ROLE.ADMIN) {
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
  'createTopic': createTopic,
  'createUser': createUser
}
