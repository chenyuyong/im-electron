const indexDB = window.indexedDB || window.webkitIndexedDB ||
  window.mozIndexedDB;

class IndexDBCache {
  //构造函数
  constructor(callback) {
    this._db = null; //数据库
    this._transaction = null; //事务
    this._request = null;
    this._dbName = 'cacheModel'; //数据库名
    this._cacheTableName = 'tabmodalcache'; //表名
    this._dbversion = 1; //数据库版本 
    this.DB_Init(callback); //初始化数据库
  }


  //初始化数据库
  DB_Init(callback) {

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

      if (!db.objectStoreNames.contains(this._cacheTableName)) {
        let store = db.createObjectStore(this._cacheTableName, {
          keyPath: 'id', //设置主键
          autoIncrement: true //自动生成主键
        });
        //创建索引
        store.createIndex("INDEX_ID", "id", {
          unique: true
        });

        //创建索引
        store.createIndex('index_senceid', 'senceid', {
          unique: false, //true:唯一，false:可重复
        });
      }
      let msg = 'indexdb升级成功！';
      console.log(msg);
      if (typeof callback === 'function') callback(msg);
    }
  }

  //删除数据库
  DB_Remove(callback) {
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

  //关闭数据库
  DB_Close() {
    this._db.close();
  }

  //获取表
  Table_Get() {
    return new Promise((resolve, reject) => {
      resolve(this._db.objectStoreNames);
    });
  }

  /** 新增数据 
   * obj: {path:'Http://xxxxx.com',version:'V1',value:'ccc'}  
   * */
  Record_Add(obj) {

    return new Promise((resolve, reject) => {

      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
      let response = store.add(obj);
      response.onsuccess = (cc, mm) => {

        let msg = `新增数据${JSON.stringify(obj)}`
        resolve(msg);
      }
      response.onerror = (event) => {
        console.log('新增失败');
        reject(event);
      }
    })
  }

  //获取数据
  Record_Get() {
    return new Promise((resolve, reject) => {

      let transaction = this._db.transaction(this._cacheTableName);
      var objectStore = transaction.objectStore(this._cacheTableName);

      //主健读取
      // var request = objectStore.get(1);

      //使用索引读取
      var index = objectStore.index('index_senceid');
      var request = index.get('222');

      request.onsuccess = () => {

        resolve(request.result);
      };

      request.onerror = (event) => {

        console.log('获取失败');
        reject(event);
      };
    });
  }

  //获取所有数据
  Record_GetAll() {
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
  Record_Update(obj) {
    return new Promise((resolve, reject) => {

      let transaction = this._db.transaction(this._cacheTableName, 'readwrite');
      let store = transaction.objectStore(this._cacheTableName);
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
}

export default IndexDBCache;