import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();

Page({
  data: {
   currentId:0,
  },

  tab(e){
    const self = this;
    self.setData({
      currentId:e.currentTarget.dataset.num
    })
    console.log(self.data.currentId)
  },
  onLoad(options){
    const self = this;
    
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