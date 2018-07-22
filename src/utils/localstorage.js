/**
 * 一个完整的topic
 * Topic {
 *  id, content, versions<Array>, ideas<Array>
 * }
 */
let LocalStorage = {
  fetchTopic (topicId, success, error) {
    return this.getTopic(topicId, success, error)
  },

  getTopic (topicId, success, error) {
    try {
      let topic = wx.getStorageSync(topicId)
      success && success()
      return topic
    } catch (e) {
      console.error('getTopic error', e)
      error && error()
    }
  },

  saveTopic(topicId, data, success, error) {
    try {
      wx.setStorageSync(topicId, data)
      success && success()
    } catch (e) {
      console.error('save topic error', e)
      error && error()
    }
  },

  /// 参数过多
  addIdea(topicId, versionIndex, idea, isCheckout, sliceIndex, success, error) {
    let topic = this.getTopic(topicId, success, error)
    let ideas = topic.ideas[versionIndex]
    if (!isCheckout) {
      ideas.push(idea)
    } else {
      let sliceIdea = ideas.slice(0, sliceIndex)
      let newVersionIndex = versionIndex + 1
      let newIdeas = topic.ideas[newVersionIndex] || (topic.ideas[newVersionIndex] = sliceIdea)
      newIdeas.push(sliceIdea)
    }
    this.saveTopic(topicId, topic, success, error)
  },

  handleFeed (topicId, versionIndex, type, ideaIndex, success, error) {
    let topic = this.getTopic(topicId, success, error)
    let ideas = topic.ideas[versionIndex]
    if (!ideas[ideaIndex][type]) {
      ideas[ideaIndex][type] = 1
    } else {
      ideas[ideaIndex][type] += 1
    }
    this.saveTopic(topicId, topic, success, error)
  }
}

export default LocalStorage
