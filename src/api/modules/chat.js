
// 导入axios实例
import httpRequest from '../../script/request'

// 定义接口的传参
// interface UserInfoParam {
// 	userID: string,
// 	userName: string
// }
const chat = {
	// 查询记录 - 文件
	fileQuery: (data) => {
    return httpRequest({
			url: '/file/record/query',
			method: 'post',
			data
		})
	},
  memberList:(data) => { // 全量查询群人员
    return httpRequest({
      url: `/member/list`,
      method: 'post',
      data
    })
  },
  friendInfoList: (data) => { // 好友列表- 分页不用
    return httpRequest({
      url: `/friendInfo/list`,
      method: 'post',
      data
    })
  },
  groupsList: (data) => { // 群列表 - 分页不用
    return httpRequest({
      url: `/groups/page/list`,
      method: 'post',
      data
    })
  },
  friendList: (version = 0) => { // 好友列表 - 全量
    return httpRequest({
      url: `/data/sync/syncFriend/${version}`,
      method: 'get'
    })
  },
  groupList: (version = 0) => { // 群列表 - 全量
    return httpRequest({
      url: `/data/sync/syncGroup/${version}`,
      method: 'get'
    })
  },
  createGroup: (data) => { // 创建群组
    return httpRequest({
      url: `/groups/create`,
      method: 'post',
      data
    })
  },
  whiteCheck: () => { // 白名单
    return httpRequest({
      url: `/moderate/whitelist/check`,
      method: 'post'
    })
  },
  blacklist: () => { // 黑名单
    return httpRequest({
      url: `/friendInfo/blacklist/list`,
      method: 'get'
    })
  },
  deleteBlacklist: (data) => { // 删除黑名单
    return httpRequest({
      url: `/friendInfo/blacklist/deleteBlacklist`,
      method: 'post',
      data
    })
  },
  groupMemberPage: (data) => { // 群成员列表
    return httpRequest({
      url: `/member/page/list`,
      method: 'post',
      data
    })
  },
  friendInfo: (friendId) => { // 朋友详情
    return httpRequest({
      url: `/friendInfo/detail/${friendId}`,
      method: 'get'
    })
  },
  setDisplayName: (data) => { // 设置朋友备注
    return httpRequest({
      url: `/friendInfo/setDisplayName`,
      method: 'post',
      data
    })
  },
  delFriend: (data) => { // 设置朋友备注
    return httpRequest({
      url: `/friendInfo/delete`,
      method: 'post',
      data
    })
  },
  addFriendSearchUser: (num) => { // 朋友详情
    return httpRequest({
      url: `/user/user-info/addFriendSearchUser/${num}`,
      method: 'get'
    })
  },
  addFriend: (data) => { // 添加好友
    return httpRequest({
      url: `/friendInfo/addFriend`,
      method: 'post',
      data
    })
  },
  newFriendPage: (data) => { // 新好友
    return httpRequest({
      url: `/friendInfo/newFriendList`,
      method: 'post',
      data
    })
  },
  agree: (data) => { // 同意加好友
    return httpRequest({
      url: `/friendInfo/agree`,
      method: 'post',
      data
    })
  },
  ignore: (data) => { // 忽略加好友
    return httpRequest({
      url: `/friendInfo/ignore`,
      method: 'post',
      data
    })
  },
  
  
  
}
export default chat