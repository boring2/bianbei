import wepy from 'wepy'

let domain = "http://127.0.0.1:3000"

let url = {
  firstTopic: {
    url: `${domain}/topic/today`
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
    console.log('aaaaaaaaaaaa')
    return wepy.request(url.firstTopic.url)
  },

  getTopics () {

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

  liked () {

  },

  unliked () {

  },

  reported () {

  },

}

export default api