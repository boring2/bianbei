'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
var Idea = AV.Object.extend('Idea')
var Topic = AV.Object.extend('Topic')
// 查询 Idea 列表
router.get('/', function(req, res, next) {
	var query = new AV.Query(Idea)
	query.find().then(function(results) {
		res.send(results)
	}, function(err) {
		next(err)
	}).catch(next)
})

router.get('/than', function(req, res, next) {
	let idea = AV.Object.createWithoutData('Idea', '5ad75172ee920a3f73359fd5')
	idea.increment('unlike', 1)
	idea.save(null, {
		fetchWhenSave: true,
		query: new AV.Query('Idea').lessThan('unlike', 5),
		sessionToken: req.headers['x-lc-session']
	}).then((re) => {
		res.send(re)
	}).catch((err)=> {
		console.log(err)
		res.send(err)
	})
})
// 新增 idea 项目
router.post('/', function(req, res, next) {
	var preIdeaId = req.body.preIdeaId
	var topicId = req.body.topicId
	var content = req.body.content
	console.log(topicId, content)
	var userPromise = AV.User.become(req.headers['x-lc-session'])
	var topicQuery = new AV.Query(Topic)
	var topicPromise = topicQuery.get(topicId, {useMasterKey: true})
	Promise.all([topicPromise, userPromise]).then((result) => {
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
		let idea = new Idea()
		console.log('111111111111111111')
		idea.set(defaultIdea)
		var acl = aclGen.createUserAcl(user)
		idea.setACL(acl)
		console.log('22222222222222')
		// idea.save()
		if (!preIdeaId) {
			// var newTopic = AV.Object.createWithoutData('Topic', topic.id)
			console.log('noPretopicid')
			topic.increment('versionCount', 1)
			return topic.save(null, {
				fetchWhenSave: true,
				query: new AV.Query('Topic').lessThan('versionCount', 3)
			}).then(() => {
				topic.add('versions', [idea])
				return topic.save()
			}).then((re) => {
				res.send(re)
			}).catch((e) => {
				console.log('save topic error', e.code)
				next()
			})
		}
		// return idea.save(null, {
		// 	query: new AV.Query('Idea').equalTo('unlike', 2)
		// }).then((idea) => {
		// 	res.send(idea)
		// }).catch((err) => {
		// 	console.log('error', err)
		// 	next(err)
		// })
	}).catch((e) => {
		console.log(e)
	})
})

module.exports = router
