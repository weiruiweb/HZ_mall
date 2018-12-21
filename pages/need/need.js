import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();


Page({
  data: {
    
    mainData:[],
  
    isFirstLoadAllStandard:['getMainData'],
    sForm:{
      item:''
    },
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:2, 
      behavior:1
    }
  }, 



  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.getMainData();
  },


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.paginate = self.data.paginate;
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem)
    postData.order = {
      create_time:'normal'
    };
    postData.getAfter = {
      userData:{
        tableName:'user',
        searchItem:{
          status:1
        },
        middleKey:'user_no',
        key:'user_no',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
  
          self.data.mainData.push.apply(self.data.mainData,res.info.data)

      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
     
      self.setData({
        web_mainData:self.data.mainData,
      });
    };
    api.messageGet(postData,callback);   
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    console.log(self.data.sForm);
    self.setData({
      web_sForm:self.data.sForm
    });
    if(self.data.sForm.item){ 
      console.log(666) 
      self.data.searchItem.keywords =  ['LIKE',['%'+self.data.sForm.item+'%']],
      self.getMainData(true,self.data.sForm.item);
      
    }else{
      delete self.data.searchItem.keywords;
      console.log(666) 
      self.getMainData()
    }
  },



  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getLabelData();
    };
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