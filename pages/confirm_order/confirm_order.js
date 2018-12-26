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
    allCouponData:[],
    couponId:[],
    searchItem:{
      isdefault:1
    },
    submitData:{
      passage1:''
    },
    searchItemTwo:{
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
      user_no:wx.getStorageSync('info').user_no,
      type:['in',[3,4]]
    },
   
    order_id:'',
    isFirstLoadAllStandard:['getMainData'],
    pay:{
      coupon:[]
    }
    
  },

 

 onLoad(options) {

    const self = this;
    api.commonInit(self);
    if(options.order_id){
      self.data.order_id = options.order_id;
      self.data.order_array = options.order_id.split(',');
    }else{
      api.showToast('数据传递有误','error');
    };
    getApp().globalData.address_id = '';
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
    for (var i = 0; i < self.data.mainData.length; i++) {
      self.data.idData.push(self.data.mainData[i].id);
    };
    console.log(self.data.idData)
    self.getAddressData();
    

  },

  onUnload(){
    const self = this;
    wx.removeStorageSync('payPro');
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
      id:['in',self.data.order_array]
    };
    postData.getAfter = {
      child:{
        tableName:'Order',
        key:'parentid',
        middleKey:'id',
        condition:'=',
        searchItem:{
          status:1
        },
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.parentMainData = res.info.data[0];
        if(res.info.data[0].child.length>0){
          self.data.mainData = res.info.data[0].child;
        }else{
          self.data.mainData = res.info.data;
        };
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
        web_parentMainData:self.data.parentMainData,
      });     
      self.countPrice();
      console.log('getMainData',self.data.mainData)
      self.getCouponData()
    };
    api.orderGet(postData,callback);

  }, 



  getCouponData(){
    const self = this;
    
    const postData = {};
    
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItemTwo);
    var couponUsernoArray = [];
    var couponUsernoObj = {};
    for (var i = 0; i < self.data.mainData.length; i++) {
      couponUsernoArray.push(self.data.mainData[i].products[0].snap_product.user_no);
      couponUsernoObj[self.data.mainData[i].products[0].snap_product.user_no] = i;
      self.data.mainData[i].coupon = [];
    };
    console.log('self.data.mainData',self.data.mainData)
    console.log('couponUsernoArray',couponUsernoArray)
    if(couponUsernoArray.length>0){
      postData.searchItem.passage1 = ['in',couponUsernoArray]
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.allCouponData = res.info.data;
        self.data.couponData = [];
        for (var i = 0; i < self.data.allCouponData.length; i++) {
          if(self.data.mainData[couponUsernoObj[self.data.allCouponData[i].passage1]]){
            self.data.mainData[couponUsernoObj[self.data.allCouponData[i].passage1]].coupon.push(self.data.allCouponData[i]);
          }else{
            self.data.couponData.push(self.data.allCouponData[i])
          };
        };
      }else{
        self.data.isLoadAll = true;
      };
      console.log('getMainData',self.data.mainData)
      self.setData({
        web_couponData:self.data.couponData,
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





  pay(order_id){

    const self = this;
    const postData = self.data.pay;
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = {
      id:self.data.order_id
    };
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info){
          const payCallback=(payData)=>{
            if(payData==1){
              const cc_callback=()=>{
                api.pathTo('/pages/userOrder/userOrder','redi');
              };
              api.showToast('支付成功','none',1000,cc_callback);
            };   
          };
          api.realPay(res.info,payCallback); 
        }else{
          api.showToast('支付成功','none',1000,function(){
            api.pathTo('/pages/userOrder/userOrder','redi');
          }); 
        };
      }else{
        api.showToast(res.msg,'none');
      };
      api.buttonCanClick(self,true);

    };
    api.pay(postData,callback);

  },

 useCoupon(e){
    const self = this;

    var id = api.getDataSet(e,'id');
    var mainIndex = api.getDataSet(e,'mainIndex');
    var findCoupon = api.findItemInArray(self.data.allCouponData,'id',id);
    var findItem = api.findItemInArray(self.data.pay.coupon,'id',id);
    if(mainIndex){
      var order = self.data.mainData[mainIndex];
    }else{
      var order = self.data.parentMainData;
    };
    console.log('findCoupon',findCoupon)
    
    if(findItem){
      self.data.pay.coupon.splice(findItem[0],1);
    }else{
      var res = self.checkCoupon(order,findCoupon[1])
      if(!res) return;
        if(findCoupon.type==3){
          var couponPrice = findCoupon.discount;
        }else if(findCoupon.type==4){
          var couponPrice = findCoupon.discount*self.data.price;
        };
      if(parseFloat(couponPrice)+parseFloat(self.data.couponTotalPrice)>parseFloat(self.data.price)){
        couponPrice = parseFloat(self.data.price).toFixed(2) - parseFloat(self.data.couponTotalPrice).toFixed(2);
      };
      self.data.pay.coupon.push({
        id:id,
        price:couponPrice,
        standard_id:order.id
      });
    };
    self.countPrice();
  },

  checkCoupon(order,coupon){
    const self = this;
    console.log('coupon',coupon)
    var findSameCoupon = api.findItemsInArray(self.data.pay.coupon,'product_id',coupon.products[0].snap_product.id);
    if((order.price-self.data.couponTotalPrice)<coupon.standard){
      api.showToast('金额不达标','error');
      return false;
    };
    if(findCoupon.limit>0&&findSameCoupon&&findSameCoupon.length>=coupon.limit){
      api.showToast('叠加使用超限','error');
      return false;
    };
    return true;
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

  countPrice(){

    const self = this;
    var totalPrice = 0;
    var couponPrice = 0;
    var productsArray = self.data.mainData.products;
    self.data.couponTotalPrice = api.addItemInArray(self.data.pay.coupon,'price');
    self.data.price = api.addItemInArray(self.data.mainData,'price');
    console.log('self.data.price',self.data.price)
    var wxPay = self.data.price - self.data.couponTotalPrice  ;
    if(wxPay>0){
      self.data.pay.wxPay = {
        price:wxPay.toFixed(2),
      };
    }else{
      delete self.data.pay.wxPay;
    };
    console.log('countPrice-wxPay',wxPay);
    console.log('countPrice-price',self.data.price);
    console.log('countPrice',self.data.pay);
    self.setData({
      web_couponPrice:parseFloat(self.data.couponTotalPrice).toFixed(2),
      web_price:parseFloat(self.data.price).toFixed(2),
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


  