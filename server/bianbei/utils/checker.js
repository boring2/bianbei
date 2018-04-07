module.exports = {
	isUserInRole(user, roleName) {
		return new Promise((resolve, reject) => {
			return user.getRoles().then(function (roles) {
				var filtered = roles.filter(value => value.getName() === roleName)
				filtered.length ? resolve(true) : resolve(false)
			}).catch(reject)
		})
	}
}
