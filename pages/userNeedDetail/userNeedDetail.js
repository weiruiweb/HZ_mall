import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();

Page({
  data: {
    idData:[],
    storeData:[],
    mainData:[],
   
    isFirstLoadAllStandard:['getMainData','getStoreData'],
    submitData:{
      behavior:2
    },
  }, 



  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.data.id=options.id;
    self.getMainData();
  },


  getMainData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:2,
      id:self.data.id
    };
    postData.order = {
      create_time:'normal'
    };

    const callback = (res)=>{
      if(res.info.data.length>0){
  
          self.data.mainData = res.info.data[0]

      }else{
        api.showToast('数据错误','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
     
      self.setData({
        web_mainData:self.data.mainData,
      });
      self.getStoreData()
    };
    api.messageGet(postData,callback);   
  },



  messageUpdate(id){
    const self = this;
    const postData = {};
    postData.searchItem = {
      id:self.data.id
    };
    postData.tokenFuncName='getProjectToken';
    postData.data = api.cloneForm(self.data.submitData);
    postData.saveAfter=[
      {
        tableName:'Message',
        FuncName:'update',
        searchItem:{
          id:self.data.selectId,
          user_type:1
        },
        data:{
          behavior:2
        }
      },
      {
        tableName:'Message',
        FuncName:'update',
        searchItem:{
          id:['in',self.data.noSelectId],
          user_type:1
        },
        data:{
          behavior:3
        }
      },
    ];
    console.log(postData)
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('更新状态成功','none'); 
        api.pathTo('/pages/userNeed/userNeed','redi',500)
      }else{
        api.showToast('更新状态失败','none');
      };
      api.buttonCanClick(self,true);
    };
    api.messageUpdate(postData,callback);  
  },

  select(e){
    const self = this;
    self.data.noSelectId = [];
    
    self.data.selectId = api.getDataSet(e,'id');
    self.data.noSelectId = api.removeItemFormArr(self.data.idData,self.data.selectId)
    self.setData({
      web_selectId:self.data.selectId
    });
    console.log('select',self.data.selectId)
    console.log('select',self.data.noSelectId)
  },

  submit(){
    const self = this;
    api.buttonCanClick(self);
    if(!self.data.selectId){
      api.showToast('请选择中标者','none');
      api.buttonCanClick(self,true);
      return;
    };
    const callback = (user,res) =>{ 
      self.messageUpdate(); 
    };
    api.getAuthSetting(callback); 
    
  },

  getStoreData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3,
      relation_id:self.data.id,
      user_type:1
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        searchItem:{
          status:1
        },
        middleKey:'user_no',
        key:'user_no',
        condition:'in'
      },
      userInfo:{
        tableName:'UserInfo',
        searchItem:{
          status:1
        },
        middleKey:'user_no',
        key:'user_no',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
          self.data.storeData.push.apply(self.data.storeData,res.info.data);
          for (var i = 0; i < self.data.storeData.length; i++) {
            self.data.idData.push(self.data.storeData[i].id)

          };
          console.log(self.data.idData)
      }else{
        api.showToast('数据错误','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getStoreData',self);
     
      self.setData({
        web_storeData:self.data.storeData,
      });
    };
    api.messageGet(postData,callback);   
  },

})