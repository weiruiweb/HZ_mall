import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    mainData:[],
    isFirstLoadAllStandard:['getMainData'],
    is_choose:false,
  },

  onLoad(){
    const self = this;
    
  },

  onShow(){
    const self = this;
   
  },
  
  choose(e){
    const self = this;
    self.data.is_choose = !self.data.is_choose;
    self.setData({
      web_choose:self.data.is_choose
    })
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },



  

})


  