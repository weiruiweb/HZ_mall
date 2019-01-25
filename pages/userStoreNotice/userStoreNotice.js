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
   api.commonInit(self);
    self.getMainData()
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id
    };
    postData.getBefore = {
      article:{
        tableName:'Label',
        searchItem:{
          title:['=',['开店规则']],
          thirdapp_id:['=',[getApp().globalData.thirdapp_id]],
        },
        middleKey:'menu_id',
        key:'id',
        condition:'in',
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData=res.info.data[0]
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      }    
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);    
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.articleGet(postData,callback);
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
    if(self.data.is_choose){
      api.pathTo(api.getDataSet(e,'path'),'nav'); 
    }else{
      api.showToast('请确认阅读并同意','none')
    }
    
  },



  

})


  