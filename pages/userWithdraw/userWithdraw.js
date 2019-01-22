//logs.js
import {Api} from '../../utils/api.js';
var api = new Api();

import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {

    submitData:{
      count:'',
      cardNum:'',
    },
    isFirstLoadAllStandard:['getUserData']



  },



  onLoad(options){
    const self = this;
    api.commonInit(self);
    if(options.type){
      self.data.type = options.type
    };
    self.getUserData();
  },





  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');

    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    }); 
  },



  flowLogAdd(){
    const self = this;
    const postData = {
        
        data:{
          user_no:wx.getStorageSync('info').user_no,
          count:-self.data.submitData.count,
          cardNum:self.data.submitData.card,
          trade_info:'提现',
          status:0,
          type:2
        }
    };
    if(self.data.type=='merchant'){
      postData.tokenFuncName = 'getProjectMerchantToken';
    }else{
      postData.tokenFuncName = 'getProjectToken';
    }
    const callback = (res)=>{
      if(res.solely_code==100000){
        api.showToast('申请成功','none'); 
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        },300);
      }
      api.buttonCanClick(self,true)
    };
    api.flowLogAdd(postData,callback)

  },

  getUserData(){
    const self = this;
    const postData = {};
    if(self.data.type=='merchant'){
      postData.tokenFuncName = 'getProjectMerchantToken';
    }else{
      postData.tokenFuncName = 'getProjectToken';
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.userData = res.info.data[0]
      };
      self.setData({
        web_userData:self.data.userData
      });
     api.checkLoadAll(self.data.isFirstLoadAllStandard,'getUserData',self)
    };
    api.userGet(postData,callback);   
  },
  

  submit(){
    const self = this;
    api.buttonCanClick(self);
    var num = self.data.submitData.count;
    const pass = api.checkComplete(self.data.submitData);
    if(pass){  
      console.log(self.data.userData)
      if(num>=100){

        if(self.data.userData.info.balance&&parseInt(self.data.userData.info.balance)>=num){
          if(!(/(^[1-9]\d*$)/.test(num))){
            api.buttonCanClick(self,true)
           api.showToast('请输入正整数','none')
          }else{
            self.flowLogAdd();
          }   
        }else{
          api.buttonCanClick(self,true)
          api.showToast('佣金不足','none');  
        }  
      }else{
        console.log(parseInt(self.data.userData.info.balance));
        api.buttonCanClick(self,true)
        api.showToast('最低提现100元','none');  
      }
       
    }else{
      api.buttonCanClick(self,true)
      api.showToast('请补全信息','none');
    };
  },

  allOut(){
    const self = this;
    self.data.submitData.count = self.data.userData.info.balance;
    self.setData({
      web_submitData:self.data.submitData
    });
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathBack(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
})

  