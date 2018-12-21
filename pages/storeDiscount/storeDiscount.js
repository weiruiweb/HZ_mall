

import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {

    mainData:[],
    labelData:[],
    searchItem:{},
    num:0,
    isFirstLoadAllStandard:['getMainData'],

  },


  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.getMainData();
    self.setData({
      web_num:self.data.num
    })
  },


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = api.cloneForm(getApp().globalData.thirdapp_id);
    postData.searchItem.user_no = wx.getStorageSync('threeInfo').user_no;
    postData.searchItem.type=['in',[3,4]];
    postData.order = {
      listorder:'desc'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
        for (var i = 0; i <  self.data.mainData.length; i++) {
           self.data.mainData[i].passage1 = self.data.mainData[i].passage1.split(',');
           console.log(self.data.mainData[i].passage1)
        };
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };

  
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.productGet(postData,callback);
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
    api.pathTo(api.getDataSet(e,'path'),'nav');
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

  