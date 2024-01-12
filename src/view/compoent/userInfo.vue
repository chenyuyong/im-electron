<template>
  <div class="user-info">
    
    <div class="user-info-top">
      <div class="center" >
        <img
          @click="uploadClick"
          class="user-info-img"
          :src="props.userinfo?.avatarUrl || 'https://static.chart.miaojiahui.cn/image/default_avatar.png'" 
          alt="">
        <input
          class="upload-input"
          ref="uploadInput"
          type="file"
          accept="image/jpg, image/jpeg, image/png, image/gif"
          @change="selectFile"
        />
      </div>
      <span  class="user-info-name" v-show="!inputShow" >{{ props.userinfo?.nickname }}</span>
      <el-input
        ref="inputRef"
        class="user-info-name-input"
        v-model="input"
        v-show="inputShow"
        @blur="setUser({nickname: input })"
      ></el-input>
      <i class="iconfont icon-man" v-if="props.userinfo?.sex === 1"></i>
      <i class="iconfont icon-woman" v-else></i>
      <i class="iconfont icon-edit-min" @click="edit()"></i>
    </div>
    <!-- {{userinfo }} -->
    <ul class="">
      <li  class="info-li">
        <span  class="info-key">性别 <!-- 1：男；2：女 --></span>
        <div  class="info-val">
          
          <span class="info-val-label" :class="{'info-val-label-active': props.userinfo?.sex === 1}" @click="setUser({sex:1})">
            <i class="iconfont icon-man"></i>
            男
          </span>
          <span class="info-val-label" :class="{'info-val-label-active': props.userinfo?.sex === 2}" @click="setUser({sex:2})">
            <i class="iconfont icon-woman"></i>
            女
          </span>
        </div>
      </li>
      <li  class="info-li">
        <span  class="info-key">账号安全</span>
        <div  class="info-val" @click="openLayer('forgotPassword')">修改密码
          <i class="iconfont icon-right-easy"></i>
        </div>
      </li>
      <li  class="info-li">
        <span  class="info-key">朋友权限</span>
        <div  class="info-val" @click="openBlack">
          黑名单
          <i class="iconfont icon-right-easy"></i>
        </div>
      </li>
      <li  class="info-li-last">
        <el-button color="#F3982D" size="large" round @click="quit" >退 出 登 录</el-button>
      </li>
    </ul>
    <el-dialog txt="剪接图片"
      v-if="isShowDialog"
      v-model="isShowDialog"
      width="50%"
      align-center
    >
      <div class="popup-btn-box">
        <el-button
          color="#F3982D"
          size="small"
          plain
          @click="isShowDialog = false">
            <span class="submit-btn">取消 </span> 
        </el-button>
        <el-button
          color="#F3982D"
          size="small"
          plain
          @click="clear">
            <span class="submit-btn">清除 </span> 
        </el-button>
        <el-button
          color="#F3982D"
          size="small"
          plain
          @click="reset">
            <span class="submit-btn">重置 </span> 
        </el-button>
        <el-button
          color="#F3982D"
          size="small"
          plain
          @click="getResult">
            <span class="submit-btn">裁切 </span> 
        </el-button>
      </div>
      <!-- <p>{{ chat.videoUrl }}== {{ chat.imgUrl }}</p> -->
      <div class="dialog-video-box">
        <VuePictureCropper
          :boxStyle="{
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f8f8',
            margin: 'auto',
          }"
          :img="pic"
          :options="{
            viewMode: 1,
            dragMode: 'crop',
            aspectRatio: 1 / 1,
          }"
          :presetMode="{
            mode: 'round',
            width: 200,
            height: 200,
          }"
        />
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import method from '../../script/method'
import { ref,reactive, nextTick} from 'vue'
import api from "../../api/index";
import { useRouter } from 'vue-router'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
{
  VuePictureCropper
}
const uploadInput = ref(null)
const isShowDialog = ref(false)
const pic = ref('')
const result = reactive({
  dataURL: '',
  blobURL: '',
})
function uploadClick(){
  // console.log("123123",uploadInput.value)
  uploadInput.value.click()
}
// 选择图片
const selectFile = (e) => {
  // console.log('选择图片')
  // 重置上一次的结果
  result.dataURL = ''
  result.blobURL = ''
  // 如果有多个裁剪框，也需要重置掉裁剪目标的值，避免使用同一张图片无法触发watch
  pic.value = ''
  // 获取选取的文件
  const target = e.target // as HTMLInputElement
  const { files } = target
  if (!files) return
  const file = files[0]
  // 转换为base64传给裁切组件
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    // 更新裁切弹窗的图片源
    pic.value = String(reader.result)
    // 显示裁切弹窗
    isShowDialog.value = true
    // 清空已选择的文件
    if (!uploadInput.value) return
    uploadInput.value.value = ''
  }
}
const getResult = async () => {
  // console.log(cropper)
  // 获取生成的blob文件信息
  const blob = await cropper.getBlob()
  // 获取生成的file文件信息
  const file = await cropper.getFile({
    // fileName: '测试文件名，可不传',
  })
  // 获取生成的base64图片地址
  const base64 = cropper.getDataURL()
  const bo = await method.hwImg(file)
  if(!bo) return
  upload(blob,file.name)
  // console.log({ base64, blob, file })
  // // 把base64赋给结果展示区
  // result.dataURL = base64
  // try {
  //   result.blobURL = URL.createObjectURL(blob)
  // } catch (e) {
  //   result.blobURL = ''
  // } 
}
// 上传接口
const upload = (blob,name) => {
  let formData = new FormData()
  // console.log(formData)
  let fileData = new File([blob], '12.png', {
    type: 'image/png',
    lastModified: Date.now(),
  })
  formData.append('file', fileData)
  // console.log("11111111111",formData,'222222', fileData)
  api.upload(formData).then((res)=>{
    // infoState.avatarUrl = res.data
    if(res.code === 0){
      setUser({avatarUrl: res.data})
    }
    // console.log('formData',res)
    // 隐藏裁切弹窗
    isShowDialog.value = false
  }).catch(err => {
    // showToast(err.msg)
  })
}
//  清除裁切框
const clear = () => {
  cropper.clear()
}
// 重置默认的裁切区域
const reset = () => {
  cropper.reset()
}

const router = useRouter()
const props = defineProps({
  // hwImg:{
  //   type: Function,
  //   default:()=>{}
  // },
  userinfo:{
    type: Object,
    default: null
  },
  editUserInfo:{
    type: Function,
    default:()=>{}
  },
  openLayer:{
    type: Function,
    default:()=>{}
  },
  openBlack:{
    type: Function,
    default:()=>{}
  }
  
})
const input = ref('')
const inputRef = ref('')
const inputShow = ref(false)
const inputFocus = ref(false)

const quit = () =>{
  api.quit().then(res => {
    if(res.code === 0 || res.code === 100){
      localStorage.setItem('userinfo', '')
      localStorage.setItem('token', '')
      localStorage.setItem('userId', '')
      localStorage.setItem('groupsArr', '')
      localStorage.setItem('friendArr', '')
      router.push({
        path: '/login',
      })
    }
  }).catch(err => {

  })
}
const edit = () =>{
  input.value = props.userinfo.nickname
  inputShow.value = true
  nextTick(() => { 
    inputRef.value.focus() 
  })
}
const setUser = (obj) =>{
  inputShow.value = false
  console.log('setUser',obj.sex , typeof obj.sex === 'undefined')
  
  var data = {
    avatarUrl: obj.avatarUrl || props.userinfo.avatarUrl || "https://static.chart.miaojiahui.cn/image/default_avatar.png",
    nickname: obj.nickname || props.userinfo.nickname,
    sex: typeof obj.sex === 'undefined' ? props.userinfo.sex : obj.sex,
  }
  console.log('setUser',data)
  api.setInfo(data).then(res => {
    if(res.code === 0){
      console.log(res.data)
      props.editUserInfo(data)
    }
  })
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
  .user-info-top{
    .text-align-center;
    width: 70%;
    min-width: 400px;
    margin: 100px auto 20px;
    border-bottom: 1px #eee solid;
    padding-bottom: 20px;
    .upload-input{
      display: none;
    }
    .user-info-img{
      width: 90px;
      height: 90px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .user-info-name{
      font-size: 28px;
      font-weight: 600;
      margin-right: 10px;
    }
    .icon-man{
      font-size: 16px;
      color:#355379;
    }
    .icon-woman{
      font-size: 16px;
      color:#355379;
    }
    .icon-edit-min{
      font-size: 24px;
      margin-left: 30px;
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
    }
    .info-val-label{
      display: inline-block;
      width: 68px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      border: 1px solid #999999;
      border-radius: 15px;
      cursor: pointer;
      margin-left:10px;
      font-size: 16px;
      &.info-val-label-active{
        border-color: #F3982D;
      }
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
