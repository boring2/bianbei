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

// 新增 Todo 项目
router.post('/', function(req, res, next) {
  var content = req.body.content;
  var todo = new Todo();
  todo.set('content', content);
  todo.save().then(function(todo) {
    res.redirect('/todos');
  }).catch(next);
});

module.exports = router;
