//app.js
const AV = require('./libs/av-weapp-min.js');
App({
  onLaunch: function () {
    AV.init({
      appId: 'bSlHOP5YhRoylMzN0cjNfKN2-gzGzoHsz',
      appKey: 'Kkhs2gTukXtYHLT2VLRJgkKq',
    });

    console.log(AV.User.current())

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              AV.User.loginWithWeapp().then(user => {

                this.globalData.user = user.toJSON();
                user.set("nickName", res.userInfo.nickName)
                user.save().then((u)=>{
                  console.log("+++", u)
                })
                // console.log("---", this.globalData.user)
              }).catch(console.error);
              // this.globalData.userInfo = res.userInfo
              console.log("----", AV.User.current())
              console.log(res.userInfo)

              // 新建一个角色，并把为当前用户赋予该角色
              var roleAcl = new AV.ACL();
              roleAcl.setPublicReadAccess(true);
              roleAcl.setPublicWriteAccess(false);

              // 当前用户是该角色的创建者，因此具备对该角色的写权限
              roleAcl.setWriteAccess(AV.User.current(), true);

              //新建角色
              var administratorRole = new AV.Role('Administrator', roleAcl);
              administratorRole.save().then(function (role) {
                // 创建成功
              }).catch(function (error) {
                console.log(error);
              });

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})