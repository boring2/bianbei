'use strict'
var router = require('express').Router()
var AV = require('leanengine')
var creator = require('../utils/creator')
var aclGen = require('../utils/acl')
const USER_ROLE_CONSTANT = require('../utils/constant').USER_ROLE_CONSTANT

var Version = AV.Object.extend('Version')

router.get('/:id', function(req, res, next) {
  let id = req.params.id
  var query = new AV.Query(Version)
  query.include('ideas')
  query.include('ideas.users')
  query.get(id).then(function(results) {
    res.send(results)
  }).catch((e) => {
    res.send(e)
  })
})

router.get('/base/:id', function(req, res, next) {
  let id = req.params.id
  var query = new AV.Query(Version)
  query.get(id).then(function(results) {
    res.send(results)
  }).catch((e) => {
    res.send(e)
  })
})

module.exports = router
