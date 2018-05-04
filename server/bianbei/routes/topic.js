'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
const USER_ROLE = require('../utils/constant')

var Topic = AV.Object.extend('Topic')

router.get('/than3', function(req, res, next) {
	var query = new AV.Query(Topic)
	query.lessThan('versionCount', 50)
	query.find().then(function(results) {
		res.send(results)
	}).catch(next)
})

// 查询 Topic 列表
router.get('/', function(req, res, next) {
	var query = new AV.Query(Topic)
	query.find().then(function(results) {
		res.send(results)
	}).catch(next)
})

// 新增 Topic 项目
router.post('/', function(req, res, next) {
	var content = req.body.content
	AV.User.become(req.headers['x-lc-session']).then(function(user) {
		let defaultTopic = {
			content: content,
			user: user,
			versions: []
		}
		var topic = new Topic()
		var acl = aclGen.createRoleACL(USER_ROLE.ADMIN)
		topic.set(defaultTopic)
		topic.setACL(acl)
		return topic.save(null, {sessionToken:req.headers['x-lc-session']})
	}).then(function(topic) {
		res.send(topic)
	}).catch(next)
})

module.exports = router
