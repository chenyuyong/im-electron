<template>
  <div class="home-ui">
    <div class="h-main">
      <div class="h-menu" txt="菜单列" @click="visiblePopover()">
        <div class="h-menu-user">
          <img class="" :src="menu.userinfo?.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" @click="menu.largePanel = 'userInfo'">
          <!-- {{ menu.largePanel }} -->
        </div>
        <div class="h-menu-li " :class="{'h-menu-li-active': menu.active === 1}" @click="menuOption(1)">
          <i class="iconfont icon-liaotian"></i>
        </div>
        <div class="h-menu-li " :class="{'h-menu-li-active': menu.active === 2}" @click="menuOption(2)">
          <i class="iconfont icon-tongxunlu"></i>
        </div>
        <!-- {{ menu.active }} ==
        {{ session.currentTarget }} -->
      </div>
      <div class="h-session" txt="会话列" v-if="menu.active === 1">
        <div class="h-session-search">
          <el-input
            v-model="session.search"
            placeholder="搜索"
            :prefix-icon="Search"
          />
          <i class="iconfont icon-tianjiadizhi" @click="openLayer('createGroup')"></i>
        </div>
        <ul class="h-session-ul">
          <li 
            v-for="(item , key) in session.uiList" 
            :key="key" 
            class="h-session-li"
          >
            <div
              class="h-session-li-box " 
              :class="{ 'h-session-li-active': session.currentContact.targetId === item.targetId }" 
              @click="selectContacts(item)"
              @contextmenu.prevent="visiblePopover( key)"
              txt="contextmenu=>右键事件">

              <img class="h-session-avatar" :src="item.avatarUrl" >
              <span class="h-session-unread " txt="未读" v-if="item.unread && item.notificationLevel===0">{{ item.unread }}</span>
              <span class="h-session-notificationLevel " v-if="item.unread && item.notificationLevel===5" txt="免打扰-未读" ></span>
              <div class="h-session-text-box">
                <div class="h-session-name">{{ item?.name }} </div>
                <div class="h-session-msg">
                  <span class="ft-red" v-show="item.at">[有人@我]</span> 
                  {{ item.contentJson?.content?.text }} 
                  <!-- =={{ item.targetId }} == {{ item.isTop }} --- {{ item.notificationLevel }} -->
                </div>
              </div>
              <div class="h-session-time">
                <div>{{ item.contentJson?.send_time && method.getTime(item.contentJson.send_time,2) }}</div>
                <i class="iconfont icon-xiaoximiandarao" v-if="item.notificationLevel === 5"></i>
              </div>
            </div>
            <div class="h-session-li-topping" v-if="item.isTop"></div>
            <ul class="popover-ui" v-if="session.visibles[key]">
              <li @click="topping(item)" v-if="item.isTop">取消置顶</li>
              <li @click="topping(item)" v-else>置顶</li>
              <li @click="disturb(item)" v-if="item.notificationLevel === 0">消息免打扰</li>
              <li @click="disturb(item)" v-else>允许消息通知</li>
              <li @click="delSession(item)">删除</li>
            </ul>
          </li>
        </ul>
      </div>
      <contacts txt="通讯录" v-if="menu.active === 2"
        :userinfo="menu.userinfo"
        :largePanelFn="largePanelFn"
        :selectTarget="selectTarget"
        :contactsState="contactsState"
        :groupsList="groupsList"
        :friendList="friendList" ></contacts>
      <userInfo txt="该用户信息" v-if="menu.largePanel === 'userInfo'"
        :userinfo="menu.userinfo"
        :editUserInfo="editUserInfo"
        :openLayer='openLayer'
        :openBlack="openBlack"
        >
      </userInfo>
      <groupInfo txt="群详情" v-if="menu.largePanel === 'groupInfo'"
        :currentGroup='session.currentGroup'
        :currentTarget='session.currentTarget'
        :sendTargetInfo="sendTargetInfo"
      ></groupInfo>
      <friend txt="朋友详情" v-if="menu.largePanel === 'friend'" 
        :contactsState="contactsState"
        :currentFriend="session.currentFriend"
        :delSession="delSession"
        :setDisplayName="setDisplayName"
        :sendTargetInfo="sendTargetInfo"
        :delFriendFn="delFriendFn"
        :friendList="friendList"
      ></friend>
      <addFriend txt="添加朋友" v-if="menu.largePanel === 'addFriend'"
        :sendTargetInfo="sendTargetInfo"
        :userinfo="menu.userinfo"
        :friendList="friendList"
      ></addFriend>
      <newFriend txt="新朋友" v-if="menu.largePanel === 'newFriend'"
        :sendTargetInfo="sendTargetInfo"
        :userinfo="menu.userinfo"
        :editMsg="editMsg"
        :sendMsg="sendMsg"
      ></newFriend>
      <div class="h-chat" txt="聊天列" @click="visiblePopover()" v-else-if="menu.largePanel === 'chat'">
        <div class="h-chat-name">
          <!-- {{ session.isTopNumber }}- -->
          {{ session.currentContact?.name }}
          <span v-if="session.currentContact?.groupMemberCount">({{ session.currentContact?.groupMemberCount }})</span>
        </div>
        <div class="h-chat-panel" ref="scrollDiv" txt="显示消息面板" >
          <ul class="panel-box" >
            <!--  v-show="item.uiContent.type !== 'cmd'" -->
            <li class="panel-list" v-for="(item, key) in chat.chatList" :key="key" v-show="item.uiContent?.type !== 'cmd'">
              <div class="panel-time" v-if="item.uiContent?.send_time">
                {{method.getTime(item.uiContent.send_time, 2) }}
              </div>
              <!-- <div class="panel-time" >
                {{ item }} 
              </div> -->
              <div class="panel-me" v-if="item.senderUserId === menu.userinfo.userId && item.uiContent?.type" txt="自己样式">
                <div class="panel-group-box">
                  <!-- <h6 class="panel-group-sender">{{ item.uiContent.sender_id }}</h6> -->
                  <el-popover
                    v-if="chat.recallMsgArr.findIndex(v => v.content?.jsonData?.messageId === item.uiContent.local_msg_id) <= -1"
                    placement="left"
                    :width="150"
                    trigger="contextmenu"
                    :persistent="false"
                  >
                    <template #reference>
                      <div class="chat-text"
                        v-if="item.uiContent && item.uiContent.type === 'text'"
                        txt="传输类型"
                        v-html="item.uiContent && item.uiContent.content && item.uiContent.content.text">
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'image'">
                        <img :src="item.uiContent && item.uiContent.content.url" alt="" @click="openVideo(item.uiContent, 'image')">
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'file'">
                        <div class="chat-file">
                          <div class="chat-file-bg">
                            <i class="iconfont icon-wenjianjia1"></i>
                          </div>
                          <div class="chat-file-text">
                            <h2>{{ item.uiContent.content?.name }}</h2>
                            <span> {{ item.uiContent.content.size }}kb</span>
                          </div>
                          <div class="chat-file-download" @click="method.downFileCros(item.uiContent.content.url, item.uiContent.content?.name)">
                            <i class="iconfont icon-xiazai"></i>
                          </div>
                        </div>
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'voice'" 
                        @click="audioFn(item.uiContent.content.url)" >
                        <div class="my-chat-voice" :style="{width: (item.uiContent.content.duration*2 + 50) +'px'}">
                          <span>{{ item.uiContent.content.duration }}"</span>
                          <i class="iconfont icon-myshengyin"></i>
                        </div>
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'video'" >
                        <div class="chat-video" @click="openVideo(item.uiContent, 'video')">
                          <img
                            :width="item.uiContent.content.thumb_width"
                            :height="item.uiContent.content.thumb_height" 
                            :src="item.uiContent.content.thumb_url || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" 
                            alt="">
                          <i class="iconfont icon-shipin2"></i>
                          <span class="chat-video-time">{{ method.duration(item.uiContent.content.duration) }}</span>
                        </div>
                      </div>
                      <div class="chat-text" v-if="item.uiContent?.type === 'refer'">
                        <div class="chat-refer">
                          <h3 >{{ item.uiContent?.content.sender_nickName }}</h3>
                          <div v-if="queryMsg(item.uiContent?.content.refer_msg_id)">
                            <h4 
                              v-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'text' || 
                              queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'refer' " 
                              class="chat-refer-text" 
                              > 
                              {{ queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.text }}
                            </h4>
                            <h4 
                              v-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'file'" 
                              class="chat-refer-text" 
                              > 
                              [文件]{{ queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.name }}
                            </h4>
                            <img 
                              v-else-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'image'" 
                              :src="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.url" 
                              alt="">
                            <img 
                              v-else-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'video'" 
                              :src="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.thumb_url" 
                              alt="">
                          </div>
                          <h4 v-else>[无此消息]</h4>
                        </div>
                        <div v-html="item.uiContent?.content.text"></div>
                      </div>
                      
                    </template>
                    <ul class="context-menu">
                      <li @click="method.cotyText(item.uiContent.content.text)" v-if="item.uiContent && item.uiContent.type === 'text'">复制</li>
                      <li @click="referFn(item.uiContent)" v-if="item.uiContent?.type !== 'voice'">引用</li>
                      <li @click="deleteFn(item)">删除</li>
                      <li @click="forwardFn(item.uiContent)">转发</li>
                      <li @click="recallFn(item.uiContent)" v-if="Date.now() - item.uiContent.send_time < 180000">撤回</li>
                    </ul>
                  </el-popover>
                  <div txt="手机查看"
                    class="panel-other-type" 
                    v-if="item.uiContent?.type && 
                      !(item.uiContent.type === 'text' || 
                      item.uiContent.type === 'image' || 
                      item.uiContent.type === 'file' ||
                      item.uiContent.type === 'video' ||
                      item.uiContent.type === 'refer'||
                      item.uiContent.type === 'prompt'||
                      item.uiContent.type === 'voice')">
                    [发送一条消息，请在手机上查看]
                  </div>
                  <div txt="系统消息"
                    class="panel-other-type" 
                    v-if="item.uiContent?.type === 'prompt'">
                    {{ item.uiContent?.content?.desc }}
                  </div>
                  <div 
                    class="panel-other-type" 
                    v-if="chat.recallMsgArr.findIndex(v => v.content?.jsonData?.messageId === item.uiContent.local_msg_id) > -1"
                  >
                    [撤回一条消息]
                  </div>
                </div>
                <img 
                  class="chat-avatar" 
                  :src="menu.userinfo && menu.userinfo.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'"
                >
              </div>
              <div class="panel-other" v-if="item.senderUserId !== menu.userinfo.userId && item.uiContent?.type" txt="对方样式">
                <img
                  v-if="session.currentContact.type === 1"
                  txt="1:用户 2:群组"
                  class="chat-avatar"
                  :src="session.currentContact.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'"
                >
                <img
                  v-else
                  class="chat-avatar"
                  :src="chat.groupEnum[item.uiContent?.sender_id]  && 
                   chat.groupEnum[item.uiContent?.sender_id]['avatarUrl'] 
                  || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'"
                >
                <div class="panel-group-box">
                  <h6 class="panel-group-sender" v-if="session.currentContact.type !== 1">
                    {{ chat.groupEnum[item.uiContent?.sender_id] && 
                      (chat.groupEnum[item.uiContent?.sender_id]['userRemark'] || chat.groupEnum[item.uiContent?.sender_id]['nickname'] )
                    }}
                    <!-- == {{ chat.groupEnum[item.uiContent.sender_id] }} -->
                  </h6>
                  <el-popover
                    v-if="chat.recallMsgArr.findIndex(v => v.content?.jsonData?.messageId === item.uiContent.local_msg_id) <= -1"
                    placement="right"
                    :width="150"
                    trigger="contextmenu"
                    :persistent="false"
                  >
                    <template #reference>
                      <div v-if="item.uiContent && item.uiContent.type === 'text'" txt="传输类型"
                        class="chat-text"
                        v-html="item.uiContent && item.uiContent.content && item.uiContent.content.text">
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'image'">
                        <img :src="item.uiContent && item.uiContent.content.url" alt="" @click="openVideo(item.uiContent, 'image')">
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'file'">
                        <div class="chat-file">
                          <div class="chat-file-bg">
                            <i class="iconfont icon-wenjianjia1"></i>
                          </div>
                          <div class="chat-file-text">
                            <h2>{{ item.uiContent.content.name }}</h2>
                            <span> {{ item.uiContent.content.size }}kb</span>
                          </div>
                          <div class="chat-file-download" @click=" method.downFileCros(item.uiContent.content.url, item.uiContent.content.name)">
                            <i class="iconfont icon-xiazai"></i>
                          </div>
                        </div>
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'voice'" 
                        @click="audioFn(item.uiContent.content.url)">
                        <div class="chat-voice" :style="{width: (item.uiContent.content.duration*2 + 50) +'px'}">
                          <i class="iconfont icon-shengyin"></i>
                          <span>{{ item.uiContent.content.duration }}"</span>
                        </div>
                      </div>
                      <div class="chat-text" v-else-if="item.uiContent && item.uiContent.type === 'video'">
                        <div class="chat-video" @click="openVideo(item.uiContent, 'video')">
                          <img 
                            :width="item.uiContent.content.thumb_width"
                            :height="item.uiContent.content.thumb_height" 
                            :src="item.uiContent.content.thumb_url  || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" 
                            alt="">
                          <i class="iconfont icon-shipin2"></i>
                          <span class="chat-video-time">{{ method.duration(item.uiContent.content.duration) }}</span>
                        </div>
                      </div>
                      <div v-else-if="item.uiContent?.type === 'refer'"
                        class="chat-text"
                        >
                        <div class="chat-refer">
                          <h3 >{{ item.uiContent?.content.sender_nickName }}</h3>
                          <div v-if="queryMsg(item.uiContent?.content.refer_msg_id)">
                            <h4 
                              v-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'text' || 
                              queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'refer' " 
                              class="chat-refer-text" 
                              > 
                              {{ queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.text }}
                            </h4>
                            <h4 
                              v-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'file'" 
                              class="chat-refer-text" 
                              > 
                              [文件]{{ queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.name }}
                            </h4>
                            <img 
                              v-else-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'image' " 
                              :src="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.url" 
                              alt="">
                            <img 
                              v-else-if="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.type === 'video'" 
                              :src="queryMsg(item.uiContent?.content.refer_msg_id).uiContent.content.thumb_url" 
                              alt="">
                          </div>
                          <h4 v-else>[无此消息]</h4>
                        </div>
                        <div v-html="item.uiContent?.content.text"></div>
                      </div>
                    </template>
                    <ul class="context-menu">
                      <li @click="method.cotyText(item.uiContent?.content.text)" v-if="item.uiContent?.type === 'text'">复制</li>
                      <li @click="referFn(item.uiContent)" v-if="item.uiContent?.type !== 'voice'">引用</li>
                      <li @click="deleteFn(item)">删除</li>
                      <li @click="forwardFn(item.uiContent)">转发</li>
                    </ul>
                  </el-popover>
                  <div txt="手机查看"
                    class="panel-other-type"
                    v-if="item.uiContent && 
                      !(item.uiContent.type === 'text' || 
                      item.uiContent.type === 'image' || 
                      item.uiContent.type === 'file' ||
                      item.uiContent.type === 'video'||
                      item.uiContent.type === 'refer'||
                      item.uiContent.type === 'prompt' ||
                      item.uiContent.type === 'voice')">
                    [收到一条消息，请在手机上查看]
                  </div>
                  <div txt="系统消息"
                    class="panel-other-type" 
                    v-if="item.uiContent?.type === 'prompt'">
                    {{ item.uiContent?.content?.desc }}
                  </div>
                  <div 
                    class="panel-other-type" 
                    v-if="chat.recallMsgArr.findIndex(v => v.content?.jsonData?.messageId === item.uiContent.local_msg_id) > -1"
                  >
                    [撤回一条消息]
                  </div>
                </div>
              </div>
            </li>
            <li>
              <!-- 语音 -->
              {{ chat.audioUrl }}
              <audio 
                :src="chat.audioUrl" 
                controls="controls"
                id="audioId"
                hidden="true"
              ></audio>
            </li>
            <!-- <li>弹窗 = {{ session.visibles }}</li> -->
            <!-- <li style="padding-bottom:100px" >引用{{ chat.referData }} 
              <hr>
            </li> -->
            <!-- <li class="panel-list">  session.currentContact 当前会话对象 == {{ session.currentContact }}</li> -->
            <!-- <li class="panel-list">   撤回数组 == {{ chat.recallMsgArr  }}</li> -->
            <!-- <li class="panel-list">chat.chatList 聊天消息列表 === {{ chat.chatList }}</li> -->
          </ul>
        </div>
        <div class="h-chat-edit"  txt="发送消息">
          <div class="h-chat-refer" v-if="chat.sendType === 'refer'">
            <div class="">
              <h3>
                <span v-if="session.currentContact.type !== 1">
                  {{ chat.groupEnum[chat.referData.sender_id] && 
                    (chat.groupEnum[chat.referData.sender_id]['userRemark'] || 
                    chat.groupEnum[chat.referData.sender_id]['nickname'] )
                  }}
                </span>
                <span v-else txt="单聊">
                  <template v-if="chat.referData.sender_id === menu.userinfo.userId" >
                    {{ menu.userinfo.nickname }} 
                  </template>
                  <template v-else>
                    {{ session.currentContact?.name }} 
                  </template>
                </span>
                <i class="iconfont icon-close" @click="closeRefer"></i>
              </h3>
              <h3 v-if="chat.referData.type === 'text' || chat.referData.type === 'refer'">{{ chat.referData.content.text }}</h3>
              <img v-else-if="chat.referData.type === 'image'" :src="chat.referData.content.url" alt="">
              <img v-else-if="chat.referData.type === 'video'" :src="chat.referData.content.thumb_url" alt="">
              <h3 v-if="chat.referData.type === 'file'">[文件]{{ chat.referData.content.name }}</h3>
            </div>
          </div>
          <div class="h-chat-file" txt="图片-文件">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeUploadImg"
              accept=".jpg,.jpeg,.png,.gif"
            >
              <!-- action="https://niannian-api-web-dev.miaojiahui.cn/common/resource/upload"
              :on-success="handleAvatarSuccess"
              :headers="{ Authorization: menu.userinfo.token,appType:'web' }" -->
              <i class="iconfont icon-tupian"></i>
            </el-upload>
            <!-- <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeUploadVideo"
              accept=".mp4"
            >
              <i class="iconfont icon-video"></i>
            </el-upload> -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeUploadFile"
            >
              <i class="iconfont icon-wenjianjia1"></i>
            </el-upload>
            <!-- <i class="iconfont icon-tupian"></i> -->
            <!-- <i class="iconfont icon-wenjianjia1" @click="getHistoryMsg"></i> -->
          </div>
          <div class="h-chat-box">
            <el-popover
              :width="150"
              trigger="contextmenu"
              :persistent="false"
              :visible="chat.aVisible"
            >
              <ul class="context-menu">
                <li v-for="(item,key) in chat.groupList" :key="key" @click="aGroupMember(item)">{{ item.userRemark || item.nickname }}</li>
              </ul>
              <template #reference>
                <el-input
                  class="h-chat-text"
                  v-model="chat.message"
                  @input="msgChange"
                  :autosize="{ minRows: 8, maxRows: 8 }"
                  :rows="2"
                  type="textarea"
                  placeholder="请输入..."
                />
              </template>
            </el-popover>
            <el-button
              type="primary" 
              plain 
              :loading="chat.loading"
              @click="sendMsg({type: chat.sendType})">
              <span v-if="chat.resend">重发</span>
              <span v-else>发送</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <el-dialog txt="图片,视频播放"
      v-model="chat.dialogVisible"
      width="70%"
      align-center
    >
      <!-- <p>{{ chat.videoUrl }}== {{ chat.imgUrl }}</p> -->
      <div class="dialog-video-box">
        <video
          v-if="chat.videoUrl"
          :src="chat.videoUrl"
          class="dialog-video"
          autoplay="true"
          controls="true"
          muted="true"
          object-fit="fill"
          playsinline="true"
          webkit-playsinline="true"
          x5-playsinline="true"
          x5-video-player-type="h5"
          x5-video-orientation="landscape|portrait"
          x-webkit-airplay="deny"
          disableRemotePlayback="true"
        ></video>
        <img v-if="chat.imgUrl" :src="chat.imgUrl" class="dialog-video" alt="">
      </div>
    </el-dialog>
    <el-dialog title="黑名单"
      center
      v-model="menu.black"
      width="500px"
      align-center
    >
      <ul class="dialog-video-box">
        <li class="black-li" v-for="(item,key) in menu.blackArr" :key="key">
          <img :src="item.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" alt="">
          <div class="black-li-name">{{ item.nickname }}</div>
          <!-- <span class="black-li-btn">移除黑名单</span> -->
          <el-button color="#F3982D" round  @click="delBlackFn(item.friendId)">移除黑名单</el-button>
        </li>
      </ul>
    </el-dialog>
    <div class="layer" v-if="menu.layerArr.indexOf(menu.layerStr) >= 0">
      <!-- 蒙层 -->
      <forgotPassword :closeLayer='closeLayer' v-if="'forgotPassword' === menu.layerStr" :userinfo="menu.userinfo"></forgotPassword>
      <createGroup :closeLayer='closeLayer' v-if="'createGroup' === menu.layerStr" :groupsList="groupsList"></createGroup>
      <forward :closeLayer='closeLayer' v-if="'forward' === menu.layerStr" :sendMsg="sendMsg"></forward>
      <!-- {{chat.forwardObj}} -->
    </div>
  </div>
</template>

<script setup >
// import "../script/plugin/esdk-obs-browserjs.3.23.5.min.js"
// import "../script/plugin/aa.js"
import method from '../script/method'
import { Plus, Search } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, defineProps, nextTick } from 'vue'
import contacts from "./compoent/contacts.vue"
import userInfo from "./compoent/userInfo.vue"
import forgotPassword from "./compoent/forgotPassword.vue"
import createGroup from "./compoent/createGroup.vue"
import forward from "./compoent/forward.vue"
import groupInfo from "./compoent/groupInfo.vue"
import friend from "./compoent/friend.vue"
import addFriend from "./compoent/addFriend.vue"
import newFriend from "./compoent/newFriend.vue"

import { imData } from './compoent/hooks.js';
{
  contacts,
  userInfo,
  createGroup,
  forward,
  groupInfo,
  friend,
  addFriend,
  newFriend,
  forgotPassword
}
onMounted(() => {
  var audioId = document.getElementById('audioId');
})
const audioFn = (url) => {
  console.log('audioFn', url, audioId, audioId?.id)
  chat.audioUrl = url
  nextTick(() => {
    audioId.play()
  })
}
const {
  menu, menuOption,init,editUserInfo,closeLayer,openLayer,openBlack,delBlackFn,largePanelFn, // hwImg,
  contactsState, groupsList, friendList, selectTarget, setDisplayName, delFriendFn, sendTargetInfo, editMsg,
  session, getSessionList, getUserSessionList, selectContacts, 
  visiblePopover, delSession, topping, disturb,
  chat, scrollDiv, sendMsg,  getHistoryMsg, openVideo, queryMsg, msgChange,aGroupMember,
  beforeUploadImg,beforeUploadFile,beforeUploadVideo,
  referFn,closeRefer,deleteFn,forwardFn,recallFn,
} = imData();
init()
</script>

<style lang="less" scoped>
.text-align-center {
  display: flex;
  align-items: center;
}
.text-ellipsis{
  text-wrap: nowrap;
  white-space-collapse: collapse;
  overflow: hidden;
  text-overflow: ellipsis;
}
.layer{
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0,0,0,0.2);

}
.context-menu{
  margin: -12px;
  li{
    // padding: 12px;
    line-height: 40px;
    font-size: 16px;
    background: #fff;
    text-align: center;
    cursor:pointer;
    &:hover{
      background: #ebf3fb;
    }
  }
}
.dialog-video-box{
  text-align: center;
  padding: 20px 0;
  min-height: 200px;
  max-height: 700px;
  overflow: auto;
  .dialog-video{
    margin: 0 auto;
    max-width: 800px;
    max-height: 700px;
  }
  .black-li{
    .text-align-center;
    border-bottom:1px solid #eee; 
    padding-bottom: 6px;
    padding-top: 6px;
    img{
      width: 50px;
      height: 50px;
      border-radius: 50px;
    }
    .black-li-name{
      flex:1;
      text-align: left;
      font-size: 18px;
      padding-left:12px ;
    }
    .black-li-btn{
      background: #F3982D;
      padding: 6px 10px;
      font-size: 16px;
      color:#fff;
      border-radius: 30px;
    }

  }
}
.h-main{
  flex: 1;
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  
  .h-menu{
    // min-width: 60px;
    // max-width: 90px;
    width: 60px;
    height: 100%;
    background: #E6E4E1;
    .h-menu-user{
      text-align: center;
      margin: 30px auto;
      img{
        min-width: 40px;
        max-width: 60px;
        min-height: 40px;
        max-height: 60px;
        width: 66.6666%;
        border-radius: 50%;
      }
    }
    .h-menu-li{
      text-align: center;
      margin: 12px auto;
      padding: 10px 0;
      &.h-menu-li-active{
        background: #F3982D;
        i{
          color: #fff
        }
      }
      i{
        font-size: 36px;
      }
    }
  }
  .h-session{
    // min-width: 300px;
    // max-width: 450px;
    width: 310px;
    background: #F7F7F7;
    border-right: 1px solid rgb(227, 229, 230);
    .h-session-search{
      .text-align-center;
      padding: 10px;
      background: #F7F7F7;
      // border-bottom: 1px solid #ccc;
      i{
        font-size: 20px;
        margin-left: 10px;
      }
    }
    .h-session-ul{
      background: #fff;
      height: calc(100vh - 52px);
      overflow: auto;
    }
  }
  .h-chat{
    flex: 1;
    display: flex;
    flex-direction: column;
    width: calc(100% - 370px);
    // background: #F7F7F7;
    .h-chat-name{
      .text-ellipsis;
      width: calc(100% - 20px);
      height: 52px;
      line-height: 52px;
      border-bottom:1px solid #ccc; 
      padding-left: 20px;
      font-size: 18px;
    }
    .h-chat-panel{
      flex: 1;
      height: calc(100vh - 272px);
      overflow: auto;
      position: relative;
    }
  }
}
.panel-box{
  width: 100%;
  font-size: 14px;
  line-height: 18px;
  .panel-list{
    width: calc(100% - 40px);
    // width: calc(100vw - 30% - 40px);
    max-width: calc(100vw - 40px);
    padding: 20px;
    word-wrap: break-word
  }
  .panel-time{
    text-align: center;
    color: #999;
    padding-bottom: 10px;
  }
  .panel-group-box{
    // display: inline-block;
    // float: right;
  }
  .panel-me{
    display: flex;
    justify-items: self-end;
    justify-content: flex-end;
    .panel-group-sender{
      padding-right: 16px;
    }
    .chat-text{
      display: inline-block;
      float: right;
    }
    .chat-voice{
      min-width: 50px;
      max-width: 150px;
    }
    .my-chat-voice{
      min-width: 50px;
      max-width: 150px;
      text-align: right;
    }
  }
  .panel-other{
    display: flex;
    justify-items: self-start;
    justify-content: flex-start;
    .panel-group-sender{
      padding-left: 16px;
    }
    .chat-text{
      display: inline-block;
      float: left;
    }
  }
  .panel-other-type{
    word-wrap: break-word;
    max-width: 324px;
    font-size: 16px;
    line-height: 24px;
    margin: 0 16px ;
    padding: 8px 12px;
    color:#fff;
    background: #ccc;
    border-radius: 8px;
    
  }
  .chat-text{
    word-wrap: break-word;
    max-width: 324px;
    font-size: 16px;
    line-height: 24px;
    margin: 0 16px ;
    padding: 8px 12px;
    color:#333;
    background: rgb(215, 238, 253);
    border-radius: 8px;
    .chat-refer{
      border-bottom: 1px solid #d1d1d1;
      color: #999;
      font-size: 14px;
      line-height: 24px;
      h3{
        height: 18px;
        line-height: 24px;
        border-left: 2px solid #d1d1d1;
        padding-left:6px;
         
      }
      h4 {
        .text-ellipsis;
        max-width: 350px;
      }
      img{
        max-width: 50px;
        margin-top: 8px;
      }
    }
    .chat-video{
      position: relative;
      img{
        max-width: 200px;
        max-height: 300px;
      }
      .iconfont{
        font-size: 50px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform:translate(-50%,-50%);
        color:#fff;
      }
      .chat-video-time{
        position: absolute;
        bottom: 0px;
        right: 0px;
        color:#fff;
      }
    }
    .chat-file{
      .text-align-center;
      justify-content: space-between;
      width: 300px;
      padding: 10px;
    }
    .chat-file-bg {
      width: 60px;
      height: 60px;
      line-height: 60px;
      background: #a0c538;
      text-align: center;
      color: #fff;
      border-radius: 8px;
      margin-right: 12px;
    }
    .chat-file-text{
      flex: 1;
      h2{
        .text-ellipsis;
        width: 170px;
      }
    }
    .chat-file-download{
      width: 50px;
      height: 50px;
      line-height: 50px;
      background: #fff;
      text-align: center;
      color: #60a7fe;
      border-radius: 50px;
      margin-left: 10px;
    }
    .icon-xiazai{
      font-size: 30px;
    }
    .icon-wenjianjia1,.icon-video{
      font-size: 40px;
    }
    img{
      max-width: 120px;
    }
  }
  .chat-avatar{
    width: 42px;
    height: 42px;
    border-radius: 50%;
  }
}
.h-session-li{
  position: relative;
  .popover-ui{
    position: absolute;
    width: 150px;
    height: 150px;
    line-height: 50px;
    box-shadow:0px 0px 12px rgba(0, 0, 0, 0.12);
    border: 1px solid #e4e7ed;
    background: #fff;
    z-index: 9;
    right: 0;
    top:0;
    li{
      cursor: pointer;
      text-align: center
    }
  }
  .h-session-li-topping{
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    border-top: 20px solid #4790ee;
    border-right: 20px solid transparent;
  }
  .h-session-li-box{
    .text-align-center;
    justify-content: space-between;
    height: 80px;
    padding: 0 12px 0 20px;
    text-align: left;
    position: relative;
    &:hover{
      background: #e9e9e9;
    }
    &.h-session-li-active{
      background: #eee;
    }
    .h-session-unread{
      position: absolute;
      top: 12px;
      left: 50px;
      height:20px;
      line-height: 20px;
      padding: 0 6px;
      background: #ff4141;
      color:#fff;
      border-radius: 1em;
    }
    .h-session-notificationLevel{
      position: absolute;
      top: 12px;
      left: 50px;
      height:6px;
      width: 6px;
      border-radius: 4px;
      background: #ff4141;
    }
    // width: calc(100%-80px);
    .h-session-avatar{
      width: 44px;
      height: 44px;
      border-radius: 50%;
    }
    .h-session-text-box{
      line-height: 24px;
      padding-left: 12px;
      width: calc(100% - 100px);
      .h-session-name{
        font-size: 16px;
        font-weight: 400;
        color: #111f2c;
      }
      .h-session-msg{
        color: rgb(160, 165, 171);
        font-size: 14px;
        .text-ellipsis;
        // text-wrap: nowrap;
        // white-space-collapse: collapse;
        // overflow: hidden;
        // text-overflow: ellipsis;
      }
    }
    .h-session-time{
      width: 50px;
      color: #999;
      text-align: right;
    }
  }
}

.h-chat-edit{
  height: 220px;
  border-top:1px solid #ccc; 
  padding: 10px 20px ;
  .h-chat-file{
    .text-align-center;
    justify-content: flex-start;
    i{
      font-size: 28px;
      margin-right: 10px;
      cursor: pointer;
    }
  }
  .h-chat-box{
    display: flex;
    align-items: flex-end;
    height: 180px;

    .h-chat-text{
      height: 180px;
      /deep/ textarea{
        resize: none;
        border: 0;
        outline: none;
        background-color: rgba(0, 0, 0, 0);// 透明背景
      }
    }

  }

}
.h-chat-refer{
  position: fixed;
  bottom: 241px;
  left: 360px;
  line-height: 30px;
  padding: 10px;
  background: #f9f9f9;
  div{
    border-left: 1px #ddd solid;
    padding-left: 10px;
  }
  h3{
    .text-ellipsis;
    .text-align-center;
    justify-content: space-between;
    width: calc(100vw - 396px);
    i{
      cursor: pointer;
      color:#666;
      font-size: 14px;
    }
  }
  img{
    width: 60px;
  }
}
</style>
