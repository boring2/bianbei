'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var aclGen = require('../utils/acl')
var creator = require('../utils/creator')
var DM = require('../utils/constant').DM

router.get('/:id', function (req, res, next) {
  let id = req.params.id
  var query = new AV.Query(DM.Idea)
  query.include('user')
  query.get(id, {
    sessionToken: req.headers['x-lc-session']
  }).then((results) => {
    res.send(results)
  }).catch(next)
})

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
  /// 需要传入 versionId, topicId, preIdeaId, idea content, isCheckout
  let versionId = req.body.versionId
  let topicId = req.body.topicId
  let preIdeaId = req.body.preIdeaId
  let content = req.body.content
  let isCheckout = req.body.isCheckout
  let sessionToken = req.headers['x-lc-session']
  let userPromise = AV.User.become(sessionToken)
  let topicQuery = new AV.Query(DM.Topic)
  let topicPromise = topicQuery.get(topicId, {
    sessionToken: sessionToken
  })

  let versionQuery = new AV.Query(DM.Version)

  /// 如果没有verionId那应该也没有preIdeaId，判断topic versions length是否小于等于3，是的话追加一个新的version到topic上.
  if (!versionId && !preIdeaId) {
    AV.Promise.all([topicPromise, userPromise]).then(([topic, user]) => {
      let idea = creator.createIdea(topic, content, user)
      let version = creator.createVersion([idea], topic)
      if (topic.get('versions').length < 3) {
        topic.addUnique('versions', version)
        return topic.save(null, {
          sessionToken
        }).then(() => {
          res.send({
            idea, version
          })
        })
      } else {
        throw new Error('该主题已经有三个故事线了。')
      }
    }).catch((e) => {
      res.send({
        code: 405,
        msg: e.message
      })
    })
  } else {
    /// 有的话 判断是否checkout，不checkout, 追加在version的idea中
    let ideaQuery = new AV.Query(DM.Idea)
    let preIdeaPromise = ideaQuery.get(preIdeaId, {
      sessionToken
    })
    versionQuery.include('topic')
    versionQuery.include('ideas')
    let versionPromise = versionQuery.get(versionId, {
      sessionToken
    })
    let limitLength = 15
    /// 一个用户对一个topic的一个版本只能发言5次
    AV.Promise.all([userPromise, versionPromise]).then(([user, version]) => {
      let userIdeas = []
      let ideas = version.get('ideas')
      if (ideas.length > 50) {
        throw new Error('该故事已经完结')
      }
      ideas.forEach((idea) => {
        if (idea.get('user').id === user.id) {
          userIdeas.push(idea)
        }
      })

      if (userIdeas.length > limitLength - 1) {
        throw new Error('这个版本你已经贡献了5个想法了，请换一个版本试试。')
      } else {
        if (!isCheckout) {
          AV.Promise.all([preIdeaPromise]).then(([preIdea]) => {
            // 上一个idea的nextIdeas为空数组
            if (preIdea.get('nextIdeas').length === 0) {
              let topic = version.get('topic')
              let idea = creator.createIdea(topic, content, user)
              preIdea.addUnique('nextIdeas', idea)
              version.add('ideas', idea)
              return preIdea.save(null, {
                useMasterKey: true
              }).then(() => {
                return version.save(null, {
                  sessionToken
                })
              }).then(() => {
                res.send({idea})
                // res.send('感谢你贡献想法。')
              })
              /// 如果上一个idea有nextIdea字段， 则提示用户手慢了。
            } else {
              throw new Error('该版本已经被人捷足先登。你可以创建新的故事线。')
            }
          }).catch((e) => {
            res.send({
              code: 405,
              msg: e.message
            })
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
                return topic.save(null, {
                  sessionToken
                }).then(() => {
                  return preIdea.save(null, {
                    useMasterKey: true
                  })
                }).then(() => {
                  res.send({
                    idea,
                    version
                  })
                  res.send('成功创建新的故事线。')
                })
              } else {
                throw new Error('该主题已经有三个版本了，不能再创建新的故事线了。')
              }
              /// 如果上一个idea有nextIdea字段并且大于3， 则提示用户版本满了。
            } else {
              throw new Error('该主题已经有三个版本了，不能再创建新的故事线了。')
            }
          }).catch((e) => {
            res.send({
              code: 405,
              msg: e.message
            })
          })
        }
      }
    }).catch((e) => {
      res.send({
        code: 405,
        msg: e.message
      })
    })
  }
})

router.post('/user', (req, res, next) => {
  let versionId = req.body.versionId
  let sessionToken = req.headers['x-lc-session']
  let userPromise = AV.User.become(sessionToken)
  let versionQuery = new AV.Query(DM.Version)
  versionQuery.include('topic')
  versionQuery.include('ideas')
  let versionPromise = versionQuery.get(versionId, {
    sessionToken
  })
  AV.Promise.all([userPromise, versionPromise]).then(([user, version]) => {
    let userIdeas = []
    let ideas = version.get('ideas')
    ideas.forEach((idea) => {
      if (idea.get('user').id === user.id) {
        userIdeas.push(idea)
      }
    })
    res.send(userIdeas)
  }).catch(next)
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
  let messageMap = {
    like: '你已经赞过该想法了。',
    unlike: '你已经踩过该想法了。',
    report: '你已经举报过了。谢谢。'
  }
  let userType = type + 's'
  return function (req, res, next) {
    let id = req.query.id
    if (!id) {
      throw new Error('NO ID.')
    }
    let userPromise = AV.User.become(req.headers['x-lc-session'])
    let ideaQuery = new AV.Query(DM.Idea)
    var ideaPromise = ideaQuery.get(id, {sessionToken: req.headers['x-lc-session']})
    Promise.all([userPromise, ideaPromise]).then((result) => {
      let user = result[0]
      let idea = result[1]
      let likes = user.get(userType) || []
      likes = likes.filter((likeIdea) => {
        return likeIdea.id === idea.id
      })
      if (likes.length) {
        throw new Error(messageMap[type])
      }
      user.addUnique(userType, idea)
      idea.increment(type, 1)
      idea.fetchWhenSave = true

      return user.save(null, {useMasterKey: true})
    }).then((result) => {
      res.send('success')
    }).catch((e) => {
      res.send({
        code: 405,
        msg: e.message
      })
    })
  }
}

module.exports = router
