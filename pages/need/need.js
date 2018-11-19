import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
Page({
  data: {
   num:0,
  },
  menuClick(e){
    const self = this;
    self.setData({
      num:e.currentTarget.dataset.num
    })
    console.log(self.data.num)
  },
  onLoad(options){
    const self = this;
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