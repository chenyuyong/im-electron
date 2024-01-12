<template>
  <div class="createGroup">
    <div class="cg-left">
      <div class="cg-session-search">
          <el-input
            v-model="create.search"
            @input="changeSearch"
            placeholder="搜索"
            :prefix-icon="Search"
            clearable
          />
        </div>
      <h2 class="cg-left-title">
        联系人
      </h2>
      <ul class="cg-session-ul">
        <!-- h-session-li-active -->
        
        <li txt="搜索"
          v-show="!!create.search"
          v-for="(item , key) in create.searchList" 
          :key="key" 
          class="cg-session-li " 
        >
          <!-- <span >{{ item }}</span> -->
          <i v-show="!item.selected" class="iconfont icon-selected-not" @click="selectedUser(item.id, true)"></i>
          <i v-show="item.selected" class="iconfont icon-selected-yes" @click="selectedUser(item.id, false)"></i>
         
          <img class="cg-session-avatar" :src="item.avatarUrl" >
          <div class="cg-session-text-box">
            <div class="cg-session-name">{{ item.nickname }} </div>
          </div>
        </li>
        <li
          v-show="!create.search"
          v-for="(item , key) in create.fullList" 
          :key="key" 
          class="cg-session-li " 
        >
          <!-- <span >{{ item }}</span> -->
          <i v-show="!item.selected" class="iconfont icon-selected-not" @click="selectedUser(item.id, true)"></i>
          <i v-show="item.selected" class="iconfont icon-selected-yes" @click="selectedUser(item.id, false)"></i>
         
          <img class="cg-session-avatar" :src="item.avatarUrl" >
          <div class="cg-session-text-box">
            <div class="cg-session-name">{{ item.displayName || item.nickname }} </div>
            <div class="cg-session-nickname" v-if="item.displayName ">昵称：{{ item.nickname }}</div>
          </div>
        </li>
      </ul>
      <!-- {{ create.fullList }} -->
    </div>
    <div class="cg-right">
      <h3 class="cg-right-h3">
        <span class="xx">添加成员</span>
        <span class="xx">已选择{{ create.selectedList.length }}个</span>
      </h3>
      <div class="xx">
        <ul class="cg-session-ul">
          <!-- h-session-li-active -->
          <li 
            v-for="(item , key) in create.selectedList" 
            :key="key" 
            class="cg-session-li " 
          >
            <img class="cg-session-avatar" :src="item.avatarUrl" >
            <div class="cg-session-text-box">
              <div class="cg-session-name">{{ item.displayName || item.nickname }} </div>
              <div class="cg-session-nickname" v-if="item.displayName ">昵称：{{ item.nickname }}</div>
            </div>
            <i class="iconfont icon-close" @click="delSelected(item.id)"></i>
          </li>
        </ul>
      </div>
      <div class="cg-right-bottom">
        <el-button color="#F3982D" round size="large" @click="createFn">创 建</el-button>
        <el-button color="#CDC8CC" round size="large" @click="closeLayer">取 消</el-button>
      </div>
    </div>
  </div>
</template>
<script setup>
import api from "../../api/index";
import { Search } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, defineProps, nextTick } from 'vue'
const props = defineProps({
  closeLayer:{
    type: Function,
    default: ()=>{}
  },
  groupsList:{
    type:Function,
    default: ()=>{}
  },
})
const create = reactive({
  search: '',
  fullList: localStorage.getItem('friendArr') && JSON.parse(localStorage.getItem('friendArr')),
  searchList: [],
  selectedList: [],
})
const init = () =>{
  create.fullList.forEach((item,key,arr )=> {
    arr[key]['selected'] = false
  })
}
const changeSearch = (e) =>{
  console.log("1",e)
  if(e !== ''){
    create.searchList = create.fullList.filter(item => {
      return (item.nickname.includes(create.search) )
    })
  } else {
    create.searchList = []
  }
  console.log('111',create.searchList)
}
const selectedUser = (id, Boo) => { // 选择左边的朋友
  console.log('selectedUser',id, Boo)
  create.fullList.forEach((item, key, arr)=> {
    if(item.id === id){
      arr[key]['selected'] = Boo
      if(Boo){
        create.selectedList.push(item)
      }
    }
  })
  if(!Boo){
    create.selectedList.forEach((item, key, arr)=> {
      if(item.id === id){
        arr.splice(key,1)
      }
    })
  }
}
const delSelected = (id) => { // 右侧删除选中的朋友
  create.fullList.forEach((item, key, arr)=> {
    if(item.id === id){
      arr[key]['selected'] = false
    }
  })
  create.selectedList.forEach((item, key, arr)=> {
    if(item.id === id){
      arr.splice(key,1)
    }
  })
}
const createFn = () => { // 创建群
  var data = {
    members: create.selectedList.map(item =>{
      return {
        displayName: item.nickname,
        memberId: item.id,
        phone: ''
      }
    })
  }
  api.createGroup(data).then((res) => {
    if (res.code === 0) {
      console.log('createGroup', res.data)
      props.groupsList(localStorage.getItem('groupsVersion'))
      props.closeLayer()
    }
  })

}
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
.createGroup {
  width: 660px;
  height: 510px;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 auto;
  box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  display: flex;
  .cg-left{
    width: 330px;
    background: #f0f0f0;
    padding: 10px 0;
    .cg-session-search{
      padding: 10px 20px;
      background: #f0f0f0;
    }
    .cg-left-title{
      padding: 10px 20px;
      font-size: 18px;
    }
  }
  .cg-right{
    width: 330px;
    padding: 10px 0;
    .cg-right-h3{
      .text-align-center;
      justify-content: space-between;
      padding: 10px 20px;
      font-weight: bold;
      font-size: 18px;
      
    }
    .cg-right-bottom{
      .text-align-center;
      justify-content:center;
    }
  }
}
.cg-session-ul{
  // background: #fff;
  height: 400px;
  overflow: auto;
  .cg-session-li{
    .text-align-center;
    justify-content: space-between;
    height: 60px;
    padding: 0 20px;
    text-align: left;
    position: relative;
    .cg-session-avatar{
      width: 44px;
      height: 44px;
      border-radius: 50%;
    }
    .cg-session-text-box{
      line-height: 24px;
      padding-left: 12px;
      width: calc(100% - 100px);
      .cg-session-name{
        font-size: 16px;
        font-weight: 400;
        color: #111f2c;
      }
      .cg-session-nickname{
        color: #666;
      }
    }
    i{
      cursor: pointer;
    }
    .icon-close{
      font-size: 14px;
    }
    .icon-selected-not{
      font-size: 32px;
    }
    .icon-selected-yes{
      font-size: 32px;
      color: #F3982D;
    }
  }
}
</style>