import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
   num:0,
   mainData:[],
   isFirstLoadAllStandard:['getMainData'],
   searchItem:{
  },
    buttonCanClick:false
  },


  onLoad(options){
    const self = this;
    wx.showLoading();
    wx.removeStorageSync('checkLoadAll');
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getMainData()
  },


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName='getProjectMerchantToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.searchItem.passage1 = wx.getStorageSync('threeInfo').user_no;
    postData.searchItem.type = ['in',[1,2]];
    postData.searchItem.status = ['in',[0,1]]
    postData.order = {
      create_time:'desc'
    }
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
    api.orderGet(postData,callback);
  },

/*
  deleteOrder(e){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      api.dealRes(res);
      self.getMainData(true);
    };
    api.orderDelete(postData,callback);
  },*/







  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self);
    self.setData({
      buttonClicked:true
    });
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeSearch(num){
    const self = this;
    this.setData({
      num: num
    });
    self.data.searchItem = {}
    if(num=='0'){
      self.data.searchItem.pay_status = '0';
      self.data.searchItem.order_step = '0';
    }else if(num=='1'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.order_step = '0';
    }else if(num=='2'){
   
      self.data.searchItem.order_step = '2';
    }
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },

  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },


   intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 

})