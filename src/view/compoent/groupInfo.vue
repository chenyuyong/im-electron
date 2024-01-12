<template>
  <div class="group">
    <div class="group-name"> {{ props.currentTarget.remark || props.currentTarget.nickName }}</div>
    <ul class="group-ul">
      <li class="group-li" v-for="(item, key) in props.currentGroup.list" :key="key" >
        <img :src="item.avatarUrl" alt="">
        <div>{{ item.nickname }}</div>
      </li>
      <!-- <li>
        {{ props.currentGroup }} 
        <hr>
        {{ props.currentTarget }}
      </li> -->
    </ul>
    <div class="group-btm">
      <el-button color="#F3982D" size="large" round @click="sendTargetInfo(props.currentTarget, 2)" >发 信 息</el-button>
    </div>
  </div>
</template>
<script setup>
import { ref,reactive, nextTick, watch } from 'vue'
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
})

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
  .group-ul{
    flex: 1;
    height: calc(100vh - 152px);
    overflow: auto;
    position: relative;
    padding-top: 30px;
    display: flex;
    /* 设置弹性元素排列方式 */
    flex-direction: row;
    /* 设置自动换行 */
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    .group-li{
      height: 70px;
      text-align: center;
      margin: 0 20px 30px 20px;
      
      img{
        width: 50px;
        height: 50px;
        border-radius: 50%;
      }
    }
  }
  .group-btm{
    height: 70px;
    // border-top: 1px solid #ccc; 
    padding: 10px 20px ;
    text-align: center;
  }
}
</style>