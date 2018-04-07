const AV = require('../libs/av-weapp-min.js')
import { USER_ROLE } from './constant.js'

/// 创建所有角色
function createRoles () {
	for (var i in USER_ROLE) {
		var roleObj = USER_ROLE[i]
		var roleAcl = new AV.ACL()
		roleAcl.setPublicReadAccess(roleObj.read)
		roleAcl.setPublicWriteAccess(roleObj.write)
		var role = new AV.Role(roleObj.name, roleAcl)
		role.save().then(function (role) {
			console.log('创建成功')
		}).catch(function (error) {
			console.log('----', error)
		})
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
			console.error('getRole error', error)
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
				console.log('user in role --', role)
				resolve(true)
			} else {
				console.log('user not in role --', role)
				resolve(false)
			}
		}).catch((error) => {
			console.error('checkUserInRole --', error)
			reject(error)
		})
	})
}

/// 设置用户角色
function setUserRole(roleName) {
	var user = AV.User.current()
	return new Promise((resolve, reject) => {
		getRole(roleName).then((role) => {
			checkUserInRole(role, user).then((isIn) => {
				if (!isIn) {
					console.log(role, '----')
					role.getUsers().add(user)
					return role.save()
				} else {
					resolve(role)
					return
				}
			}).then((role) => {
				resolve(role)
				if (role) {
					console.log('role set success')
				} else {
					console.log('role has been set')
				}

			}).catch((error) => {
				reject(error)
				console.error('role set error --', error)
			})
		}).catch((error) => {
			reject(error)
			console.error('setUserRole error', error)
		})
	})
}

function isRole(user, roleName) {
	try {
		var localRoleName = wx.getStorageSync('role')
		if (localRoleName === USER_ROLE.ADMIN.name || localRoleName === roleName) {
			return true
		}
		return false
	} catch (e) {
		console.error('isRole error', e)
	}
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

function _generateRoleACL (roleName) {
	var role = new AV.Role(roleName)
	var acl = new AV.ACL()
	acl.setPublicReadAccess(true)
	acl.setPublicWriteAccess(false)
	acl.setRoleWriteAccess(role, true)
	return acl
}

function _generateUserACL(user) {
	var acl = new AV.ACL()
	acl.setPublicReadAccess(true)
	acl.setPublicWriteAccess(false)
	acl.setWriteAccess(user, true)
	return acl
}
/**
创建topic
Topic {
	content: "第一个话题"，
	user: $user,
	versions: [[], [], []] // length <= 3
}
*/
function createTopic(content, user) {
	user = user || AV.User.current()
	let defaultTopic = {
		content: content,
		user: user,
		versions: []
	}
	let topic = new Topic()
	topic.set(defaultTopic)
	if (isRole(user, USER_ROLE.ADMIN.name)) {
		let acl = _generateRoleACL(USER_ROLE.ADMIN.name)
		topic.setACL(acl)
		return topic.save()
	} else {
		console.error('user has no permission to create topic')
	}
}

function getTopic() {
	let query = new AV.Query(Topic)
	return query.find()
}

function createNewVersion (versions, ideaNum) {
	if (versions.length >= 3) {
		console.error('you can\'t create version greater than 3')
		return
	}
	if (versions.length === 0) {
		versions[0] = []
		return versions
	} else if (versions.length < versionNum) {
		// versions[]
	}

}
/**
 * 创建Idea
 * let idea = {
    topic: $topic,
    content: "content",
    user: $user,
    like: 0,
    unlike: 0,
    report: 0,
    nextIdeas: [“idea的引用”]   //小于等于3
  }
 * versionNum 0,1,2
 */

function createIdea (topic, content, versionNum) {
	let user = AV.User.current()
	versionNum = parseInt(versionNum) || 0
	if (versionNum > 2) {
		console.error('version number can\'t greater than 2')
		return
	}
	if (!content || content.trim() === '') {
		console.error('请输入content')
		return
	}

	let defaultIdea = {
		topic: topic,
		content: content,
		user: user,
		like: 0,
		unlike: 0,
		report: 0,
		nextIdeas: [] //小于等于3
	}
	let versions = topic.get('versions')
	if (!versions[versionNum]) {
		versions[versionNum] = []
	}

	let idea = new Idea()
	idea.set(defaultIdea)
	versions[versionNum].push(idea)
	if (isRole(user, USER_ROLE.NORMAL.name)) {
		let acl = _generateRoleACL(USER_ROLE.NORMAL.name)
		idea.setACL(acl)
		return idea.save()
	} else {
		console.error('user has no permission to create idea')
	}
}
module.exports = {
	createTopic,
	getTopic,
	createIdea,
	createUser,
	createRoles,
	getRole,
	checkUserInRole,
	setUserRole
}
