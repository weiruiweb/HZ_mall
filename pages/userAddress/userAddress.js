import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();

Page({
  data: {
   currentId:0,
  },
  onLoad(options){
    
  },
  choose(e){
   this.setData({
      currentId:e.currentTarget.dataset.id
    })
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

  