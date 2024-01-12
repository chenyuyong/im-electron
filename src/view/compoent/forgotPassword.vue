<template>
  <div class="forgot-password">
    <div class="logo_img">
      <img src="../../assets/img/logo.png" alt="">
    </div>
    <div v-if="state === 'state1'">
      <div class="logo-title">修改密码</div>
      <div class="login-info-phone">
        <div class=" login-info-item">
          <span class="login-area">+86</span>
          <input
            type="phone"
            v-model="forgotPas.userName"
            maxlength="11"
            oninput="value=value.replace(/[^\d]/g,'')"
            placeholder="输入手机号码"
            disabled
          />
        </div>
        <div class="verification login-info-item">
          <input
            oninput="value=value.replace(/[^\d]/g,'')"
            v-model="forgotPas.vcode"
            placeholder="输入验证码"
            maxlength="6"
          />
          <span class="code-btn" v-show="authCode.btnDisabled === true" id="btn">{{ authCode.kerMes }}</span>
          <span
            v-show="authCode.btnDisabled === false"
            class="code-btn"
            
            >{{ authCode.kerMes }}s</span>
        </div>
      </div>
      <div class="login-bottom">
        <p class="submi-btn" @click="submitForgot">确定</p>
        <p class="submi-btn" @click="closeLayer">取消</p>
      </div>
    </div>
    <div v-if="state === 'state2'">
      <div class="logo-title">设置新密码</div>
      <div class="login-info-phone">
        <div class=" login-info-item">
          <input
            v-model="forgotPas.pas1"
            placeholder="输入验证码"
          />
        </div>
        <div class="verification login-info-item">
          <input
            v-model="forgotPas.pas2"
            placeholder="输入验证码"
          />
        </div>
        <div class="login-bottom">
          <p class="submi-btn" @click="submitNewPas">确定</p>
          <p class="submi-btn" @click="closeLayer">取消</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>

import md5 from 'js-md5';
import '../../script/plugin/gt4.js';
import api from "../../api/index";
import { ref,reactive, nextTick, onMounted,onBeforeUnmount} from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  closeLayer:{
    type: Function,
    default: ()=>{}
  },
  userinfo:{
    type: Object,
    default: null
  },
})
const authCode =  reactive({
  btnDisabled: true,
  kerMes: '发送验证码',
  interval: null
})
const state = ref('state1')
console.log('props.userinfo', props.userinfo)
const forgotPas =  reactive({
  userName: props.userinfo?.phone,
  vcode: '',
  pas1: '',
  pas2: '',
  token: '',
})
function init(){
  var button = document.getElementById('btn')
  // let that = this
  initGeetest4({
    captchaId: 'e5b604669ad8e9fe5a9ce1d4e835156c',
    product: 'bind'
  },function (captcha) {
    // captcha为验证码实例
    captcha.onReady(function(){
      //验证码ready之后才能调用verify方法显示验证码
    }).onSuccess(function(){
      var result = captcha.getValidate()
      if (!result) {
        ElMessage({
          message: '请完成验证',
          type: 'warning',
        })
        return
      }
      result.captcha_id = "e5b604669ad8e9fe5a9ce1d4e835156c"
      sendCode(result)
      // that.kz = true
      // that.userauthsmssendApis(result)
      //your code
    }).onError(function(){
        //your code
    })
    // 按钮提交事件
    button.onclick = function(){
      const reg =/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
      if (
        forgotPas.userName == '' ||
        forgotPas.userName.length <= 10 ||
        !reg.test(forgotPas.userName)
      ) {
        ElMessage({
          message: '请输入正确的手机号',
          type: 'warning',
        })
        return
      }
      captcha.showBox() // 显示验证码
      // if (that.kz) {
      //   return
      // }
      // some code
      // 检测验证码是否ready, 验证码的onReady是否执行
      // some code
    }
  })
}
const sendCode = (obj) =>{
  var data = {
    captchaOutput: obj.captcha_output,
    lotNumber: obj.lot_number,
    passToken: obj.pass_token,
    genTime: obj.gen_time,
    countryCode: 86,
    phone: forgotPas.userName,
    reqId: Date.now(),
    time: Date.now(),
    type: 2, // 2忘记密码
  }
  api.sendSms(data).then((res) => {
    if (res.code === 0) {
      // console.log('sendSms2',res.data)
      authCode.btnDisabled = false
      authCode.kerMes = 60
      count()
    } else {
      ElMessage({
        type: "error",
        message: res.msg
      })
    }
  })
}
function count(){ // 倒计时60s
  authCode.interval = window.setInterval(function() {
    if ((authCode.kerMes--) <= 0) {
      authCode.kerMes = '发送验证码'
      authCode.btnDisabled = true
      window.clearInterval(authCode.interval)
    }
  }, 1000)
}
function submitForgot(){ // 修改密码，验证码是否正确，返回新密码token
  if(forgotPas.userName === ''){
    ElMessage({
      type: "warning",
      message: '请输入手机号码'
    })
    return
  }
  if(forgotPas.vcode === ''){
    ElMessage({
      type: "warning",
      message: '请输入验证码'
    })
    return
  }
  const data = {
    countryCode: 86,
    phone: forgotPas.userName,
    reqId: `${Date.now()}`,
    time: Date.now(),
    type: 2,
    vcode: forgotPas.vcode
  }
  api.getSmsToken(data).then(res=>{
    if(res.code === 0){
      // console.log(res,'111111111')
      state.value = 'state2'
      forgotPas.token = res.data
    } else {
      ElMessage({
        type: "error",
        message: res.msg
      })
    }
  })
}
function submitNewPas() { // 提交新密码
  if(forgotPas.pas1 === ''){
    ElMessage({
      type: "warning",
      message: '密码不能为空'
    })
    return
  }
  if(forgotPas.pas1 !== forgotPas.pas2){
    ElMessage({
      type: "warning",
      message: '新密码和确认密码不一致，请校对后再提交'
    })
    return
  }
  const data = {
    countryCode: 86,
    password: md5(forgotPas.pas1),
    phone: forgotPas.userName,
    reqId: `${Date.now()}`,
    time: Date.now(),
    vcodeToken: forgotPas.token
  }
  api.forgetPassword(data).then(res => {
    if(res.code === 0){
      router.push({
        path: '/login',
      })
      // console.log(res,'2222222')
      // state.value = 'login'
    } else {
      ElMessage({
        type: "error",
        message: res.msg
      })
    }
  })
}
onMounted(() => {
  init()
})
onBeforeUnmount(() => {
  authCode.interval = null
  window.clearInterval(authCode.interval)
}) 
</script>
<style lang="less" scoped>
@theme-color: #F3982D;
.forgot-password {
  width: 400px;
  padding-top: 50px;
  padding-bottom: 50px;
  background: url('./../../assets/img/chat/bg.png') no-repeat;
  background-size: cover;
  border-radius: 20px;
  margin: 0 auto;
  box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.5);
  
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  // background: #eee;
  .logo_img {
    text-align: center;
    padding-bottom: 20px;
    img{
      width: 100px;
      // height: 200px;
      border-radius: 50%;
    }
  }
  .logo-title {
    text-align: center;
    font-size: 30px;
    color: @theme-color;
    padding-bottom: 20px;
  }
  .login-info-item {
    width: 80%;
    position: relative;
    margin: 0 auto;
    padding-bottom: 20px;
    
    input {
      width: calc(100% - 100px);
      height: 40px;
      border-radius: 80px;
      border: 0;
      font-size: 16px;
      padding-left: 100px;
      color: #333;
      border:1px solid #eee;
    border-radius: 40px;
    }
    .login-area {
      position: absolute;
      top: 1px;
      left: 0;
      width: 80px;
      height: 42px;
      line-height: 42px;
      display: inline-block;
      background: #f5f6fa;
      font-weight: 600;
      color: @theme-color;
      opacity: 1;
      font-size: 20px;
      border-radius: 40px 0 0 40px;
      text-align: center;
    }
    .code-btn {
      font-weight: 400;
      color: @theme-color;
      opacity: 1;
      font-size: 14px;
      position: absolute;
      top: 10px;
      right: 20px;
      border: 1px solid @theme-color;
      padding: 4px;
      border-radius: 6px;
      cursor: pointer;
    }
  }
  .login-bottom {
		text-align: center;
		.submi-btn {
			margin: 0 auto;
			width: 80%;
			height: 50px;
			line-height: 50px;
			background: @theme-color;
			border-radius: 40px;
			font-size: 24px;
			color: #fff;
      margin-bottom: 20px;
      cursor: pointer;
			// margin-left: 30px;
		}
	}
}
</style>
