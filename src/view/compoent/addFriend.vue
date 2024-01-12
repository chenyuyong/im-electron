<template>
  <div class="group">
  <!-- <div class="add-friend"> -->
    <div class="group-name"> 添加好友</div>

    <div class="add-friend-main">
      <div class="add-search-box">
        <el-input
          v-model="state.search"
          placeholder="搜索"
          :prefix-icon="Search"
          @keyup.enter.native="searchBtn"
          clearable 
        />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <el-button color="#F3982D" round  @click="searchBtn">搜 索</el-button>
      </div>
      <ul class="add-ul" >
        <li class="add-li" v-if="state.friendObj">
          <img :src="state.friendObj?.avatarUrl" alt="">
          <div>{{ state.friendObj?.nickname || state.friendObj?.userId}} </div>
          <el-button v-if="state.friendObj?.isRelationship==0 && (state.friendObj?.status != 20 || state.friendObj?.status != 31)"
            color="#F3982D" 
            round 
            @click="addFriendBtn(state.friendObj?.userId)"
            >加 好 友</el-button>
          <el-button v-else color="#F3982D"  round  @click="sendTargetInfo(state.friendObj, 1)">发 消 息</el-button>
        </li>
        <!-- <li>{{ state.friendObj }}</li> -->
      </ul>
      <!-- <el-button color="#F3982D" size="large" round @click="sendTargetInfo(props.currentTarget, 2)" >发 信 息</el-button> -->
    </div>
    <el-dialog title="添加好友"
      v-model="state.dialogVisible"
      width="400"
      align-center
    >
      <!-- <p>{{ chat.videoUrl }}== {{ chat.imgUrl }}</p> -->
      <div class="dialog-box">
        <el-input
          class="h-chat-text"
          v-model="state.message"
          :autosize="{ minRows: 8, maxRows: 8 }"
          :rows="2"
          type="textarea"
          maxlength="100"
          show-word-limit
          placeholder="请输入..."
        />
        <br/>
        <br/>
        <el-button color="#F3982D" round @click="addFriend(state.friendObj, 1)">发 送</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref,reactive, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search  } from '@element-plus/icons-vue'
import api from "../../api/index";
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  currentGroup:{
    type: Object,
    default: null
  },
  currentTarget:{
    type: Object,
    default: null
  },
  sendTargetInfo:{
    type: Function,
    default:()=>{}
  },
  userinfo:{
    type: Object,
    default: null
  },
  friendList:{
    type:Function,
    default: ()=>{}
  },
})
const state = reactive({
  friendObj: null,
  search: '',
  dialogVisible: false,
  message: '我是' + props.userinfo.nickname,
})
const searchBtn = () => {
  api.addFriendSearchUser(state.search).then(res => {
    if (res.code === 0) {
      if(res.data){
        state.friendObj = res.data
      } else {
        state.friendObj = null
        ElMessage({
          message: '未找到对应好友',
          type: 'success',
        })
      }
    } else {
      state.friendObj = null
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  })
}
const addFriendBtn = () => {
  state.dialogVisible = true
  // console.log('13431846640',state.message)
}
const addFriend = () => {
  const data = {
    friendId: state.friendObj.userId,
    message: state.message
  }
  api.addFriend(data).then(res => {
    if (res.code === 0) {
      // console.log(res.data)
      state.dialogVisible = false
      props.friendList(localStorage.getItem('friendVersion'))
      ElMessage({
        message: '发送成功，等待对方应答',
        type: 'success',
      })
    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  })
}
</script>
<style lang="less" scoped>
.group{
  flex: 1;
  width: calc(100% - 370px);
  display: flex;
  flex-direction: column;
  .group-name{
    width: calc(100% - 20px);
    height: 52px;
    line-height: 52px;
    border-bottom: 1px solid #ccc; 
    padding-left: 20px;
    font-size: 18px;
  }
  .add-friend-main{
    flex: 1;
    padding-top: 30px;
    overflow: auto;
    .add-search-box{
      width: 500px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .add-ul{
    }
    .add-li{
      display: flex;
      padding: 20px 50px;
      align-items: center;
      justify-content: space-between;
      img{
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }
      div{
        flex: 1;
        padding-left: 20px;
        text-align: left;
      }
    }
  }
}
.dialog-box{
  text-align: center;
  .h-chat-text{
    /deep/ textarea{
      resize: none;
    }
  }
}
</style>