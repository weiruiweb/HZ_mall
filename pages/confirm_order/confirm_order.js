import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
    mainData:[],
    addressData:[],
    userInfoData:[],
    idData:[],
    orderData:[],
    couponData:[],
    couponId:[],
    searchItem:{
      isdefault:1
    },
    submitData:{
      passage1:''
    },
    searchItemTwo:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      user_no:wx.getStorageSync('info').user_no
    },
    isLoadAll:false,
    buttonCanClick:false,
    order_id:'',
    isFirstLoadAllStandard:['getOrderData','getMainData'],
    pay:{
      coupon:[]
    }
    
  },

  onLoad(options) {

    const self = this;
    if(options.order_id){
      self.data.order_id = options.order_id;
    }else{
      api.showToast('数据传递有误','error');
    };
    wx.showLoading();
    wx.removeStorageSync('checkLoadAll');
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    getApp().globalData.address_id = '';
    self.getOrderData();
    self.getMainData();

  },

 

  onShow(){
    const self = this;
    self.data.searchItem = {};
    if(getApp().globalData.address_id){
      self.data.searchItem.id = getApp().globalData.address_id;
    }else{
      self.data.searchItem.isdefault = 1;
    };
    self.getAddressData();
  },



  getOrderData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    }
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      user_no:wx.getStorageSync('info').user_no,
      type:['in',[3,4]],
    };
    postData.order = {
      create_time:'desc'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.orderData.push.apply(self.data.orderData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getOrderData',self);
      self.setData({
        buttonClicked:false,
      });
      console.log(self.data.orderData);
      self.setData({
        web_orderData:self.data.orderData,
      });     
    };
    api.orderGet(postData,callback);
  },  



  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      id:self.data.order_id
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });     
      self.countPrice();
    };
    api.orderGet(postData,callback);
  },

  getAddressData(){
    const self = this;
    const postData = {}
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {isdefault:1};
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.addressData = res.info.data[0]; 
      };
      console.log('getAddressData',self.data.addressData)
      self.setData({
        web_addressData:self.data.addressData,
      });
    };
    api.addressGet(postData,callback);
  },


 

  addOrder(e){
    const self = this;
    api.buttonCanClick(self);
    if(!self.data.order_id){
      self.data.buttonClicked = true;
      const postData = {
        tokenFuncName : 'getProjectToken',
        sku:self.data.mainData,
        pay:{
          wxPay:self.data.totalPrice.toFixed(2),
        },
        type:1
      };
      console.log('addOrder',self.data.addressData)

      if(self.data.addressData){
        postData.snap_address = self.data.addressData;
      };

      const callback = (res)=>{
        if(res&&res.solely_code==100000){
           
          self.data.order_id = res.info.id
          self.pay(self.data.order_id);        
        }; 
            
      };
      api.addOrder(postData,callback);
    }else{
      self.pay(self.data.order_id)
    };   
    let formId = e.detail.formId;
    // dealFormIds(formId, url);
    console.log(999,formId)
  },



  pay(order_id){
    const self = this;
    api.buttonCanClick(self) 
    var order_id = self.data.order_id;
    const postData = self.data.pay;
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      id:self.data.order_id
    };
    
    const callback = (res)=>{
      wx.hideLoading();
      if(res.solely_code==100000){
         const payCallback=(payData)=>{
          if(payData==1){
            api.showToast('支付失败','none')  
          };
          api.buttonCanClick(self,true)    
        };
        api.realPay(res.info,payCallback);   
      }else{
        api.showToast('支付失败','none');
        api.buttonCanClick(self,true) 
      };
    };
    api.pay(postData,callback);
  },

  useCoupon(e){

    const self = this;
    var id = api.getDataSet(e,'id');
    var count = api.getDataSet(e,'count');
    var findItem = api.findItemInArray(self.data.pay.coupon,'id',id);
    if(findItem){
      self.data.pay.coupon.splice(findItem[0],1);
    }else{
      self.data.pay.coupon.push({
        id:id,
        price:count
      });
    };
    self.setData({
      web_pay:self.data.pay
    });
    console.log('self.data.pay',self.data.pay); 
    self.countPrice();
    

  },




  
  countPrice(){

    const self = this;
    var totalPrice = 0;
    var couponPrice = 0;
    var productsArray = self.data.mainData.products;
    self.data.price = self.data.mainData.price;
    if(self.data.pay.coupon.length>0){
      var couponPrice = 0;
      for (var i = 0; i < self.data.pay.coupon.length; i++) {
        couponPrice += self.data.pay.coupon[i].price
      };
    };
    self.data.pay.wxPay = self.data.price - couponPrice;
    console.log('countPrice',self.data.pay)
    self.setData({
      web_couponPrice:couponPrice.toFixed(2),
      web_price:self.data.price,
      web_pay:self.data.pay
    });

  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    });  
  },
})


  