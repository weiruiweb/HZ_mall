
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
   num:0,
   mainData:[],
   isFirstLoadAllStandard:['getMainData'],
   searchItem:{
    },

  },


  onLoad(options){
    const self = this;
    api.commonInit(self);
    if(options.num){
      self.changeSearch(options.num)
    }
  },

  onShow(){
    const self = this;
    self.getMainData(true)
  },


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.tokenFuncName='getProjectToken';
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.searchItem.type = ['in',[1,5]];
    postData.searchItem.status = ['in',[0,1]];
    postData.searchItem.user_no = wx.getStorageSync('info').user_no;
    postData.order = {
      create_time:'desc'
    }
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.mainData.push.apply(self.data.mainData,res.info.data);
        }else{
          self.data.isLoadAll = true;
          api.showToast('没有更多了','none');
        };

        self.setData({
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      };
      api.buttonCanClick(self,true)
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      console.log('getMainData',self.data.mainData)
    };
    api.orderGet(postData,callback);
  },

  deleteOrder(e){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      api.dealRes(res);
      self.getMainData(true);
    };
    api.orderDelete(postData,callback);
  },

  orderUpdate(e){
    const self = this;
    var index = api.getDataSet(e,'index');
    console.log('index',index)
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data ={
      order_step:3,
      transport_status:2,
    }
    postData.searchItem = {};
    postData.searchItem.id = self.data.mainData[index].id;
    postData.saveAfter=[{
      tableName:'FlowLog',
      FuncName:'add',
      data:{
        user_no:self.data.mainData[index].products[0].user_no,
        count:self.data.mainData[index].price,
        trade_info:'用户购买收入',
        status:1,
        type:2
      }
    }]
    const callback  = res=>{
      api.showToast('已确认收货','none');
      self.getMainData(true);
    };
    api.orderUpdate(postData,callback);
  },


  refuedOrder(e){
    const self = this;
    api.buttonCanClick(self)
    const postData = {};
    postData.tokenFuncName = 'getProjectToken';
    postData.data ={
      order_step:1
    }
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      if(res.solely_code==100000){
        api.showToast('申请成功','none'); 
      }else{
        api.showToast(res.msg,'none')
      };  
      self.getMainData(true);
    };
    api.orderUpdate(postData,callback);
  },



  pay(e){
    const self = this;
    var id = api.getDataSet(e,'id');
    
    api.pathTo('/pages/confirm_order/confirm_order?order_id='+id,'nav'); 
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
      num: num
    });
    self.data.searchItem = {}
    if(num=='0'){

    }else if(num=='1'){
      self.data.searchItem.pay_status = '0';
      self.data.searchItem.order_step = ['in',[0,4,5]];
    }else if(num=='2'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.transport_status = ['in',[0,1]];
      self.data.searchItem.order_step = ['in',[0,4,5]];
    }else if(num=='3'){
      self.data.searchItem.pay_status = '1';
      self.data.searchItem.transport_status = '2';
      self.data.searchItem.order_step = ['in',[0,3,5]]
    }else if(num=='4'){
      self.data.searchItem.order_step = ['in',[1,2]];
    }
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },

  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll&&self.data.buttonCanClick){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

  onShareAppMessage(res,e){
    const self = this;
    var id = api.getDataSet(e,'id');
    var group_no = api.getDataSet(e,'group_no');
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '华珍商场',
        path: 'pages/detail/detail?group_no='+group_no+'&&product_id='+id,
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

 

   intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 

})