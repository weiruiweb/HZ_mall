import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
   data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const self = this;
    
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

})

  