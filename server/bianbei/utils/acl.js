var AV = require('leanengine')

var aclGen = {
	createRoleACL (roleName) {
		var acl = new AV.ACL()
		acl.setPublicReadAccess(true)
		acl.setPublicWriteAccess(false)
		acl.setRoleWriteAccess(roleName, true)
		return acl
	},
	createUserAcl (user) {
		var acl = new AV.ACL()
		acl.setPublicReadAccess(true)
		acl.setPublicWriteAccess(false)
		acl.setWriteAccess(user, true)
		return acl
	}
}

module.exports = aclGen