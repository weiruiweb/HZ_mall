import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    sForm:{
      name:'',
      phone:'',
      password:''  
    },
   
    buttonCanClick:true

  },


  onLoad(){
    const self = this;
    self.setData({
      web_buttonCanClick:self.data.buttonCanClick
    })
  },


  changeBind(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    console.log(self.data.sForm);
    self.setData({
      web_sForm:self.data.sForm,
    });    
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },
  

  register(){
    const self = this;
    const postData = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      password:self.data.sForm.password,
      name:self.data.sForm.name,
      phone:self.data.sForm.phone,  
    };
    const callback = (res)=>{
      if(res.solely_code==100000){
        api.showToast('申请成功','none',800);
        setTimeout(function(){
          api.pathTo('/pages/user/user','rela');
        },800)   
      }else{
        api.showToast(res.msg,'none',1000);
      }; 
      api.buttonCanClick(self,true);  
    };
    api.register(postData,callback);
  },



  submit(){
    const self = this;
    api.buttonCanClick(self);
    var phone = self.data.sForm.phone;
    const pass = api.checkComplete(self.data.sForm);
    if(pass){
        if(phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)){
          api.showToast('手机格式错误','none')
        }else{
          self.register();       
        }
    }else{
      api.showToast('请补全信息','none');
    };
  },
  
})

  