import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();

Page({
  data: {

    messageData:[],
    storeData:[],
    mainData:[],
    isFirstLoadAllStandard:['getMainData','getStoreData','getMerchantData'],
    submitData:{
     
      score:'',
    }
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
    postData.getAfter = {
      userData:{
        tableName:'User',
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
  
          self.data.mainData = res.info.data[0]

      }else{
        api.showToast('数据错误','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
     
      self.setData({
        web_mainData:self.data.mainData,
      });
      self.checkMessage();
      self.getStoreData()
    };
    api.messageGet(postData,callback);   
  },

  getMerchantData() {
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectMerchantToken';
    const callback = (res) => {
      self.data.merchantData = {};
      if (res.info.data.length > 0) {
        self.data.merchantData = res.info.data[0];
      };
      self.setData({
        web_merchantData: self.data.merchantData
      });
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMerchantData',self);
    };
    api.userGet(postData, callback);
  },

  checkMessage(){
    const self = this;

    const postData = {
      tokenFuncName:'getProjectMerchantToken',
      searchItem:{
        type:3,
        relation_id:self.data.mainData.id, 
      }, 
    };
    const callback = (res) =>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data)
      };
      console.log('checkMessage',self.data.messageData)
      self.setData({
        web_messageData:self.data.messageData
      })
    }
    api.messageGet(postData,callback)
  },

  changeBind(e){
    const self = this;
    
    if(api.getDataSet(e,'value')){
      self.data.submitData[api.getDataSet(e,'key')] = api.getDataSet(e,'value');
    }else{
      api.fillChange(e,self,'submitData');
    };
    self.setData({
      web_submitData:self.data.submitData,
    }); 
    console.log(self.data.submitData)
  },

  messageAdd(){
    const self = this;
    wx.showLoading();
    const postData = {};
    postData.token = wx.getStorageSync('threeToken')
    postData.data = api.cloneForm(self.data.submitData);
    postData.data.type = 3;
    postData.data.behavior = 1;
    postData.data.relation_id = self.data.id;
    postData.data.user_no = wx.getStorageSync('threeInfo').user_no;
    console.log(postData)
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('发布成功','none');
        self.data.submitData = {
          score:''
        };
        self.setData({
          web_submitData:self.data.submitData
        });
        
      }else{
        api.showToast('发布失败','none');
      };
      self.data.storeData=[];
      self.getStoreData();
      self.checkMessage();
      api.buttonCanClick(self,true);
    };
    api.messageAdd(postData,callback);  
  },


  submit(){
    const self = this;
    api.buttonCanClick(self);
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
      const callback = (user,res) =>{ 
        self.messageAdd(); 
      };
      api.getAuthSetting(callback); 
    }else{
      api.showToast('请补全信息','none');
      api.buttonCanClick(self,true);
    };
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
        tableName:'User',
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
          self.data.storeData.push.apply(self.data.storeData,res.info.data)
      }

      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getStoreData',self);
     
      self.setData({
        web_storeNum:self.data.storeData.length,
        web_storeData:self.data.storeData,
      });
      self.getMerchantData()
    };
    api.messageGet(postData,callback);   
  },

})