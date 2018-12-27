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
    isFirstLoadAllStandard:['getLabelData','getMainData'],

  },


  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.getLabelData();
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
    postData.searchItem.type=1;
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
      api.buttonCanClick(self,true);
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
      self.getMainData();
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
      self.data.searchItem.category_id = num; 
    }
    self.getMainData(true);
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

})