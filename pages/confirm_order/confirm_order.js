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
    sForm:{
      score:0,
    },
    scoreForm:{

    },
    searchItemTwo:{
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
      user_no:wx.getStorageSync('info').user_no,
      type:['in',[3,4]]
    },
   
    order_id:'',
    isFirstLoadAllStandard:['getMainData','getUserData'],
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
      api.showToast('数据传递有误','none');
    };
    if(options.user_no){
      self.data.user_no = options.user_no
    };
    getApp().globalData.address_id = '';
    self.getMainData();
    self.getUserData()
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
    var couponUsernoArray = ['U910872296194660'];
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
    postData.payAfter = [];
    if(self.data.user_no){
      postData.payAfter.push( 
        {
          flowLog:{
            tableName:'FlowLog',
            FuncName:'add',
            data:{
              type:2,
              count:10,
              user_no:self.data.user_no,
              trade_info:'分享商品奖励',
            }
          }
        }
      )
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

  getUserData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.userData = res.info.data[0]; 
        }
        self.setData({
          web_userData:self.data.userData,
        });  
      }else{
        api.showToast('网络故障','none')
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getUserData',self);
    };
    api.userInfoGet(postData,callback);   
  }, 

  useCoupon(e){
    const self = this;

    var id = api.getDataSet(e,'id');
    var mainIndex = api.getDataSet(e,'index');
    console.log('mainIndex',mainIndex)
    var findCoupon = api.findItemInArray(self.data.allCouponData,'id',id);
    if(findCoupon){
      findCoupon = findCoupon[1];
    };
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
      var res = self.checkCoupon(order,findCoupon)
      if(!res) return;
        if(findCoupon.type==3){
          var couponPrice = findCoupon.discount;
        }else if(findCoupon.type==4){
          var couponPrice = findCoupon.discount*self.data.price;
        };
      if(parseFloat(couponPrice)+parseFloat(self.data.couponTotalPrice)>parseFloat(self.data.price)){
        couponPrice = parseFloat(self.data.price).toFixed(2) - parseFloat(self.data.couponTotalPrice).toFixed(2);
      };
      console.log('couponPrice',findCoupon.discount)
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
      api.showToast('金额不达标','none');
      return false;
    };
    if(coupon.limit>0&&findSameCoupon&&findSameCoupon.length>=coupon.limit){
      api.showToast('叠加使用超限','none');
      return false;
    };
    return true;
  },

  inputBind(e){
    const self = this;
    
    console.log('inputBind',e);
	
    if(api.getDataSet(e,"key")=='score'){
      var testScore = api.getDataSet(e,"score");
      var orderitemid = api.getDataSet(e,"orderitemid");
 	

      console.log('testScore',testScore);
      console.log('orderitemid',orderitemid);
      if(parseFloat(e.detail.value)>0){
      	self.data.scoreForm[orderitemid] = e.detail.value;
      }else{
      	self.data.scoreForm[orderitemid] = 0;
      };
      
      self.data.scoreForm.score = 0;
      console.log('self.data.scoreForm',self.data.scoreForm);
      self.data.sForm.score = 0;
      for(var key in self.data.scoreForm){
        self.data.sForm.score += parseFloat(self.data.scoreForm[key]);
      };
      console.log('inputBind',self.data.sForm.score);
      
      if(self.data.sForm.score>self.data.userData.score||!testScore||(testScore&&self.data.sForm.score>testScore)){
        api.showToast('积分不符合规则','error');
        self.data.sForm.score = 0;
        self.setData({
          web_sForm:self.data.sForm,
        }); 
        return;
      };
    };
    console.log('test',self.data.sForm);
    self.countPrice(); 

  },



  countPrice(){

    const self = this;
    var totalPrice = 0;
    var couponPrice = 0;
    self.data.couponTotalPrice = api.addItemInArray(self.data.pay.coupon,'price');
    self.data.price = api.addItemInArray(self.data.mainData,'price');
    console.log('self.data.price',self.data.price)
    var wxPay = self.data.price - self.data.couponTotalPrice  ;
    if(self.data.sForm.score>=0){
      self.data.pay.score = self.data.sForm.score
    }else{
    	self.data.pay.score = 0
    };
    
    var wxPay = self.data.price - self.data.couponTotalPrice - parseInt(self.data.sForm.score);
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
      web_pay:self.data.pay,
      web_sForm:self.data.sForm,
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


  