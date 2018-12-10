import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({


  data: {

    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    swiperIndex:0,
    messageData:[],
    mainData:[],
    chooseId:[],
    tabCurrent:0,
    isShow:false,
    isShow1:false,
    labelData:[],
    orderData:[],
    complete_api:[],
    keys:[],
    values:[],
    skuData:{},
    count:1,
    id:'',
    sku_item:[],
    choose_sku_item:[],
    buttonType:'',
    isLoadAll:false,
    buttonCanClick:false,
    isFirstLoadAllStandard:['getMessageData','getMainData'],
    count:1
  },
  
  onLoad(options){
    const self = this;
    wx.removeStorageSync('checkLoadAll');
    console.log(self.data.skuData);
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    wx.showLoading();
    self.setData({
      web_count:self.data.count
    });
    if(options.id){
      self.data.id = options.id
    }
    self.getMainData();
    self.getMessageData();
    self.orderGet();
    if(wx.getStorageSync('collectData')[self.data.id]){
      self.setData({
        url: '/images/heart.png',
      });
    }else{
      self.setData({
        url: '/images/collect.png',
      });
    };
    wx.showShareMenu({
      withShareTicket: true
    });

    
  },



  collect(){
    const self = this;  
    const id = self.data.id;
    if(wx.getStorageSync('collectData')&&wx.getStorageSync('collectData')[id]){
      api.deleteFootOne(id,'collectData');
      self.setData({
        url: '/images/collect.png',
      });
    }else{
      api.footOne(self.data.mainData,'id',100,'collectData');  
      self.setData({
        url: '/images/heart.png',
      });
    };
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.getBefore={
      sku:{
        tableName:'sku',
        searchItem:{
          id:['in',[self.data.id]]
        },
        fixSearchItem:{
          status:1
        },
        key:'product_no',
        middleKey:'product_no',
        condition:'in',
      } 
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:{
          status:['in',[1]]
        },
      },
      merchant:{
        tableName:'UserInfo',
        middleKey:'user_no',
        key:'user_no',
        condition:'=',
        searchItem:{      
          status:['in',[1]]
        },
      },
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
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
        self.data.mainData.passage1 = self.data.mainData.passage1.split(',');
        for(var key in self.data.mainData.label){
          if(self.data.mainData.sku_array.indexOf(parseInt(key))!=-1){
            self.data.labelData.push(self.data.mainData.label[key])
          };    
        };
        
        for (var i = 0; i < self.data.mainData.sku.length; i++) {
          if(self.data.mainData.sku[i].id==self.data.id){
            self.data.choosed_skuData = api.cloneForm(self.data.mainData.sku[i]);
            self.data.choosed_sku_item = api.cloneForm(self.data.mainData.sku[i].sku_item);
            var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
            self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
            console.log('self.data.can_choose_sku_item',self.data.can_choose_sku_item)
          };
        };
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;

      }else{
        api.showToast('商品信息有误','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
     
      self.setData({
        web_choosed_skuData:self.data.choosed_skuData,
        web_labelData:self.data.labelData,
        web_mainData:self.data.mainData,
        web_choosed_sku_item:self.data.choosed_sku_item,
        web_can_choose_sku_item:self.data.can_choose_sku_item,
      });
      console.log('self.data.labelData',self.data.labelData)
    };
    api.productGet(postData,callback);
  },

  



  counter(e){

    const self = this;
    if(JSON.stringify(self.data.choosed_skuData)!='{}'){
      if(api.getDataSet(e,'type')=='+'){
        self.data.count++;
      }else if(self.data.choosed_skuData.count > '1'){
        self.data.count--;
      }
    }else{
      self.data.count = 1;
    };
    console.log('self.data.count',self.data.count)
    self.countTotalPrice();

  },


  bindManual(e) {
    const self = this;
    var count = e.detail.value;
    self.setData({
      web_count:count
    });
  },



  countTotalPrice(){  
    const self = this;
    var totalPrice = 0;
    totalPrice += self.data.count*parseFloat(self.data.skuData.price);
    self.data.totalPrice = totalPrice;
    self.setData({
      web_totalPrice:self.data.totalPrice.toFixed(2),
      web_count:self.data.count

    });
  },

  

  selectModel(e){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    self.data.buttonType = api.getDataSet(e,'type');
    console.log( self.data.buttonType)
    var isShow = !self.data.isShow;
    self.setData({
      web_buttonType:self.data.buttonType,
      web_isShow:isShow
    })
  },

  addCart(){
    const self = this;
    self.data.choosed_skuData.count = self.data.count;
    self.data.choosed_skuData.isSelect = true;
    console.log(self.data.choosed_skuData);
    if(self.data.choosed_skuData.id !=''&&self.data.choosed_skuData.id !=undefined){
      api.footOne(self.data.choosed_skuData,'id',100,'cartData'); 
      api.showToast('已加入购物车啦','none')
    }else{
      api.showToast('请完善信息','none')
    }
    this.setData({
      isShow:false,
    })
  },

/*  goBuy(){
    const self = this;
    const callback = (user,res) =>{ 
      const skuDatas = [];
      skuDatas.push({
        id:self.data.choosed_skuData.id,
        count:self.data.count
      });
      console.log(skuDatas);
      if(self.data.choosed_skuData.id !=''&&self.data.choosed_skuData.id !=undefined){
        wx.setStorageSync('payPro',self.data.choosed_skuData);
       
        api.pathTo('/pages/confirm_order/confirm_order','nav')
      }else{
        api.showToast('请完善信息','none')
      }
    };
    api.getAuthSetting(callback);


  },*/

  goBuy(){

    const self = this;
    api.buttonCanClick(self);
    if(JSON.stringify(self.data.choosed_skuData)=='{}'){
      api.showToast('未选中商品','none');
      return;
    };
    
    const postData = {
      tokenFuncName:'getProjectToken',
      sku:[
        {
          id:self.data.choosed_skuData.id,
          count:self.data.count
        }
      ],
      type:1
    };
    const c_callback = (res)=>{
      api.buttonCanClick(self,true);
      if(res&&res.solely_code==100000){
        api.pathTo('/pages/confirm_order/confirm_order?order_id='+res.info.id,'nav');        
      }else{
        api.showToast(res.msg,'none');
      };
    };
    api.addOrder(postData,c_callback);

  },
   

  chooseSku(e){
    const self = this;
    console.log('chooseSku',e)
    
    var id = api.getDataSet(e,'id');
    if(self.data.can_choose_sku_item.indexOf(id)==-1){
      return;
    };

    var index = self.data.choosed_sku_item.indexOf(id);
    if(index==-1){
      self.data.choosed_sku_item.push(id);
    }else{
      self.data.choosed_sku_item.splice(index,1);
    };
    var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
    self.data.choosed_skuData = skuRes.choosed_skuData;
    self.data.can_choose_sku_item = skuRes.can_choose_sku_item;

    self.data.count = 1;
    self.countTotalPrice();

    console.log('self.data.mainData.sku',self.data.mainData.sku)
    console.log('self.data.choosed_sku_item',self.data.choosed_sku_item)
    console.log('self.data.can_choose_sku_item',self.data.can_choose_sku_item)
    console.log('self.data.choosed_skuData',self.data.choosed_skuData)
    self.setData({
      web_choosed_sku_item:self.data.choosed_sku_item,
      web_choosed_skuData:self.data.choosed_skuData,
      web_can_choose_sku_item:self.data.can_choose_sku_item,
    });
    
  },
    
    


  swiperChange(e) {
    const that = this;
    that.setData({
      swiperIndex: e.detail.current,
    })
  },

  onShareAppMessage(res){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '巧巧爱家',
        path: 'pages/detail/detail?id='+self.data.id+'&&user_no='+wx.getStorageSync('info').user_no,
        success: function (res){
          console.log(res);
          console.log(parentNo)
          if(res.errMsg == 'shareAppMessage:ok'){
            console.log('分享成功')
            if (self.data.shareBtn){
              if(res.hasOwnProperty('shareTickets')){
              console.log(res.shareTickets[0]);
                self.data.isshare = 1;
              }else{
                self.data.isshare = 0;
              }
            }
          }else{
            wx.showToast({
              title: '分享失败',
            })
            self.data.isshare = 0;
          }
        },
        fail: function(res) {
          console.log(res)
        }
      }
  },

  getMessageData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName='getProjectToken',
    postData.searchItem = {
      relation_id:self.data.id,
      type:2
    };
    postData.order = {
      create_time:'desc'
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data);
      }else{
        self.data.isLoadAll = true;
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMessageData',self);
      self.setData({
        web_num:self.data.messageData.length,
        web_messageData:self.data.messageData,
      });  
    };
    api.messageGet(postData,callback);
  },

  orderGet(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken',
    postData.searchItem = {
      user_type:0,
      type:1,
      group_leader:'true',
      order_step:4,
      pay_status:1
    };
    postData.getBefore = {
      OrderItem:{
        tableName:'OrderItem',
        searchItem:{
          sku_id:['in',[self.data.id]],
          status:['in',[1]]
        },
        fixSearchItem:{
          status:1
        },
        key:'order_no',
        middleKey:'order_no',
        condition:'in',
      }, 
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.orderData.push.apply(self.data.orderData,res.info.data)
/*        for (var i = 0; i < self.data.orderData.length; i++) {
          if(self.data.orderData[i].user_no==wx.getStorageSync('info').user_no){
            self.data.hasGroup = true;
          }
        }*/
      };
      self.setData({
        /*web_hasGroup:self.data.hasGroup,*/
        web_orderData:self.data.orderData
      });
      console.log('orderGet',self.data.orderData)
    }
    api.orderGet(postData,callback)
  },

  groupData(e){
    const self = this;
    self.data.id1 = api.getDataSet(e,'id');
    self.data.group_no1 = api.getDataSet(e,'group_no')
    const postData ={};
    postData.tokenFuncName='getProjectToken',
    postData.searchItem = {
      user_type:0,
      id:self.data.id1
    };
    postData.getAfter = {
      groupMember:{
        tableName:'order',
        middleKey:'group_no',
        key:'group_no',
        searchItem:{
          status:1,

        },
        condition:'='
      },
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };

    const callback = (res) =>{
      if(res.info.data.length>0){
        self.data.groupData = res.info.data[0];
        for (var i = 0; i < self.data.groupData.groupMember.length; i++) {
           if(self.data.groupData.groupMember[i].user_no==wx.getStorageSync('info').user_no){
            self.data.isMember = true;
           }
        }
        self.showGroupMember();
      };
      console.log('666',self.data.isMember )
      self.setData({
        web_isMember:self.data.isMember,
        web_groupData:self.data.groupData
      })
    }
    api.orderGet(postData,callback)
  },

  addOrder(){
    const self = this;
    if(!self.data.order_id){
   
      if(self.data.isMember){
        api.showToast('请勿重复参团','none');
        return;
      };
      console.log(777)
      const postData = {
        tokenFuncName:'getProjectToken',
        sku:[
          {id:self.data.choosed_skuData.id,count:1}
        ],
        pay:{wxPay:self.data.choosed_skuData.price,wxPayStatus:0},
        type:1,

      };
      postData.isGroup=true
      if(self.data.group_no1 &&self.data.group_no1!="undefined"){
        postData.group_no=self.data.group_no1
      };
      const callback = (res)=>{
        if(res&&res.solely_code==100000){
          if(res.info){
            const payCallback=(payData)=>{
              if(payData==1){
                setTimeout(function(){
                  api.pathTo('/pages/userOrder/userOrder','redi');
                },800)  
              };   
            };
            api.realPay(res.info,payCallback);      
          } 
        }; 
      };
      api.addOrder(postData,callback);  
    }else{
      self.pay(self.data.order_id)
    }  
  },

  pay(order_id){
    const self = this;
   
    var order_id = self.data.order_id;
    const postData = {
      token:wx.getStorageSync('token'),
      searchItem:{
        id:order_id,
      },
      wxPay:self.data.skuData.price,
      wxPayStatus:0
    };
     
    if(self.data.skuData.is_group==1){
      postData.searchItem.status = ['in',[0,1]]
    };
    const callback = (res)=>{
      wx.hideLoading();
      if(res.solely_code==100000){
      if(res.info){
        const payCallback=(payData)=>{
            if(payData==1){
              setTimeout(function(){
                api.pathTo('/pages/user_order/user_order','redi');
              },800)  
            };   
          };
          api.realPay(res.info,payCallback);      
      }
      }else{
        api.showToast('支付失败','none')
      }
         
    };
    api.pay(postData,callback);
  },


  showGroupMember(){
    const self = this;
    self.data.isShow = !self.data.isShow
    self.setData({
      web_isShow:self.data.isShow
    })
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },


  phoneCall() {
    const self = this;
    wx.makePhoneCall({
      phoneNumber: self.data.mainData.merchant[0].phone,
    })
  },

  select_this(e){
    const self = this;
    self.data.tabCurrent = api.getDataSet(e,'current');
    self.setData({
      tabCurrent:self.data.tabCurrent
    })
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  isShow(){
    const self = this;
    self.data.isShow = !self.data.isShow;
    self.setData({
      web_isShow:self.data.isShow
    })
  }, 

  isShow1(){
    const self = this;
    self.data.isShow1 = !self.data.isShow1;
    self.setData({
      web_isShow1:self.data.isShow1
    })
  },


})
