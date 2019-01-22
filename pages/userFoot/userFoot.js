import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
   data: {
    num:0,
    mainData:[],
    isFirstLoadAllStandard:['getMainData']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.getMainData();

  },

  getMainData(){
    const self = this;
    self.data.mainData = api.getStorageArray('footData');
    self.setData({
      web_mainData:self.data.mainData,
    });
    api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self)
    console.log(self.data.mainData)
  },


 




  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  cancel(e){
    const self = this;
    console.log(api.getDataSet(e,'id'))
    api.deleteFootOne(api.getDataSet(e,'id'),'footData');
    self.getMainData();
  },


})

  