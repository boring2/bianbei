'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var creator = require('../utils/creator')
var aclGen = require('../utils/acl')
const USER_ROLE_CONSTANT = require('../utils/constant')
.USER_ROLE_CONSTANT
const { MyError } = require('../utils/myerror')
console.log(MyError)
var Topic = AV.Object.extend('Topic')

router.get('/than3', function(req, res, next) {
  var query = new AV.Query(Topic)
  query.lessThan('versionCount', 50)
  query.find().then(function(results) {
    res.send(results)
  }).catch((e) => {
    res.send(e)
  })
})

router.get('/today', function(req, res, next) {
  var query = new AV.Query(Topic)
  query.descending('createdAt')
  query.include('versions')
  query.first().then(function(results) {
    res.send(results)
  }).catch((e) => {
    res.send(e)
  })
})

router.get('/:id', function(req, res, next) {
  let id = req.params.id
  var query = new AV.Query(Topic)
  query.include('versions')
  query.get(id).then((results) => {
    res.send(results)
  }).catch(next)
})

// 查询 Topic 列表
router.get('/', function(req, res, next) {
  var query = new AV.Query(Topic)
  query.descending('createdAt')
  query.include('versions')
  query.find().then(function(results) {
    results.shift()
    res.send(results)
  }).catch((e) => {
    res.send(e)
  })
})

// 新增 Topic 项目
router.post('/', function(req, res, next) {
  var content = req.body.content
  AV.User.become(req.headers['x-lc-session']).then(function(user) {
    let topic = creator.createTopic(content, user)
    return topic.save(null, {sessionToken: req.headers['x-lc-session']})
  }).then(function(topic) {
    res.send(topic)
  }).catch((e) => {
    res.send(MyError(e.code, '新建主题出错'))
  })
})

module.exports = router
