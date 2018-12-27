import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({


  data: {
    sForm:{
      name:'',
      latitude:'',
      longitude:'',
      phone:'',
      detail:'',
      city:'',

    },
    id:'',
    
  },

  onLoad(options) {
    const self=this;
    api.commonInit(self);
    if(options.id){
      self.data.id = options.id
      self.getMainData(self.data.id); 
    }else{
      self.setData({
        web_region:self.data.region
      })
    };
    wx.hideLoading();
    
  },

  getMainData(id){
    const self = this;
    wx.showLoading();
    const postData = {};
    postData.searchItem = {};
    postData.searchItem.id = id;
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      console.log(res);
      self.data.mainData = res;
      self.data.sForm.phone = res.info.data[0].phone;
      self.data.sForm.name = res.info.data[0].name;
      self.data.sForm.detail = res.info.data[0].detail;
      self.data.sForm.latitude = res.info.data[0].latitude;
      self.data.sForm.longitude = res.info.data[0].longitude;
      self.data.sForm.city = res.info.data[0].city;
      self.data.isdefault = res.info.data[0].isdefault;
      console.log('self.data.isdefault',self.data.isdefault)
      self.setData({
        web_isdefault:self.data.isdefault,
        web_mainData:self.data.sForm,
      })
      wx.hideLoading();
    };
    api.addressGet(postData,callback);
  },


  inputChange(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    self.setData({
      web_sForm:self.data.sForm,
    });  
  },




  addressUpdate(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {};
    postData.searchItem.id = self.data.id;
    postData.data = {};
    postData.data = api.cloneForm(self.data.sForm);
    postData.data.isdefault = self.data.isdefault;
    const callback = (data)=>{
      if(data){
        api.dealRes(data);
      };
      api.buttonCanClick(self,true); 
    };
    api.addressUpdate(postData,callback);
  },
  

  addressAdd(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data = {};
    postData.data = api.cloneForm(self.data.sForm);
    postData.data.isdefault = self.data.isdefault;
    const callback = (data)=>{
      if(data){
        api.dealRes(data);
      };
       api.buttonCanClick(self,true); 
    };
    api.addressAdd(postData,callback);
  },
  

  submit(){
    const self = this;
    api.buttonCanClick(self);
    var phone = self.data.sForm.phone;
    const pass = api.checkComplete(self.data.sForm);
    console.log('self.data.sForm',self.data.sForm)
    if(pass){
      if(phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)){
        api.showToast('手机格式不正确','fail')
        api.buttonCanClick(self,true);
      }else{
        if(self.data.id){
          wx.showLoading();     
          self.addressUpdate();
        }else{
          wx.showLoading();
          self.addressAdd();
        }
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          });
        },300);  
      }
    }else{
      api.showToast('请补全信息','fail');
      api.buttonCanClick(self,true);
    };
  },

  chooseLocation:function(e){
    var self = this;
    wx.chooseLocation({
      success: function(res){
        self.data.sForm.detail = res.address,
        self.data.sForm.longitude = res.longitude,
        self.data.sForm.latitude = res.latitude,
        self.data.sForm.city = res.name
        self .setData({
          hasLocation:true,
          location:{
            longitude:res.longitude,
            latitude:res.latitude
          },
          web_mainData:self.data.sForm,
        })
      },
      fail: function() {
      // fail
      },
      complete: function() {
      // complete
      }
    })
  },



  switch2Change(e){
    const self = this;
    console.log(e)
    if( e.detail.value == true){
      self.data.isdefault = 1
    }else{
      self.data.isdefault = 0
    }
    
  }

})