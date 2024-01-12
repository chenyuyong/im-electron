<template>
	<div class="login" >
		<div class="login-info" txt="登入" v-show="state === 'login'">
			<div class="logo_img">
				<img src="../assets/img/logo.png" alt="">
			</div>
			<div class="logo-title">欢迎使用念念</div>
			<div class="login-info-phone">
				<div class=" login-info-item">
					<span class="login-area">+86</span>
					<input
						type="phone"
						v-model="loginForm.userName"
						maxlength="11"
						oninput="value=value.replace(/[^\d]/g,'')"
						placeholder="输入手机号码"
					/>
				</div>
				<div class="verification login-info-item">
					<input
						v-show="loginForm.loginType === 1"
						type="password"
						v-model="loginForm.password"
						placeholder="输入密码"
					/>
					<input
						v-show="loginForm.loginType === 2"
						oninput="value=value.replace(/[^\d]/g,'')"
						v-model="loginForm.vcode"
						placeholder="输入验证码"
						maxlength="6"
					/>
					<span class="code-btn" v-show="authCode.btnDisabled === true && loginForm.loginType === 2" id="btn">{{ authCode.kerMes }}</span>
					<span
						v-show="authCode.btnDisabled === false && loginForm.loginType === 2"
						class="code-btn"
						
						>{{ authCode.kerMes }}S</span>
				</div>
        <!-- {{ authCode.btnDisabled }} -->
			</div>
			<div class="login-bottom">
				<p class="submi-btn" @click="submit">登入</p>
			</div>
      <div class="login-text">
        <span class="login-type" @click="loginForm.loginType=1" v-show="loginForm.loginType === 2">密码登入</span>
        <span class="login-type" @click="loginForm.loginType=2" v-show="loginForm.loginType === 1">验证码登入</span>
        <span class="login-type" @click="state = 'forgotPassword'">忘记密码</span>
      </div>
      <!-- <el-button type="primary">Primary</el-button> -->
		</div>
    <div class="login-info" v-show="state === 'editInfo'">
			<div class="logo_img">
				<img v-if="info.avatarUrl" @click="uploadClick" :src="info.avatarUrl" alt="">
        <span v-else @click="uploadClick" >添加头像</span>
        <input
          class="upload-input"
          ref="uploadInput"
          type="file"
          accept="image/jpg, image/jpeg, image/png, image/gif"
          @change="selectFile"
        />
			</div>
			<!-- <div class="logo-title">新密码设置</div> -->
			<div class="login-info-phone">
				<div class=" login-info-item">
          <span class="login-area">昵称</span>
					<input
						type="phone"
						v-model="info.nickname"
						placeholder="昵称"
					/>
				</div>
			</div>
      <div class="login-info-phone">
        <div class=" login-info-item-edit">
          <span class="edit-title">性别</span>
          <div  class="info-val">
            <span class="info-val-label" :class="{'info-val-label-active': info.sex === 1}" @click="setSex(1)">
              <i class="iconfont icon-man"></i>
              男
            </span>
            <span class="info-val-label" :class="{'info-val-label-active': info.sex === 2}" @click="setSex(2)">
              <i class="iconfont icon-woman"></i>
              女
            </span>
          </div>
        </div>
			</div>
			<div class="login-bottom">
				<p class="submi-btn" @click="setUser">确 定</p>
			</div>
		</div>
    <div class="login-info" v-show="state === 'forgotPassword'">
			<div class="logo_img">
				<img src="../assets/img/logo.png" alt="">
			</div>
			<div class="logo-title">忘记密码</div>
			<div class="login-info-phone">
				<div class=" login-info-item">
					<span class="login-area">+86</span>
					<input
						type="phone"
						v-model="forgotPas.userName"
						maxlength="11"
						oninput="value=value.replace(/[^\d]/g,'')"
						placeholder="输入手机号码"
					/>
				</div>
				<div class="verification login-info-item">
					<input
						oninput="value=value.replace(/[^\d]/g,'')"
						v-model="forgotPas.vcode"
						placeholder="输入验证码"
						maxlength="6"
					/>
					<span class="code-btn" v-show="authCode.btnDisabled === true " id="btn2">{{ authCode.kerMes }}</span>
					<span
						v-show="authCode.btnDisabled === false "
						class="code-btn"
						>{{ authCode.kerMes }}S</span>
				</div>
        <!-- {{ authCode.btnDisabled }} -->
			</div>
			<div class="login-bottom">
				<p class="submi-btn" @click="submitForgot">确 定</p>
				<p class="submi-btn" @click="state = 'login'">返 回</p>
			</div>
		</div>
    <div class="login-info" v-show="state === 'newPassword'">
			<div class="logo_img">
				<img src="../assets/img/logo.png" alt="">
			</div>
			<div class="logo-title">新密码设置</div>
			<div class="login-info-phone">
				<div class=" login-info-item">
					<input
						type="phone"
						v-model="forgotPas.pas1"
						maxlength="11"
						placeholder="新密码"
					/>
				</div>
			</div>
      <div class="login-info-phone">
				<div class=" login-info-item">
					<input
						type="phone"
						v-model="forgotPas.pas2"
						maxlength="11"
						placeholder="确认密码"
					/>
				</div>
			</div>
			<div class="login-bottom">
				<p class="submi-btn" @click="submitNewPas">确 定</p>
			</div>
		</div>
    <el-dialog txt="剪接图片"
      v-if="cropperImg.isShowDialog"
      v-model="cropperImg.isShowDialog"
      width="50%"
      align-center
    >
      <div class="popup-btn-box">
        <el-button
          color="#F3982D"
          size="small"
          plain
          @click="cropperImg.isShowDialog = false">
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
        {{ cropperImg.isShowDialog }}
      </div>
      <!-- {{ cropperImg }} -->
      <!-- <p>{{ chat.videoUrl }}== {{ chat.imgUrl }}</p> -->
      <div class="dialog-video-box">
        <VuePictureCropper
          :boxStyle="{
            width: '100%',
            height: '100%',
            backgroundColor: '#f8f8f8',
            margin: 'auto',
          }"
          :img="cropperImg.pic"
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
<script >
import md5 from 'js-md5';
// import axios from 'axios'
// import {Login} from './../script/api'
import api from "../api/index";
import { ElMessage } from 'element-plus'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import method from '../script/method'
export default {
  name: 'login-ui',
  components:{
    VuePictureCropper
  },
  data: function () {
    return {
      state:'login',
      loginForm: {
        userName: '',
        loginType: 1, // 1密码，2验证码
        password:  '',
        vcode: '',
        
      },
      authCode: {
        btnDisabled: true,
        kerMes: '发送验证码',
        interval: null
      },
      forgotPas:{
        userName: '',
        vcode: '',
        pas1: '',
        pas2: '',
        token: '',
      },
      info:{
        avatarUrl: "",
        nickname: "",
        sex: 1, // 1男 2女

      },
      cropperImg:{
        uploadInput:'',
        isShowDialog: false,
        pic:'',
        dataURL: '',
        blobURL: '',
      }
    }
  },
  mounted(){
    this.init()
  },
  methods: {
    submit(){ // 登入提交
      if(this.loginForm.loginType === 1){
        this.passwordLogin()
      } else {
        this.smsLogin()
      }
    },
    passwordLogin(){
      var data = {
        countryCode: 86,
        password: md5(this.loginForm.password),
        username: this.loginForm.userName,
        sharerId: null, 
      }
      const reg =/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
      // console.log(reg.test(this.loginForm.userName), this.loginForm.userName)
      if(this.loginForm.userName?.length !== 11 || !reg.test(this.loginForm.userName)){
        ElMessage({
          message: '请输入正确的手机号',
          type: 'warning',
        })
        return
      }
      if(this.loginForm.password?.length === 0){
        ElMessage({
          message: '请输入正确的密码',
          type: 'warning',
        })
        return
      }
      api.loginForPassword(data).then((res) => {
        if (res.code === 0) {
          // console.log(res.data)
          this.success(res.data)
        } else {
          ElMessage({
            message: res.msg,
            type: 'error',
          })
          // showToast(res.msg)
        }
      })
    },
    smsLogin(){
      var data = {
        countryCode: 86,
        phone: this.loginForm.userName,
        vcode: this.loginForm.vcode,
        reqId: Date.now(),
        time: Date.now(),
        sharerId: null, // this.sharerId || null,
      }
      if(this.loginForm.userName?.length !== 11){
        ElMessage({
          message: '请输入正确的手机号',
          type: 'warning',
        })
        return
      }
      if(this.loginForm.vcode?.length !== 6){
        ElMessage({
          message: '请输入正确的验证码',
          type: 'warning',
        })
        return
      }
      api.loginForSms(data).then((res) => {
        if (res.code === 0) {
          // console.log(res.data)
          this.success(res.data)
        } else {
          ElMessage({
            message: res.msg,
            type: 'error',
          })
          // showToast(res.msg)
        }
      })
    },
    success(res){
      // console.log(res)
      localStorage.setItem('userName', this.loginForm.userName)
      localStorage.setItem('token', res.token || '' )
      localStorage.setItem('userinfo', JSON.stringify(res))
      localStorage.setItem('userId', res.userId)
      if(!res.nickname || !res.avatarUrl || !res.sex){
        this.state = 'editInfo'
        this.info = {...this.info, ...res}
        console.log('editInfo',this.info)
        return
      }
      this.$message({
        type: "success",
        message: '成功登入'
      })
    
      // this.avatarUrl = res.avatarUrl || ''
      // this.nickname = res.nickname || ''
      // this.sex = res.sex || 1
      this.$router.push('/')
      
    },
    setUser() {
      let that = this
      api.setInfo(this.info).then(res => {
        if(res.code === 0){
          localStorage.setItem('userinfo', JSON.stringify(this.info))
          that.$router.push('/')
        }
      })
    },
    uploadClick(){
      // this.cropperImg.uploadInput.click()
      // console.log(this.$refs.uploadInput)
      this.$refs.uploadInput.click()
    },
    selectFile(e) {
      // console.log('选择图片')
      // 重置上一次的结果
      this.cropperImg.dataURL = ''
      this.cropperImg.blobURL = ''
      // 如果有多个裁剪框，也需要重置掉裁剪目标的值，避免使用同一张图片无法触发watch
      this.cropperImg.pic = ''
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
        this.cropperImg.pic = String(reader.result)
        // 显示裁切弹窗
        this.cropperImg.isShowDialog = true
        // 清空已选择的文件
        if (!this.cropperImg.uploadInput) return
        this.cropperImg.uploadInput.value = ''
      }
    },
    async getResult(){
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
      this.upload(blob,file.name)
      // console.log({ base64, blob, file })
      // // 把base64赋给结果展示区
      // this.cropperImg.dataURL = base64
      // try {
      //   this.cropperImg.blobURL = URL.createObjectURL(blob)
      // } catch (e) {
      //   this.cropperImg.blobURL = ''
      // } 
    },
    // 上传接口
    upload(blob,name){
      let that = this
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
        // console.log('formData',res)
        if(res.code === 0){
          // setUser({avatarUrl: res.data})
          that.info.avatarUrl = res.data
        }
        // 隐藏裁切弹窗
        that.cropperImg.isShowDialog = false
      }).catch(err => {
        // showToast(err.msg)
      })
    },
    //  清除裁切框
    clear() {
      cropper.clear()
    },
    // 重置默认的裁切区域
    reset() {
      cropper.reset()
    },
    setSex(sex) { // 设置性别
      // inputShow.value = false
      // console.log('setSex', sex )
      this.info.sex = sex
    },
    init(){
      var button = document.getElementById('btn')
      var button2 = document.getElementById('btn2')
      // console.log('onclick')
      let that = this
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
          that.sendCode(result)
          // that.kz = true
          // that.userauthsmssendApis(result)
          //your code
        }).onError(function(){
            //your code
        })
        // 按钮提交事件
        button.onclick = function(){
          // console.log('onclick')
          const reg =/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
          if (
            that.loginForm.userName == '' ||
            that.loginForm.userName.length <= 10 ||
            !reg.test(that.loginForm.userName)
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
        button2.onclick = function(){
          const reg =/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/
          if (
            that.forgotPas.userName == '' ||
            that.forgotPas.userName.length <= 10 ||
            !reg.test(that.forgotPas.userName)
          ) {
            ElMessage({
              message: '请输入正确的手机号',
              type: 'warning',
            })
            return
          }
          captcha.showBox() // 显示验证码
        }
      })
      const userAgent = navigator.userAgent.toLowerCase();
      if (userAgent.indexOf('electron/') > -1) {
        localStorage.setItem('electron', true)
      } else {
        localStorage.setItem('electron', false)
      }
      // console.log('process=========',userAgent)
    },
    submitForgot(){ // 忘记密码，验证码是否正确，返回新密码token
      if(this.forgotPas.userName === ''){
        this.$message({
          type: "warning",
          message: '请输入手机号码'
        })
        return
      }
      if(this.forgotPas.vcode === ''){
        this.$message({
          type: "warning",
          message: '请输入验证码'
        })
        return
      }
      const data = {
        countryCode: 86,
        phone: this.forgotPas.userName,
        reqId: `${Date.now()}`,
        time: Date.now(),
        type: 2,
        vcode: this.forgotPas.vcode
      }
      api.getSmsToken(data).then(res=>{
        if(res.code === 0){
          // console.log(res,'111111111')
          this.state = 'newPassword'
          this.forgotPas.token = res.data
        } else {
          this.$message({
            type: "error",
            message: res.msg
          })
        }
      })
    },
    submitNewPas(){ // 提交新密码
      if(this.forgotPas.pas1 === ''){
        this.$message({
          type: "warning",
          message: '密码不能为空'
        })
        return
      }
      if(this.forgotPas.pas1 !== this.forgotPas.pas2){
        this.$message({
          type: "warning",
          message: '新密码和确认密码不一致，请校对后再提交'
        })
        return
      }
      const data = {
        countryCode: 86,
        password: md5(this.forgotPas.pas1),
        phone: this.forgotPas.userName,
        reqId: `${Date.now()}`,
        time: Date.now(),
        vcodeToken: this.forgotPas.token
      }
      api.forgetPassword(data).then(res => {
        if(res.code === 0){
          // console.log(res,'2222222')
          this.state = 'login'
          this.loginForm.userName = this.forgotPas.userName
        } else {
          this.$message({
            type: "error",
            message: res.msg
          })
        }
      })
    },
    sendCode (obj) {
      var data = {
        captchaOutput: obj.captcha_output,
        lotNumber: obj.lot_number,
        passToken: obj.pass_token,
        genTime: obj.gen_time,
        countryCode: 86,
        phone: this.state === 'login' ? this.loginForm.userName : this.forgotPas.userName,
        reqId: Date.now(),
        time: Date.now(),
        type: this.state === 'login' ? 1 : 2, // 1登录,2忘记密码
      }
      api.sendSms(data).then((res) => {
        if (res.code === 0) {
          // console.log('sendSms2',res.data)
          this.authCode.btnDisabled = false
          this.authCode.kerMes = 60
          this.count()
        }else {
          ElMessage({
            message: res.msg,
            type: 'error',
          })
        }
      })
    },
    count(){ // 倒计时60s
      let that = this
      this.authCode.interval = window.setInterval(function() {
        if ((that.authCode.kerMes--) <= 0) {
          that.authCode.kerMes = '发送验证码'
          that.authCode.btnDisabled = true
          window.clearInterval(that.authCode.interval)
        }
      }, 1000)
    },
  }
}
</script>
<style lang="less" scoped>
@theme-color: #F3982D;
input::placeholder {
	color: #939393;
}
.login {
	width: 100%;
	height: calc(100vh - 100px);
  background: linear-gradient(141deg, #FCB690 0%, #FFCBA9 29%, #F1F4E0 73%, #FBE8CF 100%);
	// background: url('./../assets/img/chat/bg.png') no-repeat;
	background-size: cover;
  padding-top: 100px;
	.login-info {
		width: 400px;
		padding-top: 50px;
		padding-bottom: 50px;
    background: url('./../assets/img/chat/bg.png') no-repeat;
    background-size: cover;
    border-radius: 20px;
		margin: 0 auto;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.5);
		// background: #eee;
		.logo_img {
      height: 100px;
			text-align: center;
			padding-bottom: 20px;
      span{
        display: inline-block;
        width: 100px;
				height: 100px;
				line-height: 100px;
        text-align: center;
				border-radius: 50%;
        background: #fff;
        color: #999;
        cursor: pointer;
      }
			img{
				width: 100px;
				// height: 200px;
				border-radius: 50%;
			}
      .upload-input{
        display: none;
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
    .login-info-item-edit{
      width: 80%;
			position: relative;
			margin: 0 auto;
			padding-bottom: 20px;
      display: flex;
      justify-content: flex-start;
      .edit-title{
        width: 76px;
        line-height: 32px;
        font-weight: 600;
        color: #F3982D;
        font-size: 20px;
        text-align: center;
      }
    }
	}
	.login-info-phone{
		// height: 228px;
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
      cursor: pointer;
			margin-bottom: 16px;
      &:last-of-type{
			  margin-bottom: 0px;
      }
		}
	}
  .login-text{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30px 10% 20px 10%;
  }
	.login-type{
		color: #333;
		font-size: 16px;
    cursor: pointer;
	}
}
.info-val{
  cursor: pointer;
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

</style>
