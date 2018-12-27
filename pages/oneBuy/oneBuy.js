import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


Page({
  data: {
    mainData:[],
    isFirstLoadAllStandard:['getMainData'],
  },
  //事件处理函数
 
  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.getMainData()
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
       type:1,
        thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.order = {
      listorder:'desc'
    };
    postData.getBefore = {
      product:{
        tableName:'Label',
        searchItem:{
          title:['=',['一元购']],
        },
        middleKey:'category_id',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.productGet(postData,callback);
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },
})

  