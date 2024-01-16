<template>
  <div class="box">
    <div class="btnBox">
      <button class="btn" @click="fun_db_close">关闭数据库</button>
      <button class="btn" @click="fun_db_remove">删除数据库</button>
    </div>
    <div class="btnBox">
      <button class="btn" @click="fun_table_create">创建对象仓库</button>
      <button class="btn" @click="fun_table_remove">删除对象仓库</button>
      <button class="btn" @click="fun_table_update">更新对象仓库</button>
      <button class="btn" @click="fun_table_get">获取对象仓库</button>
    </div>

    <div class="btnBox">
      <button class="btn" @click="fun_record_create">写入记录</button>
      <button class="btn" @click="fun_record_remove">删除记录</button>
      <button class="btn" @click="fun_record_update">更新记录</button>
      <button class="btn" @click="fun_record_get">获取记录</button>
      <button class="btn" @click="fun_record_getall">获取所有记录</button>
    </div>
    <div class="infoBox">
      <p class="pInfo" v-for="(item, i) in messages" :key="i">{{ item }}</p>
    </div>
  </div>
</template>

<script >
import IndexDBCache from "./compoent/uIndexDB2";
let dbCache = null;

export default {
  data() {
    return {
      messages: [],
    };
  },

  //页面加载时初始化 indexdb
  mounted() {
    debugger;
    dbCache = new IndexDBCache();
  },

  // //页面销毁时 关闭数据库
  // destroyed() {
  //   debugger;
  //   this.fun_db_close();
  // },

  methods: {
    fun_db_close() {
      dbCache.DB_Close();
    },
    //删除数据库
    fun_db_remove() {
      dbCache.DB_Remove((msg) => this.supply_message(msg));
    },

    //写入记录
    fun_record_create() {
      debugger
      console.log('写入记录')
      // let objParam = {
      //   senceid: "111",
      //   version: "V1",
      //   path: "Http://xxxx.com",
      //   value: "aaa",
      // };

      let objParam = {
        senceid: "222",
        version: "V1",
        path: "Http://yyyy.com",
        value: "bbb",
      };
      dbCache.Record_Add(objParam).then((msg) => {
        this.messages.push("写入: " + msg);
      });
    },
    //删除记录
    fun_record_remove() {
      dbCache.Record_Remove(2).then((msg) => {
        this.messages.push("删除: " + msg);
      });
    },
    //更新记录
    fun_record_update() {
      let objParam = {
        id: 2,
        senceid: "222",
        version: "V2",
        path: "Http://yyyy-2.com",
        value: "bbb2",
      };
      dbCache.Record_Update(objParam).then((msg) => {
        this.messages.push("更新: " + msg);
      });
    },
    //获取数据
    fun_record_get() {
      dbCache.Record_Get().then((msg) => {
        this.messages.push("读取: " + JSON.stringify(msg));
      });
    },
    //获取所有数据
    fun_record_getall() {
      dbCache.Record_GetAll().then((msg) => {
        this.messages.push("读取: " + JSON.stringify(msg));
      });
    },
    //创建表
    fun_table_create() {
      this.messages.push(
        "请修改版本号更新数据库，参考：https://wangdoc.com/javascript/bom/indexeddb.html#indexeddbdeletedatabase"
      );
    },
    //删除表
    fun_table_remove() {
      this.messages.push(
        "在versionchange中实现 deleteObjectStore 方法 ，参考://wangdoc.com/javascript/bom/indexeddb.html#indexeddbdeletedatabase"
      );
    },
    //更新表
    fun_table_update() {
      this.messages.push(
        "请修改版本号更新数据库，参考：https://wangdoc.com/javascript/bom/indexeddb.html#indexeddbdeletedatabase"
      );
    },
    //获取表
    fun_table_get() {
      dbCache.Table_Get().then((msg) => {
        this.messages.push("获取表: " + JSON.stringify(msg));
      });
    },
    //输出信息
    supply_message(msg) {
      this.messages.push(msg);
    },
  },
};
</script>

<style scoped>
.box {
  margin: 20px;
}
.btnBox {
  margin: 10px;
}
.btn {
  width: 100px;
  height: 30px;
}

.infoBox {
  min-height: 50px;
  border: 1px solid grey;
  margin: 10px;
  padding: 5px 10px;
}
.pInfo {
  margin: 5px;
}
</style>