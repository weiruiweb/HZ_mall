import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


Page({
  data: {
    todayCouponData:[],
    moreData:[],
    productData:[],
    sForm:{
      item:'' 
    },
    is_show:false,
    isFirstLoadAllStandard:['getProductData','getCouponData','getMoreData'],
  },
  //事件处理函数

  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.getProductData();
    self.getCouponData();
    self.getMoreData()
  },




  getProductData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['优惠折扣']],
        },
        middleKey:'category_id',
        key:'id',
        condition:'in'
      },
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:{
          status:1
        }
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
          self.data.productData.push.apply(self.data.productData,res.info.data[i].sku);
        }
        
        if(self.data.productData.length>3){
          self.data.productData = self.data.productData.slice(0,3) 
        }
      }else{
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getProductData',self);

      self.setData({
        web_productData:self.data.productData,
      });
      
    };
    api.productGet(postData,callback);   
  },

  getMoreData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {};
    postData.searchItem.type =1;
    postData.searchItem.thirdapp_id = api.cloneForm(getApp().globalData.thirdapp_id);
    postData.order = {
      listorder:'desc'
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:{
          status:1
        }
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
          self.data.moreData.push.apply(self.data.moreData,res.info.data[i].sku);
        }      
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMoreData',self);
      self.setData({
        web_moreData:self.data.moreData,
      });  
      api.buttonCanClick(self,true);
    };
    api.productGet(postData,callback);
  },

  getCouponData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3,
      title:'现金券'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.couponData = res.info.data[0]
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getCouponData',self);
      self.setData({
        web_couponData:self.data.couponData,
      });
      self.checkToday()
      console.log(899,res.info.data[0])
    };
    api.productGet(postData,callback);
  },

  checkToday(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken',
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,

      product_id:self.data.couponData.id
    };
    postData.searchItem.create_time = ['between',[new Date(new Date().setHours(0, 0, 0, 0)) / 1000,new Date(new Date().setHours(0, 0, 0, 0)) / 1000 + 24 * 60 * 60-1]]
    const callback = (res)=>{
      if(res.solely_code==100000){
        self.data.todayCouponData = res.info.data
      };
      if(self.data.todayCouponData.length==0){
        self.setData({
          is_show:true
        })
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'checkToday',self);
      self.setData({
        web_todayCouponData:self.data.todayCouponData
      })
    }
    api.orderItemGet(postData,callback)
  },


  addCouponOrder(e){
    const self = this;
    api.buttonCanClick(self);
    if(self.data.todayCouponData.length>0){
      api.showToast('每个用户每天限领取一张','none')
      return;
    };
    const postData = {
      tokenFuncName:'getProjectToken',
      product:[
        {id:self.data.couponData.id,count:1}
      ],
      type:3,
      data:{
        passage1:self.data.couponData.id
      }
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        self.pay(res.info)
      }; 
      self.setData({
        is_show:false
      });
     
    };
    api.addOrder(postData,callback);
  },


  pay(order_id){
    const self = this;
    var order_id = self.data.order_id;
    const postData = {
      searchItem:{
        id:order_id,
      },
      
    };
    postData.tokenFuncName='getProjectToken';
    postData.payAfter=[{
      tableName:'FlowLog',
      FuncName:'add',
      data:{
        count:self.data.couponData.discount,
        trade_info:'领取现金券',
        user_no:wx.getStorageSync('info').user_no,
        type:3,
        thirdapp_id:getApp().globalData.thirdapp_id
      }
    }];
    const callback = (res)=>{
      wx.hideLoading();
      if(res.solely_code==100000){
         api.showToast('领取成功','none')   
      }else{
        api.showToast('领取失败','none')
      };
       api.buttonCanClick(self,true);   
    };
    api.pay(postData,callback);
  },

  submit(){
    const self = this;
    api.buttonCanClick(self);
    const callback = (user,res) =>{ 
      self.addCouponOrder(); 
    };
    api.getAuthSetting(callback);  
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMoreData();
    };
  },

  inputChange(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    self.setData({
      web_sForm:self.data.sForm,
    });  
    console.log(self.data.sForm)
  },



  mask:function(e){
    this.setData({
      is_show:false,
    })
  },
 
  close:function(e){
    this.setData({
      is_show:false,
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

  