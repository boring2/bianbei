'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
var Idea = AV.Object.extend('Idea')

// 查询 Idea 列表
router.get('/', function(req, res, next) {
	var query = new AV.Query(Idea)
	query.find().then(function(results) {
		res.send(results)
	}, function(err) {
		next(err)
	}).catch(next)
})

// 新增 idea 项目
router.post('/', function(req, res, next) {
	var versionNum = parseInt(req.body.versionNum) || 0
	var topicId = req.body.topicId
	var content = req.body.content
	console.log(topicId, content)
	var userPromise = AV.User.become(req.headers['x-lc-session'])
	var topicQuery = new AV.Query('Topic')
	var topicPromise = topicQuery.get(topicId, {useMasterKey: true})
	Promise.all([topicPromise, userPromise]).then((result) => {
		console.log('aaaaaaaa')
		var topic = result[0]
		var user = result[1]
		let defaultIdea = {
			topic: topic,
			content: content,
			user: user,
			like: 0,
			unlike: 0,
			report: 0,
			nextIdeas: [] //小于等于3
		}
		console.log('bbbbbbb')
		let idea = new Idea()
		idea.set(defaultIdea)
		var acl = aclGen.createUserAcl(user)
		idea.setACL(acl)
		return idea.save().then((idea) => {
			console.log('ccccc')
			res.send(idea)
		}).catch((err) => {
			console.log('error', err)
			next(err)
		})
	}).catch((e) => {
		console.log(e)
	})
})

module.exports = router
