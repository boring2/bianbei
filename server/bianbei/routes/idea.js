'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
var creator = require('../utils/creator')
var DM = require('../utils/constant').DM
// 查询 Idea 列表
router.get('/', function (req, res, next) {
	var query = new AV.Query(DM.Idea)
	query.find().then(function (results) {
		res.send(results)
	}, function (err) {
		next(err)
	}).catch(next)
})

router.get('/than', function (req, res, next) {
	let idea = AV.Object.createWithoutData(DM.Idea, '5ad75172ee920a3f73359fd5')
	idea.increment('unlike', 1)
	idea.save(null, {
		fetchWhenSave: true,
		query: new AV.Query(DM.Idea).lessThan('unlike', 5),
		sessionToken: req.headers['x-lc-session']
	}).then((re) => {
		res.send(re)
	}).catch((err) => {
		console.log(err)
		res.send(err)
	})
})
// 新增 idea 项目
router.post('/', function (req, res, next) {
	///需要传入 versionId, topicId, preIdeaId, idea content, isCheckout
	let versionId = req.body.versionId
	let topicId = req.body.topicId
	let preIdeaId = req.body.preIdeaId
	let content = req.body.content
	let isCheckout = req.body.isCheckout
	let sessionToken = req.headers['x-lc-session']
	let userPromise = AV.User.become(sessionToken)
	let topicQuery = new AV.Query(DM.Topic)
	let topicPromise = topicQuery.get(topicId, { sessionToken: sessionToken })
	console.log("------------")
	let versionQuery = new AV.Query(DM.Version)

	/// 如果没有verionId那应该也没有preIdeaId，判断topic versions length是否小于等于3，是的话追加一个新的version到topic上.
	if (!versionId && !preIdeaId) {
		AV.Promise.all([topicPromise, userPromise]).then(([topic, user]) => {
			let idea = creator.createIdea(topic, content, user)
			let version = creator.createVersion([idea], topic)
			if (topic.get('versions').length < 3) {
				topic.addUnique('versions', version)
				return topic.save(null, { sessionToken })
			} else {
				throw '该主题已经有三个故事线了。'
			}
		}).then((topic) => {
			res.send(topic)
		}).catch((e) => {
			console.log("----------", e)
			res.send(e)
		})

	} else {
		///有的话 判断是否checkout，不checkout, 追加在version的idea中
		let ideaQuery = new AV.Query(DM.Idea)
		let preIdeaPromise = ideaQuery.get(preIdeaId, { sessionToken })
		versionQuery.include('topic')
		versionQuery.include('ideas')
		let versionPromise = versionQuery.get(versionId, { sessionToken })
		let limitLength = 5
		/// 一个用户对一个topic的一个版本只能发言5次
		AV.Promise.all([userPromise, versionPromise]).then(([user, version]) => {
			let userIdeas = []
			let ideas = version.get('ideas')
			ideas.forEach((idea) => {
				if (idea.get('user').id === user.id) {
					userIdeas.push(idea)
				}
			})
			if (userIdeas.length > limitLength - 1) {
				throw '这个版本你已经贡献了5个想法了，请换一个版本试试。'
			} else {
				if (!isCheckout) {
					AV.Promise.all([preIdeaPromise]).then(([preIdea]) => {
						// 上一个idea的nextIdeas为空数组
						if (preIdea.get('nextIdeas').length === 0) {
							let topic = version.get('topic')
							let idea = creator.createIdea(topic, content, user)
							preIdea.addUnique('nextIdeas', idea)
							version.add('ideas', idea)
							return preIdea.save(null, { useMasterKey: true })
								.then(() => {
									return version.save(null, { sessionToken })
								}).then(() => {
									res.send('感谢你贡献想法。')
								})
							/// 如果上一个idea有nextIdea字段， 则提示用户手慢了。
						} else {
							throw '该版本已经被人捷足先登。你可以创建新的故事线。'
						}
					}).catch((e) => {
						console.log('-------- create idea error no checkout', e)
						res.send(e)
					})
				} else {
					/// 如果有带checkout参数。
					AV.Promise.all([versionPromise, preIdeaPromise]).then(([oldVersion, preIdea]) => {
						if (preIdea.get('nextIdeas').length < 3) {
							let oldIdeas = oldVersion.get('ideas')
							let topic = oldVersion.get('topic')
							let idea = creator.createIdea(topic, content, user)
							let newIdeas = oldIdeas.slice(0, -1)
							newIdeas.push(idea)
							let version = creator.createVersion(newIdeas, topic)
							preIdea.addUnique('nextIdeas', idea)
							if (topic.get('versions').length < 3) {
								topic.addUnique('versions', version)
								return topic.save(null, { sessionToken }).then(() => {
									return preIdea.save(null, { useMasterKey: true })
								}).then(() => {
									res.send('成功创建新的故事线。')
								})
							} else {
								throw 'Topic has three versions.'
							}
							/// 如果上一个idea有nextIdea字段并且大于3， 则提示用户版本满了。
						} else {
							throw '该主题已经有三个版本了，不能再创建新的故事线了。'
						}
					}).catch((e) => {
						console.log('999999999', e)
						res.send(e)
					})
				}
			}
		}).catch((e) => {
			console.log("get ideas error", e)
			res.send(e)
		})
	}
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
function likeHander(type) {
	let userType = type + "s"
	return function (req, res, next) {
		let id = req.query.id
		if (!id) {
			throw new Error('NO ID.')
		}
		let userPromise = AV.User.become(req.headers['x-lc-session'])
		let ideaQuery = new AV.Query(DM.Idea)
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
