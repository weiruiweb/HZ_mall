import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    num:0,
    mainData:[],
    searchItem:{
      
    },
    isFirstLoadAllStandard:['getMainData','getCouponData'],

  },
  
  onLoad() {
    const self = this;
    api.commonInit(self);
    self.getCouponData()
  },

  getCouponData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3,
      title:'现金券'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.couponData = res.info.data[0]
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getCouponData',self);
      self.setData({
        web_couponData:self.data.couponData,
      });
      self.getMainData()
      console.log(899,res.info.data[0])
    };
    api.productGet(postData,callback);
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    }
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.searchItem.type = ['in',[3,4]];
    postData.searchItem.user_no = wx.getStorageSync('info').user_no;
    postData.searchItem.passage1 = ['NOT IN',self.data.couponData.id]
    postData.getAfter = {
      merchant:{
        tableName:'UserInfo',
        middleKey:'passage1',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);

      self.setData({
        web_mainData:self.data.mainData,
      });     

    };
    api.orderGet(postData,callback);
  },



  choose(e){
    const self = this;
    var id = api.getDataSet(e,'id');
    wx.setStorageSync('couponId',id);
    wx.navigateBack({
      delta:1
    })
  },

  


  onReachBottom: function () {
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

})

  