<template>
  <div class="user-info">
    <div class="friend-top">
      <img  class="user-info-img" :src="props.currentFriend?.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" alt="">
      <span  class="user-info-name">{{ props.currentFriend?.nickname }}</span>
      
      <el-popconfirm
        confirm-button-text="删除"
        cancel-button-text="取消"
        :icon="InfoFilled"
        icon-color="#f56c6c"
        confirm-button-type="danger"
        title="是否删除改好友?"
        width="180"
        @confirm="delFriendFn"
        @cancel="cancelEvent"
      >
        <template #reference>
          <i class="iconfont icon-minus" ></i>
        </template>
      </el-popconfirm>
    </div>
    <ul class="">
      <li  class="info-li">
        <span  class="info-key">发现ID</span>
        <div  class="info-val" >
          {{ props.currentFriend?.externalUserId }}
        </div>
      </li>
      <li  class="info-li">
        <span  class="info-key">备注名</span>
        <div  class="info-val" >
          <span  class="user-info-name" v-show="!inputShow" >{{ props.currentFriend?.displayName }}</span>
          <el-input
            ref="inputRef"
            class="user-info-name-input"
            v-model="input"
            v-show="inputShow"
            @blur="setName({displayName: input })"
          ></el-input>
          <i class="iconfont icon-edit-min" @click="edit()"></i>
        </div>
      </li>
      <li  class="info-li-last">
        <el-button color="#F3982D" size="large" round @click="sendTargetInfo(props.currentFriend, 1)" >发 信 息</el-button>
      </li>
      <!-- <li>{{ currentFriend }}</li> -->
    </ul>
  </div>
</template>
<script setup>
import { ref,reactive, nextTick} from 'vue'
import api from "../../api/index";
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  currentFriend:{
    type: Object,
    default: null
  },
  delSession:{
    type: Function,
    default:()=>{}
  },
  contactsState:{
    type: Object,
    default: null
  },
  setDisplayName:{
    type: Function,
    default:()=>{}
  },
  sendTargetInfo:{
    type: Function,
    default:()=>{}
  },
  delFriendFn:{
    type: Function,
    default:()=>{}
  },
  friendList:{
    type:Function,
    default: ()=>{}
  },
})
import { InfoFilled } from '@element-plus/icons-vue'

const cancelEvent = () => {
  console.log('cancel!')
}

const input = ref('')
const inputRef = ref('')
const inputShow = ref(false)

const edit = () =>{
  input.value = props.currentFriend?.displayName
  inputShow.value = true
  nextTick(() => { 
    inputRef.value.focus() 
  })
}
const setName = (obj) =>{
  inputShow.value = false
  props.setDisplayName(obj)
}
</script>
<style  lang="less" scoped>
.text-align-center {
  display: flex;
  align-items: center;
}
.user-info{
  flex: 1;
  width: calc(100% - 370px);
  .friend-top{
    .text-align-center;
    width: 70%;
    min-width: 400px;
    margin: 100px auto 20px;
    border-bottom: 1px #eee solid;
    padding-bottom: 20px;
    .user-info-img{
      width: 90px;
      height: 90px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .user-info-name{
      flex:1;
      font-size: 28px;
      font-weight: 600;
      margin-right: 10px;
    }
    .icon-minus{
      font-size: 30px;
      margin-left: 30px;
      color:red;
      cursor: pointer;
    }
  }
  .info-li{
    .text-align-center;
    justify-content: space-between;
    width: 70%;
    min-width: 400px;
    margin: 0 auto ;
    line-height: 50px;
    font-size: 18px;
    .info-val{
      cursor: pointer;
      .text-align-center;
    }
    .icon-edit-min{
      font-size: 24px;
    }
  }
  .info-li-last{
    width: 70%;
    min-width: 400px;
    padding-top: 10px;
    margin: 0 auto ;
    line-height: 50px;
    text-align: center;
    /deep/.el-button{
      color:#fff;
    }
  }
}

</style>
