'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var roleUtil = require('../utils/role')

/// boring1: Administrator khpogdlc6dwrqo2xlkysjoul6
/// boring2: Normal w7iugopw7t4p8o0u1dd0cfywq
/// boring3: Silent kveq9c5jser506kzzrvutgvib
/// boring4: Black fhjc4ozudc8qvkixfs6h5t8ks

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

router.post('/signup', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
	// 新建 AVUser 对象实例
  var user = new AV.User()
	// 设置用户名
  user.setUsername(username)
	// 设置密码
  user.setPassword(password)
  // 设置邮箱
  // user.setEmail('tom@leancloud.cn')
  user.signUp().then((loginedUser) => {
    res.send(loginedUser.getSessionToken())
  }).catch(e => {
    res.send(e)
  })
})

router.post('/setrole', (req, res, next) => {
  let roleName = req.body.roleName
  AV.User.become(req.headers['x-lc-session']).then(function(user) {
    return roleUtil.setUserRole(roleName, user, true)
  }).then(message => {
    res.send(message)
  }).catch(e => {
    res.send(e)
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

router.post('/username', function (req, res, next) {
  let username = req.body.username
  AV.User.become(req.headers['x-lc-session']).then(function(user) {
    console.log('-----------', user)
    user.set('username', username)
    return user.save(null, {sessionToken: req.headers['x-lc-session']})
  }).then((user) => {
    res.send(user)
  }).catch((e) => {
    res.send(e)
  })
})
/// get user role
router.get('/role', function (req, res, next) {
  AV.User.become(req.headers['x-lc-session']).then((user) => {
    return user.getRoles()
  }).then(function(roles) {
// roles 是一个 AV.Role 数组，这些 AV.Role 表示 user 拥有的角色
    res.send(roles)
  }).catch(next)
})

router.get('/type', function (req, res, next) {
  let roleName = req.query.name
  var roleQuery = new AV.Query(AV.Role)

  // 查询 name 等于 roleName 的角色
  roleQuery.equalTo('name', roleName)

  // 执行查询
  roleQuery.first().then(function(role) {
    var userRelation = role.relation('users')
    return userRelation.query().find({
      sessionToken: req.headers['x-lc-session']
    })
  }).then(function (userList) {
    // userList 就是拥有该角色权限的所有用户了。
    // var firstAdmin = userList[0]
    res.send(userList)
  }).catch(function(error) {
    console.log(error)
  })
  // var roleQuery = new AV.Query(AV.Role)
  // roleQuery.get('5af3aa0ca22b9d004460c38e').then((role) => {
  //   let userRelation = role.getUsers()
  //   let query = userRelation.query()
  //   return query.find({
  //     sessionToken: req.headers['x-lc-session']
  //   })
  // }).then((results) => {
  //   res.send(results)
  // }).catch(next)
})
module.exports = router
