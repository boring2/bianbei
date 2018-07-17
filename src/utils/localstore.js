/**
 * 一个完整的topic
 * Topic {
 *  id, content, versions<Array>, ideas<Array>
 * }
 */
let LocalStore = {
  fetchTopic (id) {
    // wx.get
  },
  saveTopic(id, data, success, error) {
    try {
      wx.setStorageSync(id, data)
      success && success()
    } catch (e) {
      console.error(e)
      error && error()
    }
  },
  addIdea(topicId, versionIndex, idea) {
    try {
      let topic = wx.getStorageSync(topicId)
      topic.ideas[versionIndex].push(idea)
      // wx.setStorageSync(topicId, )
    } catch (error) {

    }
  }
}

export default LocalStore
