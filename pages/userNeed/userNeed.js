import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
Page({
  data: {
    num:0,
    mainData:[],
    isLoadAll:false,
    isFirstLoadAllStandard:['getMainData'],
    buttonCanClick:false,
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:2, 
    }
  }, 



  onLoad(options){
    const self = this;
    wx.showLoading();
    self.setData({
      web_num:self.data.num
    });
    wx.removeStorageSync('checkLoadAll');
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getMainData();
  },


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.paginate = self.data.paginate;
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.user_no = wx.getStorageSync('info').user_no;
    postData.searchItem.type = 2;
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.order = {
      create_time:'normal'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
  
          self.data.mainData.push.apply(self.data.mainData,res.info.data)

      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      api.buttonCanClick(self,true)
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.messageGet(postData,callback);   
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

  menuClick(e){
    const self = this;
    api.buttonCanClick(self);
    self.setData({
      web_num:e.currentTarget.dataset.num
    });
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num)
  },

  changeSearch(num){
    const self = this;
    this.setData({
      num: num
    });
    self.data.searchItem = {};
    if(num==0){
      
    }else if(num==1){
      self.data.searchItem.behavior = ['in',[1]]
    }else if(num==2){
      self.data.searchItem.behavior = ['in',[2]]
    }else if(num==3){
      self.data.searchItem.behavior = ['in',[3]]
    }
    self.getMainData(true);
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


})