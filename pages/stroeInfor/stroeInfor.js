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
      name:'',
      phone:'',
      idCard:'',
      passage1:''
    },

  },
  //事件处理函数
  preventTouchMove: function(e) {

  },

  onLoad(options) {
    const self = this;
    api.commonInit(self);
    
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
    var name = self.data.submitData.name;
    var phone= self.data.submitData.phone;
    const pass = api.checkComplete(self.data.submitData);
    if (pass) {
      if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
        api.showToast('手机格式错误', 'none')
      } else {
        if (!/^[\u4E00-\u9FA5]+$/.test(name)) {
          api.showToast('姓名格式错误', 'none')
        } else {
          self.userInfoUpdate();
        }
      }
    } else {
      api.showToast('请补全信息', 'none');
      api.buttonCanClick(self,true);
    };
  },



  getMainData() {
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectMerchantToken';
    const callback = (res) => {
      self.data.mainData = {};
      if (res.info.data.length > 0) {
        self.data.mainData = res.info.data[0];
        self.data.submitData.phone = res.info.data[0].info.phone;
        self.data.submitData.name = res.info.data[0].info.name; 
        self.data.submitData.idCard = res.info.data[0].info.idCard;
        self.data.submitData.passage1 = res.info.data[0].info.passage1; 
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
    postData.tokenFuncName='getProjectMerchantToken';
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