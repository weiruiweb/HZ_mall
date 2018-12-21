import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {



    mainData:[],
    products:[],
    totalPrice:0,
    isFirstLoadAllStandard:['getMainData']
  },
  
  onLoad() {
    const self = this;
    api.commonInit(self);
    console.log(this.data.windowHeight) 
  },



  onShow() {
    const self = this;
    self.data.mainData = api.getStorageArray('cartData');
    console.log('onShow',self.data.mainData);
    self.checkChooseAll();
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    self.countTotalPrice();

  },

  checkChooseAll(){
    const self = this;
    var isChooseAll = true;
    for (var i = 0; i < self.data.mainData.length; i++) {
      if(!self.data.mainData[i].isSelect){
        isChooseAll = false;
      };
    };
    self.data.isChooseAll = isChooseAll;
    self.setData({
      web_isChooseAll:self.data.isChooseAll
    });
  },

  chooseAll(){
    const self = this;
    self.data.isChooseAll = !self.data.isChooseAll;
    for (var i = 0; i < self.data.mainData.length; i++) {
      self.data.mainData[i].isSelect = self.data.isChooseAll;
      api.setStorageArray('cartData',self.data.mainData[i],'id',999);
    };
    self.setData({
      web_isChooseAll:self.data.isChooseAll,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },

  delete(){
    const self = this;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        api.delStorageArray('cartData',self.data.mainData[i],'id');
      }
    };
    self.data.mainData = api.getStorageArray('cartData');
    self.checkChooseAll();
    self.setData({
      web_mainData:self.data.mainData
    });
  },

  choose(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(self.data.mainData[index].isSelect){
      self.data.mainData[index].isSelect = false;
    }else{
      self.data.mainData[index].isSelect = true;
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.checkChooseAll();
    self.countTotalPrice();
  },

  countTotalPrice(){
    const self = this;
    var totalPrice = 0;
    var cartTotalCounts = 0;
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        totalPrice += self.data.mainData[i].price*self.data.mainData[i].count;
        cartTotalCounts += self.data.mainData[i].count;
      };
    };
    self.setData({
      web_cartTotalCounts:cartTotalCounts,
      web_totalPrice:totalPrice.toFixed(2),
    })
  },

  formIdAdd(e){
    api.WxFormIdAdd(e.detail.formId,(new Date()).getTime()/1000+7*86400);  
  },

  pay(e){
    const self = this;
    api.buttonCanClick(self);
    let formId = e.detail.formId;
    console.log(999,formId)
    const skuDatas = [];
    for(var i=0;i<self.data.mainData.length;i++){
      if(self.data.mainData[i].isSelect){
        skuDatas.push({
          id:self.data.mainData[i].id,
          count:self.data.mainData[i].count
        });
      }
    };
    const postData = {
      tokenFuncName:'getProjectToken',
    };
    const callback = (res)=>{
      console.log(res);
      if(res.info.data.length>0&&res.info.data[0].phone){
       
        const c_postData = {
          tokenFuncName:'getProjectToken',
          sku:skuDatas,
          type:1

        };
        if(c_postData.sku.length==0){
          api.showToast('未选择商品','none');
          return;
        };
        const c_callback = (res)=>{
          api.buttonCanClick(self,true);
          if(res&&res.solely_code==100000){
            api.pathTo('/pages/confirm_order/confirm_order?order_id='+res.info.id,'nav');        
          }else{
            api.showToast(res.msg,'none');
          };
        };
        api.addOrder(c_postData,c_callback);
      }else{
        api.showToast('请完善信息','none');
        api.buttonCanClick(self,true);
        api.pathTo('/pages/userInfo/userInfo','nav');
      };
    };
    api.userInfoGet(postData,callback)
  },


  counter(e){
    const self = this;
    const index = api.getDataSet(e,'index');
    if(api.getDataSet(e,'type')=='+'){  
       self.data.mainData[index].count++;
    }else{
      if(self.data.mainData[index].count > 1){
        self.data.mainData[index].count--;
      }
    };
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  },


  bindManual(e) {
    const self = this;
    const index = api.getDataSet(e,'index');
    var num = e.detail.value;
    if(!num||num<1){
      num = 1;
    };
    self.data.mainData[index].count = num;
    api.setStorageArray('cartData',self.data.mainData[index],'id',999);
    self.setData({
      num: num,
      web_mainData:self.data.mainData
    });
    self.countTotalPrice();
  }, 



  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },


   
  
})

  

  