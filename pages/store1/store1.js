import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {
    productData:[],
    couponData:[],
    isFirstLoadAllStandard:['getMainData','getCouponData','getProductData'],
    userData:[],
    searchItem:{},
    isShow:false,
    buttonCanClick:false,
     sort:{
      sortby:'',
      sort:''
    },
  },

  
  onLoad(options){
    const self = this;
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.data.user_no = options.user_no;
    wx.showLoading();
    wx.removeStorageSync('checkLoadAll');
  
  },

  onShow(){
    const self = this;
    self.getUserData();
  },

  collect(){
    const self = this;  
    const id = self.data.userData.id;
    if(wx.getStorageSync('collectStore')&&wx.getStorageSync('collectStore')[id]){
      api.deleteFootOne(id,'collectStore');
      self.setData({
        url: '/images/collect.png',
      });
    }else{
      api.footOne(self.data.userData,'id',100,'collectStore');  
      self.setData({
        url: '/images/heart.png',
      });
    };
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
        tableName:'product',
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
        if(wx.getStorageSync('collectStore')[self.data.userData.id]){
          self.setData({
            url: '/images/heart.png',
          });
        }else{
          self.setData({
            url: '/images/collect.png',
          });
        };  
      }else{
        api.showToast('网络故障','none')
      } 
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
    postData.order = api.cloneForm(self.data.order);
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.couponData.push.apply(self.data.couponData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
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
    postData.searchItem.type=['in',1];
    postData.order = {
      listorder:'desc'
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.productData.push.apply(self.data.productData,res.info.data);
        for (var i = 0; i <  self.data.productData.length; i++) {
           self.data.productData[i].passage1 = self.data.productData[i].passage1.split(',');
           console.log(self.data.productData[i].passage1)
        };
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getProductData',self);
      self.setData({
        web_productData:self.data.productData,
      });  
    };
    api.productGet(postData,callback);
  },

  addCouponOrder(e){
    const self = this;
    api.buttonCanClick(self);
    var end_time = api.getDataSet(e,'end_time');
    var id = api.getDataSet(e,'id');
    const postData = {
      tokenFuncName:'getProjectToken',
      product:[
        {id:id,count:1}
      ],
    
      type:3,
      data:{
        passage1:self.data.user_no,
        end_time:end_time
      }
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        api.showToast('领取成功！','none',function(){
          self.getCouponData(true)
        });   
      }; 
      
    };
    api.addOrder(postData,callback);
  },

  menuClick: function (e) {
    const self = this;
    api.buttonCanClick(self);
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
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
    if(!self.data.isLoadAll){
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
