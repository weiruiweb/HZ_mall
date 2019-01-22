import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    isFirstLoadAllStandard:['getMainData','getUserData'],
    searchItem:{
      type:2,
      status:['in',[0,1]]
    },
    mainData:[]
  },

  onLoad(options){
    const self = this;
    api.commonInit(self);
    if(options.type){
      self.data.type = options.type
    };
    self.getMainData();
    self.getUserData()
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    if(self.data.type=='merchant'){
      postData.tokenFuncName = 'getProjectMerchantToken';
    }else{
      postData.tokenFuncName = 'getProjectToken';
    }
    postData.searchItem = api.cloneForm(self.data.searchItem);
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.mainData.push.apply(self.data.mainData,res.info.data);
        }else{
          self.data.isLoadAll = true;
          api.showToast('没有更多了','none');
        };
        self.setData({
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      };
      api.buttonCanClick(self,true)
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      console.log('getMainData',self.data.mainData)
    };
    api.flowLogGet(postData,callback);
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

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },



  intoPath(e){
    const self = this;
    if(self.data.type){
      wx.navigateTo({
        url:"/pages/userWithdraw/userWithdraw?type="+self.data.type,
      })
    }else{
      wx.navigateTo({
        url:"/pages/userWithdraw/userWithdraw"
      })
    }
  },

  intoPathRedi(e){
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

  