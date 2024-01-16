import { ref,reactive,toRaw, onMounted, onUnmounted, onBeforeUnmount, nextTick} from 'vue'

import { v4 as uuidv4 } from 'uuid';
import api from "../../api/index";
import method from '../../script/method'
import { ElMessage } from "element-plus";
import { Promise } from 'core-js';
import {useRouter} from 'vue-router'
import IndexDBCache from "./uIndexDB";
const RongIMLib = require('@rongcloud/imlib-next')
let dbCache = null;
export function imData() {
  const router = useRouter()
  const Events = RongIMLib.Events
  function init(){ // 初始化-融云建立链接lib库
    menu.userinfo = localStorage.getItem('userinfo') ? JSON.parse(localStorage.getItem('userinfo')) : router.push({path: '/login'})
    RongIMLib.init({ appkey: 'kj7swf8okx8y2' });
    RongIMLib.addEventListener(Events.CONNECTING, () => {
      // console.log('正在链接服务器111')
    })
    RongIMLib.addEventListener(Events.CONNECTED, () => {
      // console.log('已经链接到服务器222')
    })
    RongIMLib.addEventListener(Events.MESSAGES, listener) // 开启监听消息
    // RongIMLib.addEventListener(Events.CONVERSATION, listenerConversation) // 开启监听会话
    // console.log("userSig", menu.userinfo.userSig)
    RongIMLib.connect(menu.userinfo?.userSig).then(res => {
      if (res.code === RongIMLib.ErrorCode.SUCCESS) {
        // console.log('链接成功, 链接用户 id 为:4444 ', res.data.userId);
        getSessionList()
      } else {
        console.warn('链接失败40-400, code:55555', res.code)
      }
    })
    whiteCheck()
  }
  const listener = async (evt) => { // 监听消息后处理
    console.log(evt.messages,'开启监听消息333333')
    const msgArr = evt.messages.map(item => {
      let uiContent = method.jsonType(item.content.content) ? JSON.parse(item.content.content) : item.content.content
      if(uiContent?.type === 'prompt' || uiContent?.type === 'cmd'){ // 提示消息或信令消息-解析data反序列化
        uiContent.content.jsonData = method.jsonType(uiContent.content.data) ? JSON.parse(uiContent.content.data) : uiContent.content.data 
        if(uiContent?.content.cmd === 'MessageRecall' ){
          chat.recallMsgArr.push(uiContent)
        }
        // cmd ----- 
        if(uiContent?.content.operation === 'GroupRename' ){
          session.currentContact.name = uiContent.content?.jsonData?.groupName
        }
        if(uiContent?.content?.operation === 'GroupAdd' || uiContent?.content.operation === 'GroupKicked' ){
          uiContent.content.desc = uiContent.content?.jsonData?.targetUserDisplayNames?.join('、') + uiContent.content.desc
        }
      }
      return {
        ...item,
        uiContent: uiContent
      }
    })
    writeDbMsg('chatTable', evt.messages[0]['targetId'], ...msgArr)
    if(evt.messages[0]['targetId'] === session.currentContact.targetId){ // 当前聊天对象
      chat.chatList.push(...msgArr)
      if(chat.scrollBottom){ // 如果在聊天底部，滚动条自动滚动
        // console.log('chat.scrollBottom',chat.scrollBottom)
        nextTick(() => {
          let scrollElem = scrollDiv.value;
          scrollElem?.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth'  /* 平滑*/ });
        });
      }
      session.uiList.forEach((item,key,arr)=>{ // 会话缩影
        if(item.targetId === session.currentContact.targetId){
          let uiContent = method.jsonType(evt.messages[0]?.content?.content) ? JSON.parse(evt.messages[0]?.content?.content) : evt.messages[0]?.content?.content
          arr[key].contentJson.content.text = uiContent?.content?.text
          arr[key].contentJson.send_time = uiContent?.send_time
          if(uiContent?.content.operation === 'GroupRename' ){
            uiContent.content.jsonData = method.jsonType(uiContent?.content.data) ? JSON.parse(uiContent.content.data) : uiContent?.content.data 
            arr[key].name = uiContent.content?.jsonData?.groupName
          }
        }
        session.visibles[key] = false
        // console.log("sessionvisibles 1111")
      })
    } else {
      if(evt.messages[0].conversationType == 6) return // 系统消息-排除
      session.newConversation = null
      // console.log('newConversation000',session.newConversation)
      session.uiList.forEach((item,key,arr)=>{ // 遍历之前的会话是否和新消息匹配
        if(item.targetId === evt.messages[0]['targetId']){
          session.newConversation = item
          // console.log('newConversation11',session.newConversation)
          arr[key]['unread'] = arr[key]['unread'] + 1
          // console.log('session.uiList=====unread', evt.messages[0]?.content?.content)
          session.newMsg = null
          if( method.jsonType(evt.messages[0]?.content?.content)) {
            const josnContent = JSON.parse(evt.messages[0]?.content?.content)
            arr[key].contentJson.content.text = josnContent?.content?.text
            arr[key].contentJson.send_time = josnContent.send_time
            arr[key]['at'] = josnContent?.content?.mentioned?.indexOf(menu.userinfo?.userId) > -1
            // console.log(JSON.parse(evt.messages[0]?.content?.content))
            session.newMsg = arr[key] // 新消息存起来，删掉，最后unshift到顶部
            arr.splice(key,1)
          }
        }
        session.visibles[key] = false
        // console.log("sessionvisibles 22222")
      })
      if(session.newConversation){ // 之前会话有，组装好添加进来
        if(session.newMsg.isTop ){
          session.uiList.unshift(session.newMsg)
        }else{
          session.uiList.splice(session.isTopNumber,0,session.newMsg)
          // console.log("新消息，不置顶")
        }
      } else { // 新会话产生  && session.uiList.length > 0
        session.newConversation = evt.messages[0]
        // console.log('!!!66666',session.newConversation , evt.messages[0])
        let reg = /^[GF]/;
        if(!session.newConversation.targetId.match(reg) && 
          session.newConversation.targetId != 'system_send' && 
          session.newConversation.targetId != '__system__'){
          var data = [{
            targetId: session.newConversation.targetId,
            type: session.newConversation.conversationType === 3 ? 2 :  session.newConversation.conversationType, /// 后台要求 群传2
          }]
          let timer = null
          timer = setTimeout(() => {
            api.getUserSessionList(data).then((res) => {
              if (res.code === 0) {
                const nnList = res.data
                nnList.map(item=>{
                  // console.log('==',item.targetId , session.newConversation.targetId)
                  if(item.targetId == session.newConversation.targetId){
                    let contentJson = session.newConversation?.content?.content  && 
                    method.jsonType(session.newConversation?.content?.content) ? JSON.parse(session.newConversation?.content?.content) : {content:{text:''}}
                    let param = {
                      contentJson: contentJson,
                      name: item.name || item.targetId,
                      type: item.type,
                      targetId: item.targetId,
                      groupMemberCount: item.groupMemberCount,
                      avatarUrl: item.avatarUrl ||'https://static.chart.miaojiahui.cn/image/default_avatar.png',
                      unread: 1,
                      at: false,
                      notificationLevel: 0,
                      isTop: false,
                    }
                    // session.uiList.unshift(param)
                    session.uiList.splice(session.isTopNumber, 0, param)
                    session.visibles.unshift(false)
                    // console.log("sessionvisibles 333")
                  }
                })
                // console.log('融云id =>查念念后台-会话列表头像', session.uiList)
              } else {
                // showToast(res.msg)
              }
            })
          }, 2000);
        }
      }
    }
  }
  async function getSessionList(){ // 获取会话列表
    await RongIMLib.getConversationList().then(({ code, data: conversationList }) => {
      if (code === 0) {
        // console.log('融云内置 获取会话列表成功6666', conversationList );
        let reg = /^[GF]/;
        session.promises = [];
        session.rongList = conversationList.filter(item => {
          if (!item) return false;
          if(item.targetId.match(reg) || item.targetId === 'system_send' || item.targetId === '__system__'){
            return false;
          }
          if (item.conversationType === RongIMLib.ConversationType.SYSTEM) {
            return false;
          }
          // 正常会话 - 不过滤
          return true;
        })
        // 老逻辑
        let listdata = []
        if (session.rongList.length > 0) {
          session.rongList.forEach((conversation,index) => {
            if(!conversation.targetId.match(reg) && conversation.targetId != 'system_send' && conversation.targetId != '__system__'){
              listdata.push({
                targetId: conversation.targetId,
                type: conversation.conversationType === 3 ? 2 :  conversation.conversationType, /// 后台要求 群传2
              })
            } else {
              session.rongList.splice(index,1)
            }
          })
          getUserSessionList(listdata)
        }
      } else {
        console.log('获取会话列表失败:7777 ',code);
      }
    });
    if(!localStorage.getItem('groupsArr')){
      nextTick(()=>{
        groupsList(0)
      })
    } else {
      contactsState.groupsArr = JSON.parse(localStorage.getItem('groupsArr'))
    }
    if(!localStorage.getItem('friendArr')) {
      nextTick(()=>{
        friendList(0)
      })
    }else{
      contactsState.friendArr = JSON.parse(localStorage.getItem('friendArr'))
    }
  }
  const session = reactive({ // 会话数据
    uiList: [],  // 渲染列表
    rongList: [], // 融云返回列表
    promises: [],
    currentContact: {},  // 当前聊天对象
    search: '',
    newMsg: null,
    newConversation: null, // 标记新会话进来
    // currentActive: '', // 当前和谁聊天
    visibles: [], // 弹出窗列表的显示
    isTopNumber: 0,
    currentTarget: '',  // 当前目标
    currentFriend: null,  // 当前朋友
    currentGroup: { // 当前群详情
      list: [],
      pageNow: 1,
      pageSize: 250,
      totalPage: 1,
      totalSize: 3,
    },
  })
  const selectTarget = (target, type, pageNow) => { // 选择-联系目标-详情页
    
    menu.largePanel = type
    session.currentTarget = target
    if(type === 'friend'){
      session.currentFriend = target
      // api.friendInfo(target.id).then(res => {
      //   if(res.code === 0){
      //     console.log(res)
      //   }
      // })
    } else if (type === 'groupInfo'){ // 群
      if(pageNow ){
        session.currentGroup.pageNow = pageNow
      } else {
        session.currentGroup.pageNow = 1
      }
      const data = {
        pageNow: session.currentGroup.pageNow,
        pageSize: 250,
        groupId: target.id,
        queryType: 1
      }
      api.groupMemberPage(data).then(res => {
        if(res.code === 0){
          if(pageNow){
            session.currentGroup.list = [...session.currentGroup.list,...res.data.list]
          } else {
            session.currentGroup.list = res.data.list
          }
          // console.log(res)
        }
      })
    }
  }
  const setDisplayName = (obj) =>{
    // console.log('setDisplayName1111',obj )
    var data = {
      displayName: obj.displayName,
      friendId: session.currentFriend.id
    }
    api.setDisplayName(data).then(res => {
      if(res.code === 0){
        contactsState.friendArr.forEach((item,key,arr)=>{
          if(item.id === session.currentFriend.id){
            arr[key] = {...session.currentFriend, displayName:obj.displayName}
            session.currentFriend = {...session.currentFriend, displayName:obj.displayName}
            // dbCache.Record_Update('friendTable', toRaw(arr[key]))
          }
        })
        // console.log(contactsState.friendArr)
        localStorage.setItem('friendArr', JSON.stringify(contactsState.friendArr))
      }
    })
  }
  const getUserSessionList = (data) =>{ // 融云id => 查念念后台-会话列表头像
    // console.log('getUserSessionList',data)
    api.getUserSessionList(data).then((res) => {
      if (res.code === 0) {
        const nnList = res.data
        nnList.map(item=>{
          session.rongList.map(items=>{
            if(item.targetId==items.targetId){
              let contentJson = items.latestMessage?.content?.content  && 
              method.jsonType(items.latestMessage?.content?.content) ? JSON.parse(items.latestMessage?.content?.content) : {content:{text:''}}
              let param = {
                // ...items,
                contentJson: contentJson,
                name: item.name || item.targetId,
                type: item.type,
                targetId: item.targetId,
                groupMemberCount: item.groupMemberCount,
                avatarUrl: item.avatarUrl ||'https://static.chart.miaojiahui.cn/image/default_avatar.png',
                unread: 0,
                at: false,
                isTop:items.isTop,
                notificationLevel:items.notificationLevel,
              }
              if(items.isTop){
                session.uiList.unshift(param)
                session.isTopNumber += 1
              } else {
                session.uiList.push(param)
              }
              session.visibles.push(false)
              // if (item.type == 2) {
              //   param.memberCount = item.groupMemberCount; // 客户应用服务器返回群组内成员数量。
              // }
              // session.promises.push(
              //   Promise.resolve(param)
              // );
            }
          })
        })
        // console.log('融云id =>查念念后台-会话列表头像', session.uiList)
        // console.log('融云id =>查念念后台-会话列表头像', session.visibles)
        session.currentContact = session.uiList[0] 
        // getHistoryMsg(true, null) // 查询第一个用户历史聊天记录
        if(session.currentContact.type === 2){ // type 1:用户 2:群组
          getMemberList({
            groupId: session.currentContact.targetId,
          })
        }
        ElMessage({
          message: '会话列表头像 success',
          type: 'success',
        })
      } else if(res.code === 100) {
        router.push({
          path: '/login',
        })
        // showToast(res.msg)
      }else {
        // showToast(res.msg)
      }
    })
  }
  const selectContacts = (item) => { // 选择联系人
    session.currentContact = item
    chat.chatList = []
    menu.largePanel = 'chat'
    // getHistoryMsg(true, null)
    if(session.currentContact.type === 2){ // type 1:用户 2:群组
      getMemberList({
        groupId: session.currentContact.targetId,
      })
    }
    session.uiList.forEach((items,key,arr)=>{
      if(items.targetId === session.currentContact.targetId){
        arr[key]['unread'] = 0
        arr[key]['at'] = false
      }
      // session.visibles[key] = false
    })
  }
  const sendTargetInfo = (currentTarget, type) => { // 朋友页-发送跳转会话
    menu.largePanel = 'chat'
    menu.active = 1
    // console.log("111111111111", currentTarget)
    let itemContact = session.uiList.find(item => {
      return item.targetId == currentTarget.id;
    });
    console.log('sendTargetInfo 朋友页-发送跳转会话', itemContact)
    if (!itemContact) {
      itemContact = {
        contentJson:  {content:{text:''}},
        name: currentTarget.displayName || currentTarget.nickname || currentTarget.remark || currentTarget.nickName ,
        type: type,
        targetId: currentTarget.id || currentTarget.targetId,
        groupMemberCount: currentTarget.groupMemberCount,
        avatarUrl: currentTarget.avatarUrl || currentTarget.portraitUri || 'https://static.chart.miaojiahui.cn/image/default_avatar.png',
        unread: 0,
        at: false,
        isTop: false,
        notificationLevel: 0,
      }
      session.uiList.splice(session.isTopNumber,0,itemContact)
    }
    selectContacts(itemContact)
  }
  const delFriendFn = () => { // 删除好友及会话
    api.delFriend({friendId: session.currentFriend.id}).then(res => {
      if(res.code === 0){
        friendList(localStorage.getItem('friendVersion'))
        delSession({
          type: 1,
          targetId: session.currentFriend.id
        })
      } else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
      }
    })
  }
  const visiblePopover = (index) =>{ // 会话右键传 - 值做对比，其他关闭
    let length = session.uiList.length 
    for(let i=0;i<length;i++){
      if(i != index){
        session.visibles.splice(i, 1, false);
      }else{
        session.visibles.splice(i, 1, true);
        // console.log("sessionvisibles 999=", index)
      }
    }
    // console.log("sessionvisibles 000", session.visibles)
  }
  const delSession = (obj) =>{ // 会话-删除
    const conversationType = obj.type === 1 ?  RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP;
    const targetId = obj.targetId;
    // console.log('会话-删除', obj)
    RongIMLib.removeConversation({
      conversationType,
      targetId: targetId,
    }).then(res => {
      // 删除指定会话成功
      if(res.code === 0){
        // console.log('删除指定会话成功',res)
        session.uiList.forEach((items,key,arr)=>{
          if(items.targetId === obj.targetId){
            arr.splice(key,1)
          }
        })
        if(obj.targetId === session.currentContact.targetId){
          session.uiList.length === 0 ? menu.active = 2 : session.currentContact = session.uiList[0]
        }
      } else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
        // console.log('删除指定会话成功',res.code, res)
      }
    })
    visiblePopover()
  }
  const topping = (obj) =>{ // 置顶-取消
    const conversationType = obj.type === 1 ? RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP;
    const targetId = obj.targetId;
    const isTop = !obj.isTop
    RongIMLib.setConversationToTop({
      conversationType,
      targetId,
    }, isTop).then(({code}) => {
      // 设置会话置顶成功
      // console.log('设置会话置顶成功=', code)
      if( !code ){
        session.uiList.forEach((item,key,arr)=>{
          if(item.targetId === obj.targetId){
            // console.log('obj2222222',obj)
            arr.splice(key, 1)
            obj.isTop = isTop
          }
        })
        if(isTop){ // 置顶
          session.uiList.splice(session.isTopNumber, 0, obj)
          session.isTopNumber = session.isTopNumber + 1
          // console.log('obj44444444444', session.isTopNumber)
        } else { // 取消置顶
          session.isTopNumber = session.isTopNumber - 1
          session.uiList.splice(session.isTopNumber, 0, obj)
          // console.log('obj5555555555', session.isTopNumber)
        }

      }
    })
    visiblePopover()
  }
  const disturb = (obj) =>{ // 免打扰-取消
    const conversationType = obj.type === 1 ? RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP;
    const targetId = obj.targetId;
    const notificationLevel = obj.notificationLevel === 5 ? 0 : 5
    RongIMLib.setConversationNotificationLevel({
      conversationType,
      targetId,
    }, notificationLevel).then(( {code} ) => {
      if(!code){
        // console.log('免打扰成功 notificationLevel', code)
        session.uiList.forEach((item,key,arr)=>{
          if(item.targetId === obj.targetId){
            // console.log('obj2222222', )
            arr[key].notificationLevel = notificationLevel
          }
        })
      }
      // 设置免打扰状态成功
    })
    visiblePopover()
  }
  const chat = reactive({ // 聊天数据
    message: '',
    page: {
      currentChatFull: [], // 当前聊天对象全量
      pageNow: 1,
      pageSize: 20,
      topIndex: 0 
    },
    chatList: [], // 获取到的当前聊天用户的消息列表 - ui
    hasMore: false, // 是否还有历史消息可获取
    dialogVisible: false,
    videoUrl: '',
    imgUrl: '',
    scrollBottom: true, // 是否要置底滚动条
    refer_msg_id: 0, // 引用的uuid
    groupList: [], // 群成员列表
    groupEnum:{}, // 枚举- 群成员信息
    sendType: 'text',
    referData: {}, // 引用对象
    forwardObj: null,
    resend: false,
    loading: false,
    aVisible: false , // @ 弹出框
    aMemberList: [], // @选中列表
    recallMsgArr: [],
    audioUrl: '',

  })
  const scrollDiv = ref(null)
  async function sendMsg (data ,isForward = false) { // 指定消息发送的目标会话
    chat.loading = true
    const conversation = {
      targetId: data.targetId || session.currentContact.targetId, // "eebb82bf149996fcabdd19ac0b67be43",
      // 会话类型：RongIMLib.ConversationType.PRIVATE | RongIMLib.ConversationType.GROUP
      conversationType: (data.contactType === 1 || session.currentContact.type === 1 ) ? RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP
    };
    if(isForward){ // 转发
      conversation.targetId = data.id
      conversation.conversationType = data.groupNo ? RongIMLib.ConversationType.GROUP : RongIMLib.ConversationType.PRIVATE
      // console.log("转发00")
    }
    // 构建文本消息
    const msgFormat = {
      session_type: session.currentContact.type, // session_type 1单聊 2群聊 3系统消息
      send_time: +new Date(),
      content: {},
      local_msg_id: uuidv4(),
      version: "1",
      type: "",
      receiver_id: conversation.targetId,
      sender_id:  menu.userinfo.userId
    }
    if(isForward){ // 转发
      msgFormat.receiver_id = data.id
      msgFormat.session_type = data.groupNo ? 2 : 1
      msgFormat.type = chat.forwardObj.type
      msgFormat.content = chat.forwardObj.content
      // console.log('转发==============',data)
    } else {
      if (data.type == 'text') {
        msgFormat.type = 'text'
        msgFormat.content = {
          md5: "md5",
          text: chat.message,
          extra: data.extra || '',
          mentioned: []
        }
      } else if( data.type == 'image') {
        msgFormat.type = 'image'
        msgFormat.content = {
          url: data.url,
          md5: "md5",
          mime_type: "image/jpeg",
          size: data.size,
          width: data.width,
          height: data.height,
          mentioned: []
        }
      } else if(data.type == 'video') {
        msgFormat.type = 'video'
        msgFormat.content = {
          ...data
        }
      } else if(data.type == 'file') {
        msgFormat.type = 'file'
        msgFormat.content = {
          url: data.url,
          md5: "md6",
          size: data.size,
          name: data.name
          
        }
      } else if(data.type == 'refer') { // 引用
        let sendName = ''
        if(session.currentContact.type !== 1){ // 1用户，2群
          sendName = chat.groupEnum[chat.referData.sender_id] && 
            (chat.groupEnum[chat.referData.sender_id]['userRemark'] || 
            chat.groupEnum[chat.referData.sender_id]['nickname'] )  
        } else {
          if(chat.referData.sender_id === menu.userinfo.userId){
            sendName = menu.userinfo.nickname
          } else {
            sendName = session.currentContact.name
          }
        }
        msgFormat.type = "refer",
        msgFormat.content = {
          text: chat.message,
          md5: "md61",
          refer_msg_id: chat.referData.local_msg_id,
          sender_nickName: sendName,
          mentioned: []
        }
      } else if(data.type == 'MessageRecall') { // 撤回
        msgFormat.type = "cmd",
        msgFormat.content = {
          operator_user_id: menu.userinfo.userId,
          cmd: "MessageRecall",
          jsonData:{
            messageId: data.uiContent.local_msg_id,
            operatorNickname: menu.userinfo.nickname ,
          },
          data:"",
        }
        msgFormat.content.data = JSON.stringify({
          messageId: data.uiContent.local_msg_id,
          operatorNickname: menu.userinfo.nickname ,
        })
      }
    }
    if ((data.type == 'text' || data.type == 'refer') && !isForward) { // 转发不需要- (华为审核 - at)
      if(chat.message === ''){
        chat.loading = false
        ElMessage({
          message: '发送内容不能为空',
          type: 'warning',
        })
        return
      } 
      chat.aMemberList.forEach(item => { // @数据 处理
        if((chat.message.indexOf(item.nickname)  >  -1) || (chat.message.indexOf(item.userRemark) > -1) ){ 
          if(msgFormat.content.mentioned.indexOf(item.userId)  ===  -1){ // 去重
            msgFormat.content.mentioned.push(item.userId)
          }
        }
      })
      if(!menu.isWhite){ // 白名单除外
        let bo = await hwText(chat.message) // 华为云 文本审核
        if(!bo){
          chat.resend = true
          chat.loading = false
          return
        }
      }
    }
    console.log(JSON.stringify(msgFormat))
    const message = new RongIMLib.TextMessage({ content: JSON.stringify(msgFormat) })
    // 发送消息
    RongIMLib.sendMessage(conversation, message).then(async ({ code, data }) => {
      if (code === 0) {
        console.log('消息发送成功80：', data)
        if(msgFormat.receiver_id === conversation.targetId){
          writeDbMsg('chatTable', conversation.targetId, {
            ...data,
            uiContent: msgFormat
          })
          chat.chatList.push({
            ...data,
            uiContent: msgFormat
          })
        }
        if(msgFormat.type === "cmd" ){ // 发送撤回，并接撤回数组
          chat.recallMsgArr.push(msgFormat)
        }
        chat.message = ''
        session.newMsg = null
        session.uiList.forEach((items,key,arr)=>{
          if(items.targetId === msgFormat.receiver_id){
            arr[key].contentJson.content.text = msgFormat.content.text
            arr[key].contentJson.send_time = msgFormat.send_time
            session.newMsg = arr[key]
            arr.splice(key,1)
          }
          // session.visibles[key] = false
        })
        if(session.newMsg){ // 会话重新排序
          if(session.newMsg.isTop ){
            session.uiList.unshift(session.newMsg)
          }else{
            session.uiList.splice(session.isTopNumber,0,session.newMsg)
          }
        } else { // 之前没有对应的会话 == 请求后台会话数据
          var arrData = [{
            targetId: conversation.targetId,
            type: conversation.conversationType,
          }]
          api.getUserSessionList(arrData).then((res) => {
            if (res.code === 0) {
              const nnList = res.data
              nnList.map(item=>{
                // console.log('==',item.targetId , conversation.targetId)
                if(item.targetId == conversation.targetId){
                  let contentJson = (data?.content?.content  && method.jsonType(data?.content?.content) )? JSON.parse(data?.content?.content) : {content:{text:''}}
                  let param = {
                    contentJson: contentJson,
                    name: item.name || item.targetId,
                    type: item.type,
                    targetId: item.targetId,
                    groupMemberCount: item.groupMemberCount,
                    avatarUrl: item.avatarUrl ||'https://static.chart.miaojiahui.cn/image/default_avatar.png',
                    unread: 0,
                    at: false,
                  }
                  // session.uiList.unshift(param)
                  session.uiList.splice(session.isTopNumber, 0, param)
                  session.visibles.unshift(false)
                }
              })
              console.log('之前没有对应的会话 == 请求后台会话数据')
            } else {
              // showToast(res.msg)
            }
          })
        }
        //划动回到顶部
        // nextTick(() => {
        //   let scrollElem = scrollDiv.value;
        //   scrollElem.scrollTo({ top: 0, behavior: 'smooth' });
        // });
        nextTick(() => {
          let scrollElem = scrollDiv.value;
          scrollElem?.scrollTo({ top: scrollElem.scrollHeight, behavior: 'smooth' });
        });
        chat.resend = false
      } else if (code === 405) { // REJECTED_BY_BLACKLIST
        chat.resend = false
        // 被对方删除
        ElMessage({
          message: '您的消息已发出，但被对方拒收',
          type: 'error',
        })
      }else if(code == 22408){
        chat.resend = false
        //当前用户在群组中已被禁言
        ElMessage({
          message: '您在当前群组中被禁言',
          type: 'error',
        })
      }else if(code == 22406 ){
        chat.resend = false
        //当前用户被移除出群组
        ElMessage({
          message: '您已不在当前群组',
          type: 'error',
        })
      }else {
        chat.resend = true
        ElMessage({
          message: '消息发送失败，异常码' + code,
          type: 'error',
        })
        // console.log('消息发送失败80-400：', code)
      }
      chat.loading = false
      chat.sendType = 'text' // 发送后重置， 普通文字类型, 并清空引用数据o
      chat.referData = {}
    });
  }
  const hwText = (message) =>{ // 华为审核
    return new Promise((resolve)=>{
      api.getModerationToken().then(res=>{
        var obj = {
          event_type: "comment",
          glossary_names: [ "blacklist" ],
          data : {
            text : message
          }
        }
        var xhr = new XMLHttpRequest();
        var hwUrl = "/v3/60a14006332644b584b0e357c3c6a81b/moderation/text"
        if(localStorage.getItem('electron') === 'true'){
          hwUrl = "https://moderation.cn-east-3.myhuaweicloud.com/v3/60a14006332644b584b0e357c3c6a81b/moderation/text"
        }
        xhr.open("POST", hwUrl, true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.setRequestHeader("X-Auth-Token", res.data.token);
        xhr.onload = function() {
          if (xhr.status === 200) {
            //parse JSON datax`x
            let data = JSON.parse(xhr.responseText)
            if (data.result.suggestion == 'pass'|| data.result.suggestion=='review') {
              console.log('通过')
              return resolve(true)
            } else {
              ElMessage({
                message: '涉及敏感内容',
                type: 'warning',
              })
              // alert('!pass'+ xhr.status)
              return resolve(false)
            }
          } else {
            console.log("请求失败")
            // alert('xhr.请求失败'+ xhr.status)
            return resolve(false)
          }
        }
        xhr.onerror = function() {
          ElMessage({
            message: '网络出问题了！',
            type: 'warning',
          })
          console.log("Network error occurred")
          return resolve(false)
        }
        xhr.send(JSON.stringify(obj));
      }).catch(err => {
        // alert('xhr.catch')
        return resolve(false)
      })
    })
  }
  const openVideo = (uiContent, type) => {
    chat.videoUrl = ''
    chat.imgUrl = ''
    chat.dialogVisible = true
    if(type === 'image'){
      chat.imgUrl = uiContent.content.url
    } else if(type === 'video'){
      chat.videoUrl = uiContent.content.url
    }
    console.log(uiContent)
  }
  const fun_record_get = async (tableName, key) =>{ // getBeforeMsg 获取之前消息
    chat.currentChatFull = await dbCache.Record_Get(tableName, key)
    console.log('获取之前消息', aObj, aObj?.arr?.length)
    chat.chatList = chat.currentChatFull.slice(20)
  }
  const writeDbMsg = async (tableName, targetId, itemMsg) => { // 写入数据库消息
    let aObj = await dbCache.Record_Get(tableName, targetId)
    console.log('写入数据库消息-有修改改，没有增', aObj, aObj?.arr)
    debugger
    if (aObj?.arr) {
      aObj.arr.push(itemMsg)
      dbCache.Record_Update('chatTable', {
        targetId: targetId,
        arr: aObj.arr
      })
    } else {
      dbCache.Record_Add_Obj('chatTable', {
        targetId: targetId,
        arr: [itemMsg]
      }) 
    }
  }
  
  const getHistoryMsg = (first, time) => { // 获取历史消息记录 (是否第一次，最上一条消息时间戳)
    const conversation = {
      targetId: session.currentContact.targetId, // 'eebb82bf149996fcabdd19ac0b67be43',
      conversationType: session.currentContact.type === 1 ? RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP
    };
    const option = {
      // 获取历史消息的时间戳，默认为 0，表示从当前时间获取
      timestamp: time ? new Date(time).getTime() : +new Date(),
      // 获取条数，有效值 1-100，默认为 20
      count: 10,
    };
    // console.log(option,first, conversation)
    RongIMLib.getHistoryMessages(conversation, option).then(result => {
      const historyRecall = [] // 当前分页，历史数据，撤回
      const intervalMsg =  result.data.list.map(item => 
      // method.jsonType(item.content.content) ? JSON.parse(item.content.content) : item.content.content)
      {
        let uiContent = method.jsonType(item.content.content) ? JSON.parse(item.content.content) : item.content.content 
        if(uiContent?.type === 'prompt' || uiContent?.type === 'cmd'){ // 提示消息或信令消息-解析data反序列化
          uiContent.content.jsonData = method.jsonType(uiContent.content.data) ? JSON.parse(uiContent.content.data) : uiContent.content.data
          if(uiContent.content?.cmd === 'MessageRecall' ){
            historyRecall.push(uiContent)
          }
          if(uiContent?.content?.operation === 'GroupRename' ){
            session.currentContact.name = uiContent.content?.jsonData?.groupName
          }
          if(uiContent?.content?.operation === 'GroupAdd' || uiContent?.content.operation === 'GroupKicked'){
            uiContent.content.desc = uiContent.content?.jsonData?.targetUserDisplayNames?.join('、') + uiContent.content.desc
          }
        }
        return {
          ...item,
          uiContent: uiContent,
        }
      })
      var scrollHeightLast = scrollDiv.value?.scrollHeight
      if(first) {
        chat.chatList = intervalMsg
        chat.recallMsgArr = historyRecall
      } else {
        chat.chatList = [...intervalMsg,...chat.chatList ]
        chat.recallMsgArr = [...historyRecall,...chat.recallMsgArr ]
      }
      chat.hasMore = result.data.hasMore;
      if(first){
        nextTick(() => {
          let scrollElem = scrollDiv.value;
          scrollElem?.scrollTo({ top: scrollElem.scrollHeight});
        });
      } else {
        nextTick(() => {
          var scrollHeightNow = scrollDiv.value?.scrollHeight
          console.log('上一次高度', scrollHeightLast, scrollHeightNow)
          scrollDiv.value?.scrollTo({ top: (scrollHeightNow - scrollHeightLast) });
        });
      }
      // console.log('获取历史消息成功90', result.data.list,chat.chatList, chat.hasMore);
    }).catch(error => {
      console.log('获取历史消息失败90-400', error, error.msg);
    });
  }
  const getMemberList = (data) => { // 获取群成员信息 - 组装成枚举
    api.memberList(data).then((res) => {
      if (res.code === 0) {
        // console.log("memberList", res)
        chat.groupList = res.data
        for( var item in res.data) {
          // console.log("name====", res.data[item])
          chat.groupEnum[res.data[item].userId]  = res.data[item]
        }
        // console.log("chat.groupEnum====", chat.groupEnum)
      } else {
        console.log("memberList 400", res)
      }
    })
  }
  const queryMsg = (id) => { // 引用查询
    const targetMsg =  chat.chatList.find(item => item.uiContent.local_msg_id === id)
    // console.log(targetMsg)
    return targetMsg //'[暂无此消息]'
  }
  const menu = reactive({
    active: 1,
    userinfo: {},
    panelArr: ['groupInfo', 'friend', 'userInfo', 'addFriend', 'chat', 'newFriend'], // 备注可以删
    largePanel: 'chat', // 大面板切换
    layerArr: ['forgotPassword','createGroup','forward'],
    layerStr: '',
    isWhite: false, // 是否为白名单
    black: false, // 黑名单列表弹框
    blackArr: [],
  })
  const editUserInfo = (data) => { // 编辑个人信息
    menu.userinfo = {
      ...menu.userinfo,
      ...data,
    }
    // console.log(menu.userinfo)
  }
  const menuOption = (num) => { // 进入聊天面板
    // let a = dbCache.Record_GetAll()
    // console.log("进入聊天面板", a)
    // dbCache.DB_Init('44d7751067f90bb0c8e204e9eef1d9d4DB')
    if(menu.active === num) return
    if(num === 2){
      menu.largePanel = 'newFriend'
    }else{
      menu.largePanel = 'chat'
    }
    menu.active = num
  }
  const largePanelFn = (panelStr) => { // 控制大面板显示对应页面
    menu.largePanel = panelStr
  }
  const openLayer = (str) => { // 打开蒙层-弹窗
    menu.layerStr = str
  }
  const closeLayer = ()=> { // 关闭蒙层-弹窗
    menu.layerStr = ''
  }
  const beforeUploadImg = async (rawFile) => { // 图片
    // console.log('上传图片前校验', rawFile)
    if ( !(rawFile.type === 'image/jpeg' || rawFile.type === 'image/png' || rawFile.type === 'image/gif' || rawFile.type === 'jpg') ) {
      ElMessage.error('头像图片必须为JPG格式')
      return false
    } else if (rawFile.size / 1024 / 1024 > 2) {
      ElMessage.error('图片超过2MB!')
      return false
    }
    // return true
    const data = {
      md5: 'md6'
    }
    if(!menu.isWhite){ // 白名单除外
      let bo = await method.hwImg(rawFile)
      if(bo){
        // console.log("bo-----")
        await apiFileQuery(rawFile, data, 'image')
      }
      return false
    }
  }
  // const hwImg = (rawFile) => {
  //   console.log('hwImg====',rawFile)
  //   return new Promise((resolve)=>{
  //     var base64Str = ''
  //     let reader = new FileReader();
  //     reader.readAsDataURL(rawFile);
  //     reader.onload = function () {
  //       let result = reader.result;
  //       // 将文件内容转换成base64字符串
  //       base64Str = result.split(",")[1];
  //       // 将base64字符串传递给后端
  //       // console.log('base64Str====',base64Str)
  //       api.getModerationToken().then(res=>{
  //         var obj = {
  //           event_type : "comment",
  //           image : base64Str,
  //           categories : [ "porn", "terrorism" ],
  //           // image_text_config : {
  //           //   black_glossary_names : [ "test" ]
  //           // }
  //         }
  //         var xhr = new XMLHttpRequest();
  //         xhr.open("POST", "/v3/60a14006332644b584b0e357c3c6a81b/moderation/image", true);
  //         xhr.setRequestHeader("Content-type", "application/json");
  //         xhr.setRequestHeader("X-Auth-Token", res.data.token);
  //         xhr.onload = function() {
  //           if (xhr.status === 200) {
  //             //parse JSON datax`x
  //             let data = JSON.parse(xhr.responseText)
  //             if (data.result.suggestion == 'pass'|| data.result.suggestion=='review') {
  //               console.log('文件通过')
  //               return resolve(true)
  //             } else {
  //               ElMessage({
  //                 message: '涉及敏感图片',
  //                 type: 'warning',
  //               })
  //               return resolve(false)
  //             }
  //           } else {
  //             console.log("请求失败")
  //             return resolve(false)
  //           }
  //         }
  //         xhr.onerror = function() {
  //           console.log("Network error occurred")
  //           return resolve(false)
  //         }
  //         xhr.send(JSON.stringify(obj));
  //       }).catch(err => {
  //         return resolve(false)
  //       })
  //     }
  //   })
  // }
  function imgchecked (file) { // 处理图片宽高
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file) // 必须用file.raw
      reader.onload = () => {
        // 让页面中的img标签的src指向读取的路径
        const img = new Image()
        img.src = reader.result
        img.onload = () => {
          // console.log('img.onload', img.width, img.height,)
          const data = {
            width: img.width,
            height: img.height,
          }
          resolve(data)
        }
      }
    })
  }
  const beforeUploadVideo = (rawFile) => { // 视频
    console.log('上传视频前校验', rawFile)
    if (rawFile.size / 1024 / 1024 / 25 > 1) {
      ElMessage.error('视频不得超过25M!')
      return false
    }
    const data = {
      md5: 'md6'
    }
    apiFileQuery(rawFile, data, 'video')
    return false
  }
  const beforeUploadFile = (rawFile) => { // 文件
    console.log('上传文件前校验', rawFile)
    if (rawFile.size / 1024 / 1024 / 1024 > 1) {
      ElMessage.error('文件不得超过1G!')
      return false
    }
    const data = {
      md5: 'md6'
    }
    apiFileQuery(rawFile, data, 'file')
    return false
  }
  const apiFileQuery = async (rawFile, data, strType) =>{ // 华为云储存
    chat.loading = true
    let suffix = await rawFile.name.substring(rawFile.name.lastIndexOf(".") + 1);
    api.fileQuery(data).then((res) => {
      if (res.code === 0) {
        console.log("md5", res)
        // 未引入AMD，直接通过构造函数创建ObsClient实例
        var obsClient = new ObsClient({ // 生成华为云对象
          // 认证用的ak和sk硬编码到代码中或者明文存储都有很大的安全风险，建议在配置文件或者环境变量中密文存放，使用时解密，确保安全；本示例以ak和sk保存在环境变量中为例，运行本示例前请先在本地环境中设置环境变量AccessKeyID、SecretAccessKey和SecurityToken。
          // 前端本身没有process对象，可以使用webpack类打包工具定义环境变量，就可以在代码中运行了。
          // 您可以登录访问管理控制台获取访问密钥AK/SK，获取方式请参见https://support.huaweicloud.com/intl/zh-cn/usermanual-ca/ca_01_0003.html
          access_key_id: res.data.access,
          secret_access_key: res.data.secret,
          security_token: res.data.securitytoken,
          server: res.data.endpoint
        });
        obsClient.initLog({
          level:'info'
        });
        let uuid = uuidv4()
        console.log('uuid', uuid)
        console.log('suffix========', `${uuid}.${suffix}`)
        obsClient.putObject({
          Bucket : res.data.bucket || 'niannian-test',
          Key :  `${uuid}.${suffix}`, // method.guid("123456"),
          Body : rawFile
        }, function(err, result) {
          if(err){
            console.log('Error-->' , err);
          }else{
            console.log('Status--->' , result.CommonMsg.Status); 
            if(result.CommonMsg.Status < 300){
              console.log('InterfaceResult--->', result.InterfaceResult); 
              if(result.InterfaceResult){
                console.log('Operation Succeed');
                if(strType === 'image'){
                  imgchecked(rawFile).then((data) => {
                    // console.log('data返回值即为判断结果。', data)
                    // data返回值即为判断结果。
                    if (data) {
                      // console.log('imgchecked',data)
                      sendMsg({
                        type: 'image',
                        url: `https://static-nn-test.nnchat.net/${uuid}.${suffix}`,
                        size: rawFile.size,
                        width: data.width,
                        height: data.height,
                      })
                    }
                  })
                } else if(strType === 'video'){
                  sendMsg({
                    type: 'video',
                    url:  `https://static-nn-test.nnchat.net/${uuid}.${suffix}`,
                    md5: "md6",
                    mediaName: rawFile.name,
                    mime_type: rawFile.type,
                    size: rawFile.size,
                    duration: 60,
                    thumb_url: "https://static.chart.miaojiahui.cn/image/default_avatar.png",
                    thumb_width: 122,
                    thumb_height: 122
                  })
                } else if(strType === 'file'){
                  sendMsg( {
                    type: 'file',
                    url: `https://static-nn-test.nnchat.net/${uuid}.${suffix}`,
                    size: rawFile.size,
                    name: rawFile.name
    
                  })
                }
              }
            }else{
              console.log('result--->' , result)
            }
          }
        });
        // console.log("obsClient", obsClient)
      } else {
        console.log("md5- err", res)
      }
      chat.loading = false
    }).catch(err => {
      chat.loading = false
    })
  }

  const referFn = (msgObj) => { // 聊天面板右键，五个事件
    console.log('referFn')
    chat.sendType = 'refer'
    chat.referData = msgObj
    
  }
  const closeRefer = () => {
    chat.sendType = 'text'
    chat.referData = {}
    console.log('closeRefer', chat.sendType)
  }
  const deleteFn = (msgObj) => { // 删除消息
    const conversation = {
      conversationType: msgObj.conversationType === 1 ? RongIMLib.ConversationType.PRIVATE : RongIMLib.ConversationType.GROUP,
      targetId: msgObj.targetId // menu.userinfo.userId
    }
    RongIMLib.deleteMessages(conversation, [{
      messageUId: msgObj.messageUId,
      sentTime: msgObj.sentTime,
      messageDirection: msgObj.messageDirection
    }]).then(res => {
      if (res.code === 0) {
        // console.log('删除成功')
        chat.chatList.forEach((item,key,arr)=>{
          if(item.uiContent.local_msg_id === msgObj.uiContent.local_msg_id){
            arr.splice(key,1)
          }
        })
      } else {
        console.log(res.code, res.msg)
      }
    }).catch(error => {
      console.log(error)
    })
  }
  const forwardFn = (msgObj) => { // 打开转发
    menu.layerStr = 'forward'
    chat.forwardObj = msgObj
    console.log('forwardFn',msgObj)
  }
  const recallFn = (msgObj) => {  // 撤回
    // console.log('recallFn',msgObj,)
    var data = {
      type: 'MessageRecall',
      uiContent: msgObj
    }
    sendMsg(data)
  }
  const contactsState = reactive({ // 联系人/联系群
    friendArr: [],
    friendVersion: localStorage.getItem('friendVersion') || 0,
    groupsArr: [],
    groupsVersion: localStorage.getItem('groupsVersion') || 0,
  })
  const friendList = (version) => { // 联系人列表
    api.friendList(version).then((res) => {
      if (res.code === 0) {
        console.log('friendList',res.data)
        if(version){ // 有版本号为增量
          console.log('增量', res.data?.friendList)
          if(res.data?.friendList){ // 有数据
            contactsState.friendVersion = res.data.version
            res.data?.friendList.forEach(item => {
              // status 好友状态(20=同意，30=删除)
              const index = contactsState.friendArr.findIndex((obj) => obj.id === item.id);
              // if(index < 0){ // 没有数据添加
              //   dbCache.Record_Add_Obj('friendTable', toRaw(item))
              // } else { // 更新数据
              //   dbCache.Record_Update('friendTable', toRaw(item))
              //   contactsState.friendArr.splice(index,1,item)
              // }
              if(item.status === 20) {
                if(index < 0){ // 没有数据添加
                  contactsState.friendArr.push(item)
                } else { // 更新数据
                  contactsState.friendArr.splice(index,1,item)
                }
                // console.log("item.status === 20")
              } else if(item.status === 30) {
                // console.log("item.status === 30")
                contactsState.friendArr.splice(index,1)
              }
            })
          }
        } else {
          contactsState.friendArr = res.data.friendList
          contactsState.friendVersion = res.data.version
          // dbCache.Record_Add_Arr('friendTable', toRaw(contactsState.friendArr ))
        }
        localStorage.setItem('friendArr', JSON.stringify(contactsState.friendArr))
        localStorage.setItem('friendVersion', contactsState.friendVersion)
      }
    })
  }
  const groupsList = (version) => { // 群列表
    api.groupList(version).then((res) => {
      if (res.code === 0) {
        console.log('groupList',res.data)
        if(version){
          console.log('增量', res.data?.groupList)
          if(res.data?.groupList){ // 有数据
            contactsState.groupsVersion = res.data.version
            res.data?.groupList.forEach(item => {
              // deleted 当前用户是否退出该群 1退出 0未退出
              const index = contactsState.groupsArr.findIndex((obj) => obj.id === item.id)
              if(item.deleted === 0 ) {
                if(index < 0){ // 没有数据添加
                  contactsState.groupsArr.push(item)
                } else { // 更新数据
                  contactsState.groupsArr.splice(index,1,item)
                }
                // console.log("item.deleted === 0")
              } else if(item.deleted === 1) {
                // console.log("item.deleted === 1")
                contactsState.groupsArr.splice(index,1)
              }
            })
          }
        } else {
          contactsState.groupsArr = res.data.groupList
          contactsState.groupsVersion = res.data.version
        }
        localStorage.setItem('groupsArr', JSON.stringify(contactsState.groupsArr))
        localStorage.setItem('groupsVersion', contactsState.groupsVersion)
      }
    })
  }
  function fun_db_close() { // 关闭数据库
    console.log("fun_db_close")
    dbCache.DB_Close()
    // dbCache.DB_Remove()
  }
  const msgChange = (e) => { // 监听@
    // console.log('msgChange', e)
    if(session.currentContact.type === 2){ // type 1:用户 2:群组
      if(e && e.substr(e.length - 1) === '@' ){ 
        chat.aVisible = true
      } else {
        chat.aVisible = false
      }
    }
  }
  const aGroupMember = (obj) => { // @ 某人，标记起来
    chat.aVisible = false
    chat.aMemberList.push(obj)
    chat.message += chat.groupEnum[obj.userId] &&  chat.groupEnum[obj.userId]['nickname'] || ''
    // console.log('@ 某人，标记起来', chat.aMemberList, chat.groupEnum, obj.userId, chat.groupEnum[obj.userId])
  }
  const whiteCheck = () =>{ // 白名单
    api.whiteCheck().then(res => {
      if (res.code === 0) {
        menu.isWhite = res.data
      }else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
      }
    })
  }
  const openBlack = () =>{
    api.blacklist().then(res =>{
      if (res.code === 0) {
        menu.black = true
        menu.blackArr = res.data
      }else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
      }
    })
  }
  const delBlackFn = (id) =>{
    api.deleteBlacklist({friendId:id}).then(res =>{
      if (res.code === 0) {
        // menu.blackArr = res.data
        menu.blackArr = menu.blackArr.filter(item => item.friendId !== id)
      }else {
        ElMessage({
          message: res.msg,
          type: 'error',
        })
      }
    })
  }
  const editMsg = (str) => {
    chat.message = str
  }
  const scrollFn = function(){ // 聊天面板-滚动条
    const scrollTop = scrollDiv.value?.scrollY || scrollDiv.value?.scrollTop
    if(scrollTop < 10 && chat.hasMore){ // 滚动条离顶部还有10px，并且还有历史记录时，加载历史记录
      // getHistoryMsg(false, chat.chatList && chat.chatList[0]?.uiContent?.send_time)
    }

    //变量 聊天框Height是可视区的高度
    var windowHeight = scrollDiv.value?.clientHeight ;
    //变量 scrollHeight 是滚动条的总高度
    var scrollHeight = scrollDiv.value?.scrollHeight
    //滚动条到底部的条件
    if(scrollTop+windowHeight==scrollHeight){
      //写后台加载数据的函数
      chat.scrollBottom = true
      // console.log("距顶部"+scrollTop+"可视区高度"+windowHeight+"滚动条总高度"+scrollHeight);
    } else {
      chat.scrollBottom = false
    }
  }
  const throttleFn = method.throttle(scrollFn, 500)
  onMounted(() => {
    // 滚动事件
    scrollDiv.value?.addEventListener('scroll', throttleFn);
    let db = localStorage.getItem('userId') + 'DB'
    dbCache = new IndexDBCache(db);
  })
  onUnmounted(() => {})
  onBeforeUnmount(()=>{
    scrollDiv.value?.removeEventListener('scroll',throttleFn);
    RongIMLib.removeEventListener(Events.MESSAGES, listener)
    RongIMLib.disconnect().then(() => console.log('断开链接成功'));
    // RongIMLib.removeEventListener(Events.CONVERSATION, listenerConversation)
    // timer = null
  })
  return {
    menu, init, menuOption,editUserInfo,closeLayer,openLayer,openBlack,delBlackFn,largePanelFn, // hwImg,
    contactsState, groupsList, friendList, selectTarget, setDisplayName, delFriendFn, sendTargetInfo, editMsg, // 联系人
    session, getSessionList, getUserSessionList, selectContacts,
    visiblePopover, delSession,  topping, disturb, // 会话右键
    chat, scrollDiv, sendMsg, openVideo,queryMsg,msgChange,aGroupMember,
    beforeUploadImg,beforeUploadFile,beforeUploadVideo,
    referFn,closeRefer,deleteFn,forwardFn,recallFn,
    fun_db_close,
  }
}
// export default api