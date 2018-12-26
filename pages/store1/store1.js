import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {
    productData:[],
    couponData:[],
    isFirstLoadAllStandard:['getMainData','getCouponData'],
    userData:[],
    searchItem:{},
    isShow:false,
    order:{
      create_time:'asc'
    },
    labelData:[]
  },

  
  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.data.user_no = options.user_no;
    var collectStore = api.getStorageArray('collectStore');
    self.data.isInCollectData = api.findItemInArray(collectStore,'user_no',self.data.user_no);
    console.log(api.findItemInArray(collectStore,'user_no',self.data.user_no))
    self.setData({
      web_order:self.data.order,
      web_isInCollectData:self.data.isInCollectData,    
    });
    self.getLabelData();
    self.getUserData();
  },

  onShow(){
    const self = this;
    
  },

 

  collect(){
    const self = this;  
    const id = self.data.userData.id;
    if(getApp().globalData.buttonClick){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    if(self.data.isInCollectData){
      api.delStorageArray('collectStore',self.data.userData,'id'); 
    }else{
      api.setStorageArray('collectStore',self.data.userData,'id',999);
    };
    var collectStore = api.getStorageArray('collectStore');
    self.data.isInCollectData = api.findItemInArray(collectStore,'id',id);
    self.setData({
      web_isInCollectData:self.data.isInCollectData,
    }); 
  },

  getUserData(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = {
      user_no:self.data.user_no,
      user_type:1
    };
    postData.getAfter = {
      product:{
        tableName:'Product',
        middleKey:'user_no',
        key:'user_no',
        condition:'=',
        searchItem:{      
          status:['in',[1]],
          type:1
        },
        compute:{
          saleNum:
          [
            'sum',
            'sale_count',
            {status:1}
          ],
          countNum:
          [
            'count',
            'count',
            {status:1}
          ]
        }
      }
    };
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
      self.getCouponData();
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
    };
    api.userGet(postData,callback);   
  },


  getCouponData(isNew){
    const self = this;
    if(isNew){
      self.data.couponData = []
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = api.cloneForm(getApp().globalData.thirdapp_id);
    postData.searchItem.user_no = self.data.user_no;
    postData.searchItem.type=['in',[3,4]];
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.couponData.push.apply(self.data.couponData,res.info.data);
      }else{
        self.data.isLoadAll = true;
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getCouponData',self);
      self.setData({
        web_couponData:self.data.couponData,
      });  
      self.getProductData()
    };
    api.productGet(postData,callback);
  },


  getProductData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = api.cloneForm(getApp().globalData.thirdapp_id);
    postData.searchItem.user_no = self.data.user_no;
    postData.order = api.cloneForm(self.data.order);
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.productData.push.apply(self.data.productData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.buttonCanClick(self,true)
      self.setData({
        web_productData:self.data.productData,
      });  
    };
    api.skuGet(postData,callback);
  },


  getLabelData(){
    const self =this;
    const postData={};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.solely_thirdapp_id
    };
    postData.getBefore = {
      label:{
        tableName:'Label',
        searchItem:{
          title:['=',['商品分类']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in',
      },
    }
    const callback =(res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data)
      };
      console.log('self.data.labelData',self.data.labelData)
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getPositonData',self);
      self.setData({

        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);
  },

  lebelChange(e) {
    const self = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(self.data.labelData[e.detail.value].id)
    self.data.searchItem.category_id = self.data.labelData[e.detail.value].id;

    self.setData({
      web_index:e.detail.value,
    })
    self.data.productData = [];
    self.getProductData(true)
  },


  addCouponOrder(e){
    const self = this;
    api.buttonCanClick(self);
    var id = api.getDataSet(e,'id');
    var type = api.getDataSet(e,'type');
    var duration = api.getDataSet(e,'duration');
    var discount = api.getDataSet(e,'discount');
    var standard = api.getDataSet(e,'standard');
    var user_no = api.getDataSet(e,'user_no');
    console.log('duration',duration);
    var limit = api.getDataSet(e,'limit');
    const postData = {
      tokenFuncName:'getProjectToken',
      orderList:[
        {
          product:[
            {
              id:id,
              count:1
            }
          ]
        }
      ],
      pay:{score:0},
      type:type,
      data:{
        end_time:new Date().getTime() + duration,
        limit:limit,
        discount:discount,
        standard:standard,
        passage1:user_no
      }
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        api.showToast('领取成功！','none',1000,function(){
          self.getCouponData(true)
        });   
      }else{
        api.showToast(res.msg,'none')
      }
      api.buttonCanClick(self,true);
    };
    api.addOrder(postData,callback);

  },

  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self);
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeOrder(e){
    const self = this;
    api.buttonCanClick(self);
    const key = api.getDataSet(e,'key');
    self.data.order = {
      [key]:self.data.order[key]=='asc'?'desc':'asc'
    };
    self.setData({
      web_order:self.data.order
    });
    self.data.productData = [];
    self.getProductData(true);
  },


  changeSearch(num){
    const self = this;
    this.setData({
      web_num: num
    });
    if(num==0){
      
    }else if(num==1){
      self.data.searchItem.category_id = ['in',[num]]; 
    }
    self.getMainData(true);
  },

  phoneCall() {
    const self = this;
    if(!self.data.userData.info.phone){
      api.showToast('商家未设置客服','none');
      return
    };
    wx.makePhoneCall({
      phoneNumber: self.data.userData.info.phone,
    })
  },

  couponShow(){
    const self = this;
    self.data.isShow = !self.data.isShow;
    self.setData({
      isShow:self.data.isShow
    })
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getProductData();
    };
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },
})
