import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
   data: {
    num:0,
    mainData:[],
    isLoadAll:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const self = this;
    self.setData({
      web_num:self.data.num
    });
    self.getMainData();
    self.getStoreData();
  },

  getMainData(){
    const self = this;
    self.data.mainData = api.jsonToArray(wx.getStorageSync('collectData'),'unshift');
    self.setData({
      web_mainData:self.data.mainData,
    });
    console.log(self.data.mainData)
  },

  getStoreData(){
    const self = this;
    self.data.storeData = api.jsonToArray(wx.getStorageSync('collectStore'),'unshift');
    self.setData({
      web_storeData:self.data.storeData,
    });
    console.log(self.data.storeData)
  },

  menuClick(e) {
    const self = this;
    const num = e.currentTarget.dataset.num;
    self.setData({
      web_num: num
    });
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  cancel(e){
    const self = this;
    console.log(api.getDataSet(e,'id'))
    api.deleteFootOne(api.getDataSet(e,'id'),'collectData');
    self.getMainData();
  },


})

  