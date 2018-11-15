import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();

const token = new Token();



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


})