// 导入axios实例
import httpRequest from '../../script/request'

// 定义接口的传参
// interface UserInfoParam {
// 	userID: string,
// 	userName: string
// }
const user = {
	// 急速签名登录 -- 渠道
	jsSignLogin: (data) => {
    return httpRequest({
			url: '/user/auth/jsSignLogin',
			method: 'post',
			data
		})
	},
	// 获取安卓下载地址
	getAndroidVersion: () => {
    return httpRequest({
			url: '/common/version',
			method: 'get'
		})
	},
	// 手机验证码
	sendSms: (data) => {
    return httpRequest({
			url: '/user/auth/sms/send',
			method: 'post',
			data
		})
	},
	// 密码登入
	loginForPassword: (data) => {
    return httpRequest({
			url: '/user/auth/loginForPassword',
			method: 'post',
			data
		})
	},
	// 短信登入 
	loginForSms: (data) => {
    return httpRequest({
			url: '/user/auth/loginForSms',
			method: 'post',
			data
		})
	},
	// 设置用户信息 
	setInfo: (data) => {
    return httpRequest({
			url: '/user/user-info/setInfo',
			method: 'post',
			data
		})
	},
	// 上传头像 
	upload: (data) => {
    return httpRequest({
      headers: {'Content-Type': 'multipart/form-data'},
			url: '/common/resource/upload',
			method: 'post',
			data
		})
	},
	// 个人资料信息 
	getUserInfo: () => {
    return httpRequest({
			url: '/user/user-info/info',
			method: 'get'
		})
	},
  getUserSessionList: (data) => { // 获取用户在会话的列表头像、昵称信息等
    return httpRequest({
      url: "/user/user-info/getUserSessionInfo",
      method: 'post',
      data
    })
  },
  quit: (data) => { // 登退
    return httpRequest({
			url: '/user/auth/quit',
			method: 'get',
			data
		})
	},
  getModerationToken: () => { // 获取内容审核Token
    return httpRequest({
      url: `/common/getModerationToken`,
      method: 'get'
    })
  },
  getSmsToken: (data) => { // 修改密码，验证码是否正确，返回新密码token
    return httpRequest({
      url: "/user/auth/sms/getSmsToken",
      method: 'post',
      data
    })
  },
  forgetPassword: (data) => { // 修改密码，新密码提交
    return httpRequest({
      url: "/user/auth/forgetPassword",
      method: 'post',
      data
    })
  },
	
}
export default user
