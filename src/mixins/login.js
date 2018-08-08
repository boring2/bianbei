import wepy from 'wepy'
import api from '../utils/api'
import AV from 'leancloud-storage'
export default class LoginMixin extends wepy.mixin {
  async mixinLogin (fromUrl) {
    if (!wx.getStorageSync('hasUserInfo')) {
      wx.redirectTo({
        url: 'auth?from=' + fromUrl
      })
      return
    }
    let st = wx.getStorageSync('st')
    if (!st) {
      let user = await AV.User.loginWithWeapp()
      let st = AV.User.current().getSessionToken()
      wx.setStorageSync('st', st)
      wx.setStorageSync('userId', user.id)
      if (!user.get('nickName')) {
        let userInfo = this.$parent.globalData.userInfo || {}
        await api.setrole(st)
        await user.set(userInfo).save()
      }
    }
    return st
  }
}
