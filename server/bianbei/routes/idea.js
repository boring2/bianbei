'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
var Idea = AV.Object.extend('Idea')
var Topic = AV.Object.extend('Topic')
var Version = AV.Object.extend('Verion')

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
	///需要传入 versionId, topicId, preIdeaId, idea content, isCheckout
	var versionId = req.body.versionId
	var topicId = req.body.topicId
	var preIdeaId = req.body.preIdeaId
	var content = req.body.content
	var isCheckout = req.body.isCheckout
	var userPromise = AV.User.become(req.headers['x-lc-session'])
	var topicQuery = new AV.Query('Topic')
	var topicPromise = topicQuery.get(topicId, {sessionToken: req.headers['x-lc-session']})

	/// 如果没有verionId那应该也没有preIdeaId，判断topic versions length是否小于等于3，是的话追加一个新的version到topic上，
	if (!versionId && !preIdeaId) {
		topicPromise.then((topic) => {
			
		})
		///有的话 判断是否checkout，不checkout
	} else if (!isCheckout) {

		/// checkout
	} else {

	}
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
			nextIdea: undefined 
		}
		let idea = new Idea()
		console.log('111111111111111111')
		idea.set(defaultIdea)
		var acl = aclGen.createUserAcl(user)
		idea.setACL(acl)
		console.log('22222222222222')
		// idea.save()
		if (!preIdeaId) {
			console.log('noPretopicid')
			topic.add('versions', [idea])
			return topic.save(null, {
				useMasterKey: true
			}).then((re) => {
				res.send(re)
			}).catch((e) => {
				console.log('save topic error', e)
				res.send(e)
			})
		}
	}).catch((e) => {
		res.send(e)
	})
})

router.post('/checkout', (req, res, next) => {

})

// 点赞idea
router.post('/like', likeHander('like'))
// 点踩idea
router.post('/unlike', likeHander('unlike'))
// 举报idea
router.post('/report', likeHander('report'))

/**
 * 
 * @param {String} type "like", "unlike", "report"
 */
function likeHander (type) {
	let userType = type + "s"
	return function (req, res, next) {
		let id = req.query.id
		if (!id) {
			throw new Error('NO ID.')
		}
		let userPromise = AV.User.become(req.headers['x-lc-session'])
		let ideaQuery = new AV.Query(Idea)
		var ideaPromise = ideaQuery.get(id)
		Promise.all([userPromise, ideaPromise]).then((result) => {
			let user = result[0]
			let idea = result[1]
			let likes = user.get(userType) || []
			likes = likes.filter((likeIdea) => {
				return likeIdea.id === idea.id
			})
			if (likes.length) {
				throw new Error(`You have ${type} the idea.`)
			}
			user.addUnique(userType, idea)
			idea.increment(type, 1)
			idea.fetchWhenSave = true
			return user.save()
		}).then((result) => {
			res.send("success")
		}).catch((e) => {
			res.send(e.message)
		})
	}
}


module.exports = router
