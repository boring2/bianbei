const errorMap = {
  '503': '服务器超时, 请检查网络'
}

const errorHandler = function (code) {
  wx.hideLoading()
  wx.hideNavigationBarLoading()
  let title = errorMap[code]
  if (!title) {
    title = '出错了, 请在公众号留言'
  }
  wx.showToast({
    title,
    icon: 'none'
  })
}

export default errorHandler