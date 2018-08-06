import wepy from 'wepy'

let domain = 'http://127.0.0.1:3000'
// let domain = 'https://bianbei.leanapp.cn'

let url = {
  firstTopic: {
    url: `${domain}/topic/today`
  },
  topic: {
    url: `${domain}/topic`
  },
  version: {
    url: `${domain}/version`,
    baseInfoUrl: `${domain}/version/base`
  },
  idea: {
    url: `${domain}/idea`
  },
  user: {
    setRoleUrl: `${domain}/user/setrole`
  }
}

let errorHandler = function (res) {
  wx.hideLoading()
  wx.hideNavigationBarLoading()
  if (res.statusCode !== 200) {
    throw new Error(res.statusCode)
  }
  return res
}

let api = {
  getFirstTopic () {
    return wepy.request(url.firstTopic.url).then(errorHandler)
  },

  getTopics () {
    return wepy.request({
      url: url.topic.url
    }).then(errorHandler)
  },

  getTopic (id) {
    return wepy.request(`${url.topic.url}/${id}`).then(errorHandler)
  },

  postTopic (data, session) {
    return wepy.request({
      url: `${url.topic.url}`,
      method: 'POST',
      data: data,
      header: {
        'X-LC-Session': session
      }
    }).then(errorHandler)
  },

  getVersion (id) {
    return wepy.request(`${url.version.url}/${id}`).then(errorHandler)
  },

  getVersionBaseInfo (id) {
    return wepy.request(`${url.version.baseInfoUrl}/${id}`).then(errorHandler)
  },

  getIdea (id, session) {
    return wepy.request({
      url: `${url.idea.url}/${id}`,
      header: {
        'X-LC-Session': session
      }
    }).then(errorHandler)
  },

  /// data is {
  ///  topicId, versionId, preIdeaId, content, isCheckout
  /// }
  postIdea (data, session) {
    return wepy.request({
      url: `${url.idea.url}`,
      method: 'POST',
      data: data,
      header: {
        'X-LC-Session': session
      }
    }).then(errorHandler)
  },

  /// type is 'like | unlike | report'
  handleFeed (id, type, session) {
    let URL = `${url.idea.url}/${type}?id=${id}`
    return wepy.request({
      url: URL,
      method: 'POST',
      header: {
        'X-LC-Session': session
      }
    }).then(errorHandler)
  },

  setrole (session) {
    return wepy.request({
      url: `${url.user.setRoleUrl}`,
      method: 'POST',
      data: {
        roleName: 'Normal'
      },
      header: {
        'X-LC-Session': session
      }
    }).then(errorHandler)
  }
}

export default api
