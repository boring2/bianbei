import wepy from 'wepy'

let domain = 'http://127.0.0.1:3000'

let url = {
  firstTopic: {
    url: `${domain}/topic/today`
  },
  topic: {
    url: `${domain}/topic`
  },
  version: {
    url: `${domain}/version`
  },
  idea: {
    url: `${domain}/idea`
  }
}

let api = {
  getFirstTopic () {
    return wepy.request(url.firstTopic.url)
  },

  getTopics () {
    return wepy.request(url.topic.url)
  },

  getTopic (id) {
    return wepy.request(`${url.topic.url}/${id}`)
  },

  getVersion (id) {
    return wepy.request(`${url.version.url}/${id}`)
  },

  getIdea (id, session) {
    return wepy.request({
      url: `${url.idea.url}/${id}`,
      header: {
        'X-LC-Session': session
      }
    })
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
    })
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
    })
  }
}

export default api
