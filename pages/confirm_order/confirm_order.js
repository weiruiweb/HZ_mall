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
      self.data.idData.push(self.data.mainData[i].id)
    };
    console.log(self.data.idData)
    self.getAddressData();
    self.getCouponData(true)

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
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data;
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });     
      self.countPrice();
    };
    api.orderGet(postData,callback);

  }, 



  getCouponData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName = 'getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItemTwo)
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.couponData.push.apply(self.data.couponData,res.info.data);
      }else{
        self.data.isLoadAll = true;
      }
      self.setData({
        web_couponData:self.data.couponData,
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
    var findCoupon = api.findItemInArray(self.data.couponData,'id',id);
    var findItem = api.findItemInArray(self.data.pay.coupon,'id',id);
    console.log('findCoupon',findCoupon)
    if(findCoupon){
      findCoupon = findCoupon[1];
      var findSameCoupon = api.findItemsInArray(self.data.pay.coupon,'product_id',findCoupon.products[0].snap_product.id);
    }else{
      api.showToast('优惠券错误','error');
      return;
    };
    if(findItem){
      self.data.pay.coupon.splice(findItem[0],1);
    }else{
      if((self.data.price-self.data.couponTotalPrice)<findCoupon.standard){
        api.showToast('金额不达标','error');
        return;
      };
      if(findCoupon.limit>0&&findSameCoupon.length>=findCoupon.limit){
        api.showToast('叠加使用超限','error');
        return;
      };
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
        product_id:findCoupon.products[0].snap_product.id
      });
    };
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


  