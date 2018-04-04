'use strict';
var router = require('express').Router();
var AV = require('leanengine');

var Topic = AV.Object.extend('Topic');

// 查询 Topic 列表
router.get('/', function(req, res, next) {
  var query = new AV.Query(Topic);
  query.find().then(function(results) {
    res.send(results)
  }, function(err) {
    next(err);
  }).catch(next);
});

// 新增 Topic 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var user = req.currentUser
  console.log("+++++++", user)
  AV.User.become(req.headers["x-lc-session"]).then(function(user) {
    let defaultTopic = {
      content: content,
      user: user,
      versions: []
    }
    var topic = new Topic();
    topic.set(defaultTopic);
    return topic.save()
  }).then(function(topic) {
    res.send(topic)
  }).catch(next);
});

module.exports = router;
