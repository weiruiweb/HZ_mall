import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();



Page({
  data: {
   currentId:0,
  }, 
  onLoad(options){
    const self = this;
  },
  choose(e){
    const self = this;
    self.setData({
      currentId:e.currentTarget.dataset.id
    })
    console.log(self.data.currentId)
  },
 
})