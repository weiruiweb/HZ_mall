import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    disabled: true,
    isFirstLoadAllStandard:['getMainData'],
    submitData:{
      bank_name:'',
      bank_card:'',
      bank_user:'',
      bank_phone:''
    },

  },
  //事件处理函数
  preventTouchMove: function(e) {

  },

  onLoad(options) {
    const self = this;
    api.commonInit(self);
    if(options.type){
      self.data.type = options.type
    };
    self.getMainData()
  },



  changeBind(e) {
    const self = this;
    api.fillChange(e, self, 'submitData');
    self.setData({
      web_submitData: self.data.submitData,
    });
    console.log(self.data.submitData)
  },




  submit() {
    const self = this;
    api.buttonCanClick(self)
    var name = self.data.submitData.bank_user;
    var phone= self.data.submitData.bank_phone;
    const pass = api.checkComplete(self.data.submitData);
    if (pass) {
      if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
        api.buttonCanClick(self,true);
        api.showToast('手机格式错误', 'none')
      } else {
        if (!/^[\u4E00-\u9FA5]+$/.test(name)) {
          api.buttonCanClick(self,true);
          api.showToast('姓名格式错误', 'none')
        } else {
          self.userInfoUpdate();
        }
      }
    } else {
      api.buttonCanClick(self,true);
      api.showToast('请补全信息', 'none');
      
    };
  },



  getMainData() {
    const self = this;
    const postData = {};
    if(self.data.type=='merchant'){
      postData.tokenFuncName = 'getProjectMerchantToken';
    }else{
      postData.tokenFuncName = 'getProjectToken';
    }
    const callback = (res) => {
      self.data.mainData = {};
      if (res.info.data.length > 0) {
        self.data.mainData = res.info.data[0];
        self.data.submitData.bank_phone = res.info.data[0].info.bank_phone;
        self.data.submitData.bank_name = res.info.data[0].info.bank_name; 
        self.data.submitData.bank_card = res.info.data[0].info.bank_card;
        self.data.submitData.bank_user = res.info.data[0].info.bank_user; 
      };
      self.setData({
        web_submitData:self.data.submitData,
        web_mainData: self.data.mainData
      });
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    };
    api.userGet(postData, callback);
  },

  userInfoUpdate(){
    const self = this;
    const postData = {};
    if(self.data.type=='merchant'){
      postData.tokenFuncName = 'getProjectMerchantToken';
    }else{
      postData.tokenFuncName = 'getProjectToken';
    }
    postData.data = {};
    postData.data = api.cloneForm(self.data.submitData);
    const callback = (data)=>{
      if(data.solely_code==100000){
        api.showToast('完善成功','none')
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          });
        },300); 
      }else{
        api.showToast('网络故障','none')
      };
      api.buttonCanClick(self,true);
    };
    api.userInfoUpdate(postData,callback);
  },



  intoPath(e) {
    const self = this;
    api.pathTo(api.getDataSet(e, 'path'), 'nav');
  },

  intoPathRedi(e) {
    const self = this;
    wx.navigateBack({
      delta: 1
    })
  },

  intoPathRedirect(e) {
    const self = this;
    api.pathTo(api.getDataSet(e, 'path'), 'redi');
  }

})

  