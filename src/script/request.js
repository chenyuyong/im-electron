// 引入axios
import axios from "axios";
import md5 from 'js-md5'
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router'
const router = useRouter()
// 1.准备baseurl
let baseURL = 'https://niannian-api-web-dev.miaojiahui.cn'
let accessSecret = '350ddc9c69c842159fe8295275ace858'
if(process.env.NODE_ENV === "tests" || process.env.NODE_ENV === "dev"){
  baseURL = 'https://niannian-api-web-dev.miaojiahui.cn'
  // baseURL = 'http://192.168.0.118:8850' // 雷神
  accessSecret = '350ddc9c69c842159fe8295275ace858'
}else if(process.env.NODE_ENV === "pre"){
  baseURL = 'https://niannian-api-web-pre.miaojiahui.cn'
  accessSecret = 'e83b51fbbd664938ac9f3ec37e44ef6c'
}else if(process.env.NODE_ENV === "prod"){
  baseURL = 'https://nn-api-web.miaojiahui.cn'
   accessSecret = '8d0b643c88144bcfa1faa590dd8cf350'
}
console.log("accessSecret",accessSecret)
console.log("baseURL",baseURL)
// 2.创建新的axios实例  service
const service = axios.create({
  baseURL: baseURL,
  // 超时时间
  timeout: 5000,
});
//   3.添加请求拦截器
// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么.
    const timestamp = new Date().getTime()
    // console.log('timestamp', timestamp, "config", config.params)
    const arr =   []
    if (typeof config.params === "object") {
      for(var i in config.params) {
        arr.push(i + "=" + config.params[i])
      }
    }
		arr.push(`timestamp=${timestamp}`)
    if(localStorage.getItem('token')) arr.push(`token=${localStorage.getItem('token')}`)
    const encry = arr.sort().join("&")
		// console.log('encry)===========11', encry + "&" + `accessSecret=${accessSecret}`)
		const sign = md5(encry + "&" + `accessSecret=${accessSecret}`)
		// console.log('sign', sign)
    config.headers = {
      'sign': sign,
      "timestamp":timestamp,
      'Content-Type': config.headers['Content-Type'] || 'application/json', //配置请求头
      'Authorization': localStorage.getItem('token'), //配置token
      'appType': 'WEB',
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
// 4.添加响应拦截器
// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    // 手动清除 Toast
    if( response.data.code === 401 ){
      localStorage.setItem('userinfo', '')
      localStorage.setItem('token', '')
      localStorage.setItem('userId', '')
      localStorage.setItem('groupsArr', '')
      localStorage.setItem('friendArr', '')
      router.push({
        path: '/login',
      })
		}
    return response.data;
  },
  (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    if (error.response) {
      // error.response包含了服务器响应的详细信息
      const statusCode = error.response.status;
      const errorMessage = error.response.data.error;
      // console.log(error.response.data)
			// 根据不同的错误代码，显示不同的错误消息
      switch (statusCode) {
        case 400:
          ElMessage.warning(`输入错误: ${errorMessage}`);
          break;
        case 404:
          ElMessage.warning(`请求接口不存在`);
          break;
        case 500:
          ElMessage.warning(`服务器错误，请稍后重试。`);
          break;
        default:
          ElMessage.warning(`未知错误: ${errorMessage}`);
      }
    } else {
      // 其他错误（例如网络问题）
      ElMessage.warning('网络错误，请检查你的连接。');
    }
    return Promise.reject(error);
  }
);
// 5.向外抛出实例对象
export default service