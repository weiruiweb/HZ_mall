import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    idArray:[],
    mainData:[],
    labelData:[],
    searchItem:{},
    num:0,
    isFirstLoadAllStandard:['getLabelData','getMainData'],

  },


  onLoad(options){
    const self = this;
    api.commonInit(self);
    if(options.item){
      self.data.searchItem.title = ['LIKE',['%'+options.item+'%']]
    };
    if(options.num){
      self.data.num = options.num,
      self.data.searchItem.category_id = self.data.num
    };
    self.getLabelData();
    self.getMainData();
    self.setData({
      web_num:self.data.num
    })
  },

  onPullDownRefresh(){
    const self = this;
    wx.showNavigationBarLoading(); 
    delete self.data.searchItem.title;
    self.getMainData(true);

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
    postData.order = {
      listorder:'desc'
    };
    postData.getAfter={
      sku:{
        tableName:'Sku',
        middleKey:'product_no',
        searchItem:{
          status:1
        },
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
          self.data.mainData.push.apply(self.data.mainData,res.info.data[i].sku);
        } 
        
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({

        web_mainData:self.data.mainData,
      });   
      setTimeout(function(){
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      },300);
      api.buttonCanClick(self,true);
      console.log('self.data.buttonCanClick',self.data.buttonCanClick)
    };
    api.productGet(postData,callback);
  },

  getLabelData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getBefore = {
      label:{
        tableName:'Label',
        searchItem:{
          title:['=',['商品分类']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data);
      }else{
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getLabelData',self);
      console.log(self.data.labelData)
      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },

  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self);
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },


  changeSearch(num){
    const self = this;
    this.setData({
      web_num: num
    });
    if(num==0){
      delete self.data.searchItem.category_id 
    }else{
      self.data.searchItem.category_id = ['in',[num]]; 
    }
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


  intoPathRedi(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },

})