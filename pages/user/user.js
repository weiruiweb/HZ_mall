import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {


    isFirstLoadAllStandard:['getMainData'],
    userData:[],

  },

  
  onLoad(options){
    const self = this;
    api.commonInit(self);
  },

  onShow(){
    const self = this;
    self.getUserInfoData();
    self.data.mainData = api.getStorageArray('collectData');
    self.data.storeData = api.getStorageArray('collectStore');
    console.log(self.data.mainData.length)
    self.setData({
      web_collectData:self.data.mainData.length+self.data.storeData.length
    })
  },

  getUserInfoData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.userData = res.info.data[0]; 
        }
        self.setData({
          web_userData:self.data.userData,
        });  
      }else{
        api.showToast('网络故障','none')
      } 
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    };
    api.userInfoGet(postData,callback);   
  },

 

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
})

  