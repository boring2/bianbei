//app.js
const AV = require('./libs/av-weapp-min.js')
import { USER_ROLE } from './utils/constant.js'
import { setUserRole, createRoles, getRole, createTopic, createIdea, getTopic } from './utils/data.js'

App({
	onLaunch: function () {
		AV.init({
			appId: 'bSlHOP5YhRoylMzN0cjNfKN2-gzGzoHsz',
			appKey: 'Kkhs2gTukXtYHLT2VLRJgkKq',
		})

		// createRoles()

		// 展示本地存储能力
		var logs = wx.getStorageSync('logs') || []
		logs.unshift(Date.now())
		wx.setStorageSync('logs', logs)

		// 登录
		wx.login({
			success: res => {
        console.log(res)
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
            
              // AV.User.logIn("Tom", "tom123").then((user) => {
              //   console.log(user.getSessionToken())
              //   wx.request({
              //     url: 'http://bianbei.leanapp.cn/topic', //仅为示例，并非真实的接口地址
              //     method: "post",
              //     data: {
              //       content: "testsssss"
              //     },
              //     header: {
              //       'content-type': 'application/json', // 默认值
              //       'X-LC-Session': user.getSessionToken()
              //     },
              //     success: function (res) {
              //       console.log(res.data)
              //     }
              //   })
              // })
              // wx.request({
              //   url: 'http://localhost:3000/user/login/',
              //   method: "post",
              //   data: {
              //     username: 'boring',
              //     password: '123'
							// 	},
              //   success: function (res) {
              //     console.log(res.data, "----success")
              //   },
              //   fail: function(error) {
              //     console.log('error', error)
              //   }
              // })
							// 可以将 res 发送给后台解码出 unionId
							// AV.User.loginWithWeapp().then(user => {
							// 	this.globalData.userInfo = res.userInfo
							// 	console.log(res.userInfo)
							// 	user.set(res.userInfo)
							// 	user.save().then((u) => {

							// 		return setUserRole(USER_ROLE.ADMIN.name, u)
							// 	}).then((role) => {
							// 		console.log(user.getSessionToken())

							
							// 		createTopic('测试主题').catch((error)=> {
							// 			console.log(error)
							// 		})
							// 		// .then((topic) => {
							// 		//   return createIdea(topic)
							// 		// }).then((idea) => {
							// 		//   console.log(idea)
							// 		// }).catch((error) => {
							// 		//   console.error(error)
							// 		// })
							// 		try {
							// 			wx.setStorageSync('role', role.getName())
							// 		} catch (e) {}

							// 	})
							// 	user.getRoles().then(function (roles) {
							// 		console.log(roles)
							// 	})
							// }).catch(console.error)

							// 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
							// 所以此处加入 callback 以防止这种情况
							if (this.userInfoReadyCallback) {
								this.userInfoReadyCallback(res)
							}
						}
					})
				}
			},
			fail: res => {
				console.log(res)
			}
		})
	},
	globalData: {
		userInfo: null,
		role: null,
		currentTopic: null
	}
})