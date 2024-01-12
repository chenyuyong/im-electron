<template>
  <div class="group">
  <!-- <div class="add-friend"> -->
    <div class="group-name"> 新的朋友</div>

    <div class="add-friend-main">
      <ul class="add-ul" >
        <li class="add-li" v-for="(item, key) in state.list" :key="key">
          <img :src="item.avatarUrl " alt="">
          <div>{{item.message}} </div>
          <template v-if="item.status==11">
            <el-button
              color="#F3982D" 
              round 
              @click="agree(item.friendId,key)"
              >同 意</el-button>
            <el-button
              type="info"
              round 
              @click="ignore(item.friendId,key)"
            >忽 略</el-button>
          </template>
          <span>{{item.status==21?'已忽略':item.status==20?'已同意':item.status==30?'已删除':item.status==32?'已过期':''}}</span>

            <!-- {{ item }} -->
        </li>
        <li>
          <!-- {{ state.list }} -->
        </li>
      </ul>
    </div>
    <div class="new-friend-btm">
      <el-pagination
        v-model:current-page="state.pageNow"
        :hide-on-single-page="true"
        :page-size="10"
        :total="state.totalSize"
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
      />
    </div>

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
  sendTargetInfo:{
    type: Function,
    default:()=>{}
  },
  editMsg:{
    type: Function,
    default:()=>{}
  },
  sendMsg:{
    type: Function,
    default:()=>{}
  },
  userinfo:{
    type: Object,
    default: null
  },
})
const state = reactive({
  list: [],
  pageNow: 1,
  pageSize: 10,
  totalPage: 1,
  totalSize: 0,
  friendObj: null,
})
const newFriendPage = () => {
  const data = {
    pageNow: state.pageNow,
    pageSize: 10
  }
  api.newFriendPage(data).then(res => {
    if (res.code === 0) {
      // console.log(res.data)
      state.list= res.data.list
      state.totalSize= res.data.totalSize

    } else {
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  })
}
newFriendPage()
const handleCurrentChange = (e) => {
  newFriendPage()
}
const addFriendBtn = () => {
}
const agree = (friendId,key) => { // 同意成为好友
  props.editMsg('我们已经是好友了，赶快来聊天吧~')
  const data = {
    friendId: friendId,
  }
  api.agree(data).then(res => {
    if (res.code === 0) {
      // console.log(res.data)
      state.list[key]['status'] = 20
      props.sendMsg({
        type: 'text',
        contactType: 1,
        targetId: friendId,
        extra: '=20='
      })
    } else {
      props.editMsg('')
      ElMessage({
        message: res.msg,
        type: 'error',
      })
    }
  })
}
const ignore = (friendId,key) => {
  const data = {
    friendId: friendId,
  }
  api.ignore(data).then(res => {
    if (res.code === 0) {
      state.list[key]['status'] = 21
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
.new-friend-btm{
  height: 70px;
  // border-top: 1px solid #ccc; 
  padding: 10px 20px ;
  text-align: center;
}
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
    width: 100%;
    flex: 1;
    height: calc(100vh - 152px);
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    padding-top: 30px;
    display: flex;
    /* 设置弹性元素排列方式 */
    flex-direction: row;
    /* 设置自动换行 */
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    .add-search-box{
      width: 500px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .add-ul{
      width:100%;
    }
    .add-li{
      width: 80%;
      min-width: 600px;
      display: flex;
      padding: 20px 50px;
      align-items: center;
      justify-content: space-between;
      overflow: hidden;
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
}
</style>