import { ElMessage } from "element-plus";
import api from "../api/index";
const method  = {
	getParameter(e,hw){
		// var result = e.match(new RegExp("[\?\&]" + hw + "=([^\&]+)", "i"));
		// if (result == null || result.length < 1) {
		// 	return "";
		// }
		// return result[1];
	},
	getTime(time,t){ //年月日时分秒
		var now = new Date(time)
		var nian = now.getFullYear()
		var yue = (now.getMonth() + 1).toString().padStart(2, '0')
		var ri = now.getDate().toString().padStart(2, '0')
		var shi = now.getHours().toString().padStart(2, '0')
		var fen = now.getMinutes().toString().padStart(2, '0')
		var miao = now.getSeconds().toString().padStart(2, '0')
		if(t==1){
			return `${nian}年${yue}月${ri}日`
		}else if(t==2){
			// console.log((new Date().getFullYear())-(new Date(time).getFullYear()))
			let time_str = "";
			if (new Date(time).getDate() === new Date().getDate()) {//今天
				time_str = `${shi}:${fen}`
			} else if (new Date().getFullYear()===new Date(time).getFullYear()) {//今天之前，一年之内
					time_str =  `${yue}/${ri}`
			} else{
				time_str =  nian.toString().substring(2) + `/${yue}/${ri}`
			}
			return time_str;
			// return `${nian}.${yue}.${ri} ${shi}:${fen}:00`
		}else if(t==3){
			return `${nian}.${yue}.${ri}`
		} else if(t==9){
			return `${nian}/${yue}/${ri} ${shi}:${fen}:${miao}`
		}
	},
  deepCopy(obj = {}) {
    //变量先置空
    let newobj = null;
    //判断是否需要继续进行递归
    if (typeof obj === 'object' && obj !== null) {
      newobj = Array.isArray(obj) ? [] : {};
      //进行下一层递归克隆
      for (var i in obj) {
        newobj[i] = deepCopy(obj[i]);
      }
      //如果不是对象直接赋值
    } else newobj = obj;
    return newobj;
  },
  duration(miao){ // 秒转化成 01：01
    let minute = parseInt(miao/60).toString().padStart(2, '0')
    let second = (miao%60).toString().padStart(2, '0')
    return `${minute}:${second}`
  },
	timer: null,
	debounce(fn, delay) { // 防抖
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      fn()
      this.timer = null
    }, delay)
  },
  throttle(fn, delay) { // 节流
    let timer = null;      //定义一个定时器
    return function() {
      // console.log('节流')
      let context = this;
      let args = arguments;
      if(!timer) {
        timer = setTimeout(function() {
          fn.apply(context, args);
          timer = null;
        }, delay);
      }
    }
  },
	// 除法
	accDiv(arg1,arg2){ 
		var t1=0,t2=0,r1,r2; 
		try{t1=arg1.toString().split(".")[1].length}catch(e){console.log(e)}
		try{t2=arg2.toString().split(".")[1].length}catch(e){console.log(e)}
		// with(Math){ 
			r1=Number(arg1.toString().replace(".","")) 
			r2=Number(arg2.toString().replace(".",""))
			console.log(this) 
			console.log(this.accMul(r1,r2))
			return this.accMul((r1/r2),Math.pow(10,t2-t1)); 
		// } 
	},
	//乘法 
	accMul(arg1,arg2) { 
		var m=0,s1=arg1.toString(),s2=arg2.toString(); 
		try{m+=s1.split(".")[1].length}catch(e){console.log(e)} 
		try{m+=s2.split(".")[1].length}catch(e){console.log(e)} 
		return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) 
	},
	//加法 
	accAdd(arg1,arg2){ 
		var r1,r2,m; 
		try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
		try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
		m=Math.pow(10,Math.max(r1,r2)) 
		return (arg1*m+arg2*m)/m 
  },
	//减法 
	Subtr(arg1,arg2){ 
		var r1,r2,m,n; 
		try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0} 
		try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0} 
		m=Math.pow(10,Math.max(r1,r2)); 
		n=(r1>=r2)?r1:r2; 
		return ((arg1*m-arg2*m)/m).toFixed(n); 
	},
  jsonType(str){
    if (typeof str == 'string') {
      try {
        var obj = JSON.parse(str);
        // 等于这个条件说明就是JSON字符串 会返回true
        if (typeof obj == 'object' && obj) {
          return true;
        } else {
          //不是就返回false
          return false;
        }
      } catch (e) {
        return false;
      }
    }
    return false;
  },
  downloadImage(imgsrc, name, type = 'png') {
    let image = new Image();
    // 解决跨域 Canvas 污染问题
    image.setAttribute("crossOrigin", "anonymous");
    image.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      let context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0, image.width, image.height);
      let url = canvas.toDataURL(`image/${type}`); //得到图片的base64编码数据
      let a = document.createElement("a"); // 生成一个a元素
      let event = new MouseEvent("click"); // 创建一个单击事件
      a.download = name || "pic"; // 设置图片名称
      a.href = url; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    }
    //将资源链接赋值过去，才能触发image.onload 事件
    image.src = imgsrc
  },
  downFile(url, name){ // 文件下载-不能跨域
    const a = document.createElement('a');
    a.style.display = 'none';
    a.download = name;
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    /*
	  * download: HTML5新增的属性
	  * url: 属性的地址必须是非跨域的地址
	  */
  },
  // 跨域
  downFileCros(
    url = '',
    name = 'name'
  ) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      const url = window.URL.createObjectURL(xhr.response)
      const eleLink = document.createElement('a')
      eleLink.href = url
      eleLink.download = name
      eleLink.style.display = 'none'
      document.body.appendChild(eleLink)
      eleLink.click()
      document.body.removeChild(eleLink)
    }
    xhr.send()
  },
  cotyText(content) { // 拷贝文字
		// console.log('222',content)
		const dom = document.createElement("input")
		dom.value = content
		document.body.appendChild(dom)
		dom.select()
		document.execCommand("copy")
		document.body.removeChild(dom)
    // showToast('')
    ElMessage({
      message: '复制成功',
      type: 'success',
    })
	},
  // 华为图片审核
  hwImg(rawFile) {
    // console.log('hwImg====',rawFile)
    return new Promise((resolve)=>{
      var base64Str = ''
      let reader = new FileReader();
      reader.readAsDataURL(rawFile);
      reader.onload = function () {
        let result = reader.result;
        // 将文件内容转换成base64字符串
        base64Str = result.split(",")[1];
        // 将base64字符串传递给后端
        // console.log('base64Str====',base64Str)
        api.getModerationToken().then(res=>{
          var obj = {
            event_type : "comment",
            image : base64Str,
            categories : [ "porn", "terrorism" ],
            // image_text_config : {
            //   black_glossary_names : [ "test" ]
            // }
          }
          var xhr = new XMLHttpRequest();
          var hwUrl = '/v3/60a14006332644b584b0e357c3c6a81b/moderation/image'
          if(localStorage.getItem('electron')=== 'true'){
            hwUrl = "https://moderation.cn-east-3.myhuaweicloud.com/v3/60a14006332644b584b0e357c3c6a81b/moderation/image"
          }
          xhr.open("POST", hwUrl, true);
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.setRequestHeader("X-Auth-Token", res.data.token);
          xhr.onload = function() {
            if (xhr.status === 200) {
              //parse JSON datax`x
              let data = JSON.parse(xhr.responseText)
              if (data.result.suggestion == 'pass'|| data.result.suggestion=='review') {
                // console.log('文件通过')
                return resolve(true)
              } else {
                ElMessage({
                  message: '涉及敏感图片',
                  type: 'warning',
                })
                return resolve(false)
              }
            } else {
              console.log("请求失败")
              return resolve(false)
            }
          }
          xhr.onerror = function() {
            console.log("Network error occurred")
            return resolve(false)
          }
          xhr.send(JSON.stringify(obj));
        }).catch(err => {
          return resolve(false)
        })
      }
    })
  }
}
export default method