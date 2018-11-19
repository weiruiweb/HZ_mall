import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();

Page({
  data: {
  tabCurrent:0,
  isShow:false,
  chooseType:0,
  chooseType1:0,
  is_show1:false,
  },
  
  onLoad: function () {
   this.setData({
      fonts:app.globalData.font
    })
  },
  mask:function(e){
   this.setData({
    is_show:false,
    is_show1:false,
   })
 },
 submit(){
  wx.navigateTo({
    url:'/pages/confirm_order/confirm_order'
  })
 },
 group:function(e){
  this.setData({
    is_show1:true,
   })
 },
  goBuy:function(){
    var isShow = !this.data.isShow;
    this.setData({
      isShow:isShow
    })
  },
  close:function(){
    this.setData({
      isShow:false
    })
  },
  chooseType:function(e){
    var chooseType = e.currentTarget.dataset.type;
    this.setData({
      chooseType:chooseType
    })
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
