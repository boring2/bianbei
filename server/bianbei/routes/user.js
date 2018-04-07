'use strict'
var router = require('express').Router()
var AV = require('leanengine')

// user login
router.post('/login', function(req, res) {
	// var username = req.body.username
	// var password = req.body.password
	// 新建 AVUser 对象实例
	//  var user = new AV.User()
	//  // 设置用户名
	//  user.setUsername('aaaa')
	//  // 设置密码
	//  user.setPassword('aaaa')

	//  user.signUp().then(function (loginedUser) {
	// 		 console.log(loginedUser)
	//  }, function (error) {
	// 	next(error)
	//  })

	AV.User.logIn(req.body.username, req.body.password).then(function(user) {
		res.saveCurrentUser(user) // 保存当前用户到 Cookie
		console.log(user)
		res.send({data: 'success'})
	}).catch((error) => {
		console.log(error)
		res.send(error)
	})
})



// 查看个人资料
router.get('/profile', function(req, res, next) {
	// 判断用户是否已经登录
	if (req.currentUser) {
		// 如果已经登录，发送当前登录用户信息。
		res.send(req.currentUser)
	} else {
		// 没有登录，跳转到登录页面。
		res.redirect('/login')
	}
	next()
})
// AV.User.signUp().then((user) => {
// 	user.set(userInfo)
// 	console.log('----', user)
// 	return user.save()
// }).then((user) => {
// 	res.send(user)
// }).catch(next)

module.exports = router
