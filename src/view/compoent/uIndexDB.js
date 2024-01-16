const indexDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
class IndexDBCache {
  //构造函数
  constructor(dbName,callback) {
    this._db = null; //数据库
    this._transaction = null; //事务
    this._request = null;
    this._dbName = ''; //数据库名
    this._cacheTableName = 'friendTable'; //表名 chatTable  friendTable userInfoTable
    this._dbversion = 10003; //数据库版本 
    this.DB_Init(dbName,callback); //初始化数据库
  }
  DB_Init(dbName,callback) { // 初始化数据库
    console.log("this.初始化数据库",this._db)
    if(this._db){
      return
    }
    this._dbName = dbName
    console.log('数据库名',this._dbName)
    this._request = indexDB.open(this._dbName, this._dbversion); //数据库名，版本
    this._request.onsuccess = event => {
      this._db = this._request.result;
      let msg = 'indexdb打开成功！'
      console.log(msg);
      if (typeof callback === 'function') callback(msg);
    };
    this._request.onerror = event => {
      let msg = 'indexdb初始化失败！'
      console.log(msg);
      if (typeof callback === 'function') callback(msg);
    };
    this._request.onupgradeneeded = event => {
      let db = this._request.result;
      if (!db.objectStoreNames.contains('chatTable')) { // 聊天表
        let store = db.createObjectStore('chatTable', {
          keyPath: 'targetId', // 设置主键
          autoIncrement: false // 自动生成主键
        });
        //创建索引
        store.createIndex("index_id", "targetId", {
          unique: true
        });
      }
      if (!db.objectStoreNames.contains('friendTable')) { // 联系好友表
        let store = db.createObjectStore('friendTable', {
          keyPath: 'id', // 设置主键
          autoIncrement: false // 自动生成主键
        });
        //创建索引
        store.createIndex("index_id", "id", {
          unique: true
        });
      }
      if (!db.objectStoreNames.contains('userInfoTable')) { // 用户信息
        let store = db.createObjectStore('userInfoTable', {
          keyPath: 'userId', // 设置主键
          autoIncrement: false // 自动生成主键
        });
        //创建索引
        store.createIndex("index_id", "userId", {
          unique: true
        });
      }
      
      let msg = 'indexdb升级成功！';
      console.log(msg);
      if (typeof callback === 'function') callback(msg);
    }
  }
  DB_Remove(callback) { //删除数据库
    // console.log('删除数据库')
    var DBDeleteRequest = indexedDB.deleteDatabase(this._dbName);
    DBDeleteRequest.onerror = function (event) {
      console.log('Error');
    };
    DBDeleteRequest.onsuccess = function (event) {
      let msg = 'indexdb删除成功！';
      console.log(msg);
      if (typeof callback === 'function') callback(msg);
    };
  }
  DB_Close() { // 关闭数据库
    console.log('关闭数据库')
    this._db.close();
  }
  Table_Get() { // 获取表
    return new Promise((resolve, reject) => {
      resolve(this._db.objectStoreNames);
    });
  }
  /** 新增数据 
   * obj: {path:'Http://xxxxx.com',version:'V1',value:'ccc'}  
   * */
  Record_Add_Arr(tableName,arr) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(tableName, 'readwrite');
      let store = transaction.objectStore(tableName);
      console.log("Record_Add")
      for(let i = 0; arr.length > i; i++) {
        let response = store.add(arr[i]);
        response.onsuccess = (cc, mm) => {
          console.log('新增成功 arr');
          // let msg = `新增数据${JSON.stringify(arr[i])}`
          resolve();
        }
        response.onerror = (event) => {
          console.log('新增失败');
          reject(event);
        }
      }
    })
  }
  Record_Add_Obj(tableName,obj) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(tableName, 'readwrite');
      let store = transaction.objectStore(tableName);
      let response = store.add(obj);
      response.onsuccess = (cc, mm) => {
        console.log('新增成功 _obj');
        // let msg = `新增数据${JSON.stringify(obj)}`
        resolve();
      }
      response.onerror = (event) => {
        console.log('新增失败');
        reject(event);
      }
    })
  }
  Record_Get(tableName, key) { // 获取数据
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(tableName);
      var objectStore = transaction.objectStore(tableName);
      //主健读取
      // var request = objectStore.get(1);
      //使用索引读取
      var index = objectStore.index('index_id');
      var request = index.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        console.log('获取失败');
        reject(event);
      };
    });
  }
  Record_GetAll() { // 获取所有数据
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName);
      var objectStore = transaction.objectStore(this._cacheTableName);
      let request = objectStore.getAll();
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        console.log('获取失败');
        reject(event);
      };
    })
  }
  /** 更新数据
   * obj: {path:'Http://xxxxx.com',version:'V1',value:'fff'}  
   */
  Record_Update(tableName, obj) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(tableName, 'readwrite');
      let store = transaction.objectStore(tableName);
      var request = store.put(obj);
      request.onsuccess = function (event) {
        let msg = '数据更新成功';
        console.log(msg);
        resolve(msg);
      };
      request.onerror = function (event) {
        console.log('数据更新失败');
        reject(event);
      }
    });
  }
  //删除数据
  Record_Remove(id) {
    return new Promise((resolve, reject) => {
      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let response = store.delete(id);
      response.onsuccess = () => {
        console.log('删除成功');
        resolve('删除成功');
      }
      response.onerror = (event) => {
        console.log('删除失败');
        reject(event);
      }
    })
  }
  loadNetSource(url) { // 加载网络文件
    return new Promise((resolve, reject) => {
      fetch(url).then(res => {
        if (res.status === 200) {
          res.blob().then(blob => {
            resolve(blob);
          })
        } else {
          console.log('未找到缓存资源');
          reject(url);
        }
      })
    })
  }

}
export default IndexDBCache;
