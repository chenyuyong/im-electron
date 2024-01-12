<template>
  <div class="h-session" txt="通讯录">
    <div class="h-session-search ">
      <el-input
        v-model="contacts.search"
        @input="changeSearch"
        class=""
        placeholder="搜索"
        :prefix-icon="Search"
      />
      <i class="iconfont icon-yaoqing" @click="props.largePanelFn('addFriend')"></i>
    </div>
    <div class="session-contacts">
      <div class="session-contacts-li">
        <h2>通讯录</h2>
        <ul class="contacts-ul">
          <li
            class="contacts-li " @click="props.largePanelFn('newFriend')">
            <i class="iconfont icon-xunfangliliang"></i>
            <!-- <img class="h-session-avatar" src="https://static.chart.miaojiahui.cn/image/default_avatar.png" > -->
            <div class="h-session-text-box">
              新的朋友
            </div>
          </li>
        </ul>
      </div>

      <div class="session-contacts-li">
        <h3>群组</h3>
        <!-- {{ contacts.groupsArr }} -->
        <ul class="contacts-ul">
          <li
            v-show="!contacts.search"
            class="contacts-li " 
            v-for="(item,key) in contacts.groupsArr"
            :key="key"
            @click="selectTarget(item, 'groupInfo')">
            <img class="h-session-avatar" :src="item.portraitUri|| 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" >
            <div class="h-session-text-box">
              <div>{{ item.remark || item.nickName }}</div>
              <div v-if="item.remark" class="nick-name">昵称：{{ item.nickName }}</div>
            </div>
            <span class="contacts-leader"  v-if="props.userinfo.userId==item.ownerId">群主</span>
          </li>
          <li
            v-show="contacts.search"
            txt="搜索"
            class="contacts-li " 
            v-for="(item,key) in contacts.groupsArrSearch"
            :key="key"
            @click="selectTarget(item, 'groupInfo')">
            <img class="h-session-avatar" :src="item.portraitUri|| 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" >
            <div class="h-session-text-box">
              <div>{{ item.remark || item.nickName }}</div>
              <div v-if="item.remark" class="nick-name">昵称：{{ item.nickName }}</div>
            </div>
            <span class="contacts-leader"  v-if="props.userinfo.userId==item.ownerId">群主</span>
          </li>
        </ul>
      </div>

      <div class="session-contacts-li">
        <h3>联系人</h3>
        <ul class="contacts-ul">
          <li
            class="contacts-li " 
            v-show="!contacts.search"
            v-for="(item,key) in contacts.friendArr"
            :key="key"
            @click="selectTarget(item, 'friend')">
            <img class="h-session-avatar" :src="item.avatarUrl|| 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" >
            <div class="h-session-text-box">
              <div>{{ item.displayName || item.nickname }}</div>
              <div v-if="item.displayName" class="nick-name">昵称：{{ item.nickname }}</div>
              <!-- {{ item.nickname }} -->
            </div>
          </li>

          <li
            class="contacts-li " 
            txt="搜索"
            v-show="contacts.search"
            v-for="(item,key) in contacts.friendArrSearch"
            :key="key"
            @click="selectTarget(item, 'friend')">
            <img class="h-session-avatar" :src="item.avatarUrl|| 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" >
            <div class="h-session-text-box">
              <div>{{ item.displayName || item.nickname }}</div>
              <div v-if="item.displayName" class="nick-name">昵称：{{ item.nickname }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,reactive} from 'vue'
const props = defineProps({
  userinfo:{
    type: Object,
    default: null
  },
  selectTarget:{
    type:Function,
    default: ()=>{}
  },
  largePanelFn:{
    type:Function,
    default: ()=>{}
  },
  contactsState:{
    type: Object,
    default: null
  },
  groupsList:{
    type:Function,
    default: ()=>{}
  },
  friendList:{
    type:Function,
    default: ()=>{}
  },
})
const init = () => {
  props.groupsList(localStorage.getItem('groupsVersion'))
  props.friendList(localStorage.getItem('friendVersion'))
}
init()
const contacts = reactive({
  groupsArr: props.contactsState.groupsArr ,// JSON.parse(localStorage.getItem('groupsArr')),
  friendArr: props.contactsState.friendArr ,// JSON.parse(localStorage.getItem('friendArr')),
  groupsArrSearch: [],
  friendArrSearch: [],
  search:'',
})
const changeSearch = (e) =>{
  if(e !== ''){
    contacts.groupsArrSearch = contacts.groupsArr.filter(item => {
      return (item.nickName.includes(contacts.search) || item.remark?.includes(contacts.search) )
    })
    contacts.friendArrSearch = contacts.friendArr.filter(item => {
      return (item.nickname.includes(contacts.search) || item.displayName?.includes(contacts.search) )
    })
  } else {
    contacts.groupsArrSearch = []
    contacts.friendArrSearch = []
  }
}
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
.session-contacts{
  background: #fff;
  height: calc(100vh - 52px);
  overflow: auto;
  .session-contacts-li{
    padding-bottom: 12px;

  }
  h2{
    padding: 20px 20px 20px 0;
    margin-left: 20px;
    border-bottom: 1px #f0f0f0 solid;
    font-size: 18px;
  }
  h3{
    padding: 20px 20px 20px 0;
    margin-left: 20px;
    border-bottom: 1px #f0f0f0 solid;
    font-size: 16px;
    color:#666666;
  }
  .icon-xunfangliliang{
    font-size: 30px;
  }
  .contacts-leader{
    font-size: 14px;
    padding: 4px 6px;
    border-radius: 20px;
    background: #F3982D;
    color:#fff;
  }
  .contacts-ul{
    background: #fff;
    overflow: auto;
  }
  .contacts-li{
    .text-align-center;
    justify-content: space-between;
    height: 80px;
    padding: 0 12px 0 20px;
    text-align: left;
    font-size: 16px;
    &:hover{
      background: #eee;
    }
    &.h-session-li-active{
      background: #eee;
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
      flex: 1;
      .nick-name{
        font-size: 14px;
        color: #666;
      }
      // width: calc(100% - 100px);
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
      width: 40px;
    }
  }
}

.h-session{
    // min-width: 300px;
    // max-width: 450px;
    width: 300px;
    background: #F7F7F7;
    border-right: 1px solid rgb(227, 229, 230);
    .h-session-search{
      .text-align-center;
      padding: 10px;
      background: #f0f0f0;
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
</style>
