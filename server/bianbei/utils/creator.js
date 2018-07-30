var AV = require('leanengine')
var aclGen = require('./acl')
var USER_ROLE_CONSTANT = require('./constant').USER_ROLE_CONSTANT
var Topic = AV.Object.extend('Topic')
var Idea = AV.Object.extend('Idea')
var Version = AV.Object.extend('Version')

module.exports = {
  createTopic(content, user) {
    let defaultTopic = {
      content: content,
      user: user,
      versions: []
    }
    var topic = new Topic()
    var acl = aclGen.createRoleACL(USER_ROLE_CONSTANT.NORMAL)
    topic.set(defaultTopic)
    topic.setACL(acl)
    return topic
  },

  createIdea(topic, content, user) {
    let defaultIdea = {
      topic: topic,
      content: content,
      user: user,
      like: 0,
      unlike: 0,
      report: 0,
      nextIdeas: []
    }
    let idea = new Idea()
    idea.set(defaultIdea)
    var acl = aclGen.createUserAcl(user)
    idea.setACL(acl)
    return idea
  },

  createVersion(ideas, topic) {
    let defaultVersion = {
      ideas: ideas,
      topic: topic
    }
    let version = new Version()
    version.set(defaultVersion)
    var acl = aclGen.createRoleACL(USER_ROLE_CONSTANT.NORMAL)
    version.setACL(acl)
    return version
  }

}
