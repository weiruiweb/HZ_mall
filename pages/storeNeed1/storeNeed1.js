import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();

Page({
  data: {
    storeData:[],
    mainData:[],
    isFirstLoadAllStandard:['getMainData','getStoreData'],
    submitData:{
     
      score:'',
    },
    storeDataSelect:[]
  }, 



  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.data.user_type = options.user_type;
    self.data.id=options.id;
    self.getMainData();
  },


  getMainData(){
    const self = this;
    const postData = {};
    if(self.data.user_type&&self.data.user_type==1){
      postData.tokenFuncName='getProjectMerchantToken';
    }else{
       postData.tokenFuncName='getProjectToken';
    }
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3,
      id:self.data.id
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getAfter = {
      userMessage:{
        tableName:'Message',
        middleKey:'relation_id',
        key:'id',
        searchItem:{
          status:1
        },
        condition:'='
      },
      userData:{
        tableName:'User',
        middleKey:['userMessage',0,'user_no'],
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
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

/*  getMerchantData() {
    const self = this;
    const postData = {};
    if(self.data.user_type&&self.data.user_type==1){
      postData.tokenFuncName='getProjectMerchantToken';
    }else{
       postData.tokenFuncName='getProjectToken';
    };
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
  },*/

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

  messageUpdate(){
    const self = this;
    wx.showLoading();
    const postData = {};
    if(self.data.user_type&&self.data.user_type==1){
      postData.tokenFuncName='getProjectMerchantToken';
    }else{
       postData.tokenFuncName='getProjectToken';
    };
    postData.data = api.cloneForm(self.data.submitData);
    postData.searchItem = {
      id:self.data.id
    }
    console.log(postData)
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('修改成功','none');
        
      }else{
        api.showToast('修改失败','none');
      };
      self.data.storeData=[];
      self.getStoreData();
      api.buttonCanClick(self,true);
    };
    api.messageUpdate(postData,callback);  
  },


  submit(){
    const self = this;
    api.buttonCanClick(self);
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
      const callback = (user,res) =>{ 
        self.messageUpdate(); 
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
    if(self.data.user_type&&self.data.user_type==1){
      postData.tokenFuncName='getProjectMerchantToken';
    }else{
       postData.tokenFuncName='getProjectToken';
    }
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3,
      relation_id:self.data.mainData.userMessage[0].id,
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
          for (var i = 0; i < self.data.storeData.length; i++) {
            if(self.data.storeData[i].behavior==2){
              self.data.storeDataSelect.push(self.data.storeData[i]) 
            };
            if(self.data.storeData[i].user[0].user_no==wx.getStorageSync('threeInfo').user_no){
              self.data.submitData.score = self.data.storeData[i].score
            }
          }
      }

      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getStoreData',self);
      console.log('storeDataSelect',self.data.storeDataSelect);
      console.log('getStoreData',self.data.storeData);
      self.setData({
        web_submitData:self.data.submitData,
        web_storeDataSelect:self.data.storeDataSelect,
        web_storeData:self.data.storeData,
      });
      //self.getMerchantData()
    };
    api.messageGet(postData,callback);   
  },

})