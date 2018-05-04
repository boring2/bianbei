var AV = require('leanengine')
var USER_ROLE = require('./constant').USER_ROLE
var USER_ROLE_CONSTANT = require('./constant').USER_ROLE_CONSTANT
/// 创建所有角色
function createRoles () {
  let ps = []
	for (var i in USER_ROLE) {
		var roleObj = USER_ROLE[i]
		var roleAcl = new AV.ACL()
		roleAcl.setPublicReadAccess(roleObj.read)
    roleAcl.setPublicWriteAccess(roleObj.write)
    var role = new AV.Role(roleObj.name, roleAcl)
		ps.push(role.save(null, {useMasterKey: true}))
  }
  AV.Promise.all(ps).then(([adminRole, normalRole]) => {
    var roleAcl = new AV.ACL()
    roleAcl.setPublicReadAccess(true)
    roleAcl.setPublicWriteAccess(false)
    roleAcl.setRoleWriteAccess(adminRole, true)
    normalRole.getRoles().add(adminRole)
    adminRole.setACL(roleAcl)
    return adminRole.save(null, {useMasterKey: true})
  }).then((adminRole) => {
    console.log('------------', adminRole)
  }).catch((e) => {
    console.log(e)
  })
}

/// 获取Role
function getRole(roleName) {
	return new Promise((resolve, reject) => {
		var roleQuery = new AV.Query(AV.Role)
		roleQuery.equalTo('name', roleName)
		roleQuery.find({useMasterKey: true}).then((results) => {
			if(results.length) {
				console.log(`get the role -- ${roleName}`)
				resolve(results[0])
			} else {
				console.log(`has no the role -- ${roleName}`)
				resolve()
			}
		}).catch((error) => {
			console.error('getRole error', error)
			reject(error)
		})
	})
}

/// 查询用户是否拥有某角色
function checkUserInRole (roleName, user) {
  user = user || AV.User.current()
  var roleQuery = new AV.Query(AV.Role)
  roleQuery.equalTo('name', roleName)
	roleQuery.equalTo('users', user)
	return new Promise((resolve, reject) => {
		roleQuery.find({useMasterKey: true}).then((roles) => {
			if (roles.length > 0) {
				console.log('user in role --', roleName)
				resolve(true)
			} else {
				console.log('user not in role --', roleName)
				resolve(false)
			}
		}).catch((error) => {
			console.error('checkUserInRole --', error)
			reject(error)
		})
	})
}

/// 设置用户角色
function setUserRole(roleName, user, isUseMasterKey) {
	var user = user || AV.User.current()
	return new Promise((resolve, reject) => {
		getRole(roleName).then((role) => {
			checkUserInRole(roleName, user).then((isIn) => {
				if (!isIn) {
					console.log(role, '----')
					role.getUsers().add(user)
					return role.save(null, {useMasterKey: isUseMasterKey})
				} else {
					resolve("role has been set")
					return
				}
			}).then((role) => {
				if (role) {
          resolve('role set success')
					console.log('role set success')
				} else {
          resolve('role has been set')
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

module.exports = {
  createRoles,
  setUserRole
}