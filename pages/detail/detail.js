import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({


  data: {
    messageData:[],
    skuIdArray:[],
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
    keys:[],
    values:[],
    skuData:{},
    count:1,
    id:'',
    sku_item:[],
    choose_sku_item:[],
    buttonType:'',
    isFirstLoadAllStandard:['getMessageData','getMainData'],
    count:1,
    searchItem:{},
    merge_can_choose_sku_item:[]
  },
  
  onLoad(options){
    const self = this;
    api.commonInit(self);
    
    if(options.id){
      self.data.id = options.id
    };
    console.log('self.data.id',self.data.id) 
    var cartData = api.getStorageArray('cartData');
    var cartRes = api.findItemInArray(cartData,'id',self.data.id);
    self.data.cart_count = cartRes.length>0?cartRes[1].count:0;
    //初始化收藏
    var collectData = api.getStorageArray('collectData');
    self.data.isInCollectData = api.findItemInArray(collectData,'id',self.data.id);
    
    wx.showShareMenu({
      withShareTicket: true
    });
    if(options.scene){
      var scene = decodeURIComponent(options.scene)
    };
    if(options.user_no){
      var parent_no = options.user_no
    };
    console.log('options',options)
    if(parent_no){
       const callback=(res)=>{
        self.getMainData();
      };
      api.parentAdd('getProjectToken',parent_no,callback); 
    }else{
      self.getMainData();
    }
    self.setData({
      web_isInCollectData:self.data.isInCollectData,    
      web_count:self.data.count
    });
    
  },



  collect(){
    const self = this;  
    if(getApp().globalData.buttonClick){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    if(self.data.isInCollectData){
      api.delStorageArray('collectData',self.data.choosed_skuData,'id'); 
    }else{
      api.setStorageArray('collectData',self.data.choosed_skuData,'id',999);
    };
    var collectData = api.getStorageArray('collectData');
    self.data.isInCollectData = api.findItemInArray(collectData,'id',self.data.id);
    self.setData({
      web_isInCollectData:self.data.isInCollectData,
    }); 
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.getBefore={
      sku:{
        tableName:'Sku',
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
        tableName:'Sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:api.cloneForm(self.data.searchItem)
      },
      merchantUserInfo:{
        tableName:'UserInfo',
        middleKey:'user_no',
        key:'user_no',
        condition:'=',
        searchItem:{      
          status:['in',[1]]
        },
      },
      merchantUser:{
        tableName:'User',
        middleKey:'user_no',
        key:'user_no',
        condition:'=',
        searchItem:{      
          status:['in',[1]]
        },
      },
      product:{
        tableName:'Sku',
        middleKey:'user_no',
        key:'user_no',
        condition:'=',
        searchItem:{      
          status:['in',[1]],
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
            var footData = api.getStorageArray('footData');
            self.data.isFoot = api.findItemInArray(footData,'id',self.data.choosed_skuData.id);
            if(!self.data.isFoot){
              api.setStorageArray('footData',self.data.choosed_skuData,'id',999); 
            };
            self.data.choosed_sku_item = api.cloneForm(self.data.mainData.sku[i].sku_item);
            var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
            self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
            for (var i = 0; i < self.data.choosed_sku_item.length; i++) {
              var finalRes = api.skuChoose(self.data.mainData.sku,[self.data.choosed_sku_item[i]]);
              self.data.merge_can_choose_sku_item.push.apply(self.data.merge_can_choose_sku_item,finalRes.can_choose_sku_item);
            };
            console.log('self.data.merge_can_choose_sku_item',self.data.merge_can_choose_sku_item)
          };
          self.data.skuIdArray.push(self.data.mainData.sku[i].id);//为了抓所有Sku的评论
        };
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
        console.log('self.data.skuIdArray',self.data.skuIdArray)
      }else{
        api.showToast('商品信息有误','none',1000);
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.getMessageData();
      self.orderGet();
      self.setData({
        web_choosed_skuData:self.data.choosed_skuData,
        web_labelData:self.data.labelData,
        web_mainData:self.data.mainData,
        web_choosed_sku_item:self.data.choosed_sku_item,
        web_merge_can_choose_sku_item:self.data.merge_can_choose_sku_item,
      });
      console.log('self.data.choosed_skuData',self.data.choosed_skuData)
    };
    api.productGet(postData,callback);
  },

  



  counter(e){

    const self = this;
    if(JSON.stringify(self.data.choosed_skuData)!='{}'){
      if(api.getDataSet(e,'type')=='+'){
        self.data.count++;
      }else if(api.getDataSet(e,'type')=='-'&&self.data.count > '1'){
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
      api.showToast('数据有误请稍等','none',1000);
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



  addCart(e){
    const self = this;
    let formId = e.detail.formId;
    if(JSON.stringify(self.data.choosed_skuData)=='{}'){
      api.showToast('未选中商品','none',1000);
      api.buttonCanClick(self,true);
      return;
    };
    if(self.data.choosed_skuData.is_group==1){
      api.showToast('团购商品不可加','none',1000);
      api.buttonCanClick(self,true);
      return;
    }
    self.data.choosed_skuData.count = self.data.count;
    self.data.choosed_skuData.isSelect = true;
    var res = api.setStorageArray('cartData',self.data.choosed_skuData,'id',999); 
    if(res){
      api.showToast('加入成功','none',1000);
      self.data.isShow = !self.data.isShow;
      self.setData({
        isShow:self.data.isShow
      })
    };
    var cartData = api.getStorageArray('cartData');
    var cartRes = api.findItemInArray(cartData,'id',self.data.id);
    self.data.cart_count = cartRes.length>0?cartRes[1].count:0;
    self.setData({
      web_cart_count:self.data.cart_count,
    }); 
  },

/*  goBuy(){

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

  },*/
   

  chooseSku(e){
    const self = this;
    console.log('chooseSku',e)
    
    var id = api.getDataSet(e,'id');
    if(self.data.merge_can_choose_sku_item.indexOf(id)==-1){
      //self.data.choosed_sku_item = [];
      return;
    };

    var index = self.data.choosed_sku_item.indexOf(id);
    console.log('index',index)
    if(index==-1){
      var newSkuRes = api.skuChoose(self.data.mainData.sku,[id]);
      var newchoosed_sku_item = api.cloneForm(self.data.choosed_sku_item);
      self.data.choosed_sku_item = [];

      for (var i = 0; i < newchoosed_sku_item.length; i++) {
        if(newSkuRes.can_choose_sku_item.indexOf(newchoosed_sku_item[i])!=-1){
          self.data.choosed_sku_item.push(newchoosed_sku_item[i]);
        };
      };
      console.log('newSkuRes.can_choose_sku_item',newSkuRes.can_choose_sku_item)
      
      
      self.data.choosed_sku_item.push(id);
    }else{
      self.data.choosed_sku_item.splice(index,1);
    };
    var skuRes = api.skuChoose(self.data.mainData.sku,self.data.choosed_sku_item);
    self.data.choosed_skuData = skuRes.choosed_skuData;
    self.data.can_choose_sku_item = skuRes.can_choose_sku_item;
    self.data.merge_can_choose_sku_item = [];
    if(self.data.choosed_sku_item.length>0){
      for (var i = 0; i < self.data.choosed_sku_item.length; i++) {
        var finalRes = api.skuChoose(self.data.mainData.sku,[self.data.choosed_sku_item[i]]);
        self.data.merge_can_choose_sku_item.push.apply(self.data.merge_can_choose_sku_item,finalRes.can_choose_sku_item);
      };
    }else{
      self.data.merge_can_choose_sku_item = self.data.can_choose_sku_item;
    };
    
    self.data.count = 1;
    self.countTotalPrice();

    console.log('self.data.mainData.sku',self.data.mainData.sku)
    console.log('self.data.choosed_sku_item',self.data.choosed_sku_item)
    console.log('self.data.can_choose_sku_item',self.data.can_choose_sku_item)
    console.log('self.data.choosed_skuData',self.data.choosed_skuData)
    self.setData({
      web_choosed_sku_item:self.data.choosed_sku_item,
      web_choosed_skuData:self.data.choosed_skuData,
      web_merge_can_choose_sku_item:self.data.merge_can_choose_sku_item,
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
      api.showToast('数据有误请稍等','none',1000);
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
        title: '华珍商城',
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
      relation_id:['in',self.data.skuIdArray],
      type:1
    };
    postData.order = {
      create_time:'desc'
    };
    postData.getAfter = {
      user:{
        tableName:'User',
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
      type:5,
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
        key:'order_no',
        middleKey:'order_no',
        condition:'in',
      }, 
    };
    postData.getAfter = {
      user:{
        tableName:'User',
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
        tableName:'Order',
        middleKey:'group_no',
        key:'group_no',
        searchItem:{
          status:1,

        },
        condition:'='
      },
      user:{
        tableName:'User',
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
        web_groupData:self.data.groupData,
        web_lessNum:self.data.groupData.standard - self.data.groupData.groupMember.length
      })
    }
    api.orderGet(postData,callback)
  },

/*  addOrder(){
    const self = this;
    if(!self.data.order_id){
   
    
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
  },*/

goBuy(){

    const self = this;
    api.buttonCanClick(self);
 /*   if(self.data.isMember){
      api.showToast('请勿重复参团','none');
      api.buttonCanClick(self,true);
      return;
    };*/
    if(self.data.buttonType=='groupBuy'&&self.data.choosed_skuData.is_group==0){
      api.showToast('型号未开启团购','none',1000);
      api.buttonCanClick(self,true);
      return; 
    }
    if(JSON.stringify(self.data.choosed_skuData)=='{}'){
      api.showToast('未选中商品','none',1000);
      api.buttonCanClick(self,true);
      return;
    };
    const postData = {
      tokenFuncName:'getProjectToken',
      orderList:[
        {
          sku:[
            {id:self.data.choosed_skuData.id,count:self.data.count}
          ],
          type:1, 
        }
      ],
      data:{
        standard:self.data.choosed_skuData.standard,
        passage1:self.data.choosed_skuData.user_no
      },  
    };
    if(self.data.choosed_skuData.is_group==1){
      postData.isGroup=true;
      postData.type = 5
    };
    if(self.data.group_no1&&self.data.group_no1!="undefined"){
      postData.group_no=self.data.group_no1
    };
    if(self.data.group_no&&self.data.group_no!="undefined"){
      postData.group_no=self.data.group_no
    };

    const callback = (res)=>{
      api.buttonCanClick(self,true);
      if(res&&res.solely_code==100000){
        
        api.pathTo('/pages/confirm_order/confirm_order?order_id='+res.info.id,'nav'); 
    
               
      }else{
        api.showToast(res.msg,'none');
      };
    };
    api.addOrder(postData,callback);
  },


  showGroupMember(){
    const self = this;
    self.data.isShow1 = !self.data.isShow1
    self.setData({
      web_isShow1:self.data.isShow1
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
    if(self.data.mainData.merchantUserInfo.length==0){
      api.showToast('商家未设置客服','none',1000);
      return
    };
    wx.makePhoneCall({
      phoneNumber: self.data.mainData.merchantUserInfo[0].phone,
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
