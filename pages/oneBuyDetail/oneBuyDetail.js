import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();


Page({
  data: {
    mainData:[],
    isFirstLoadAllStandard:['getMainData'],
    submitData:{
      phone:'',
      name:'',
    }
  },
  //事件处理函数
 
  onLoad(options) {
    const self = this;
    api.commonInit(self);
    self.data.id = options.id;
    
    self.getMainData();

  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      id:self.data.id
    };
    postData.searchItem.thirdapp_id = api.cloneForm(getApp().globalData.thirdapp_id);
    postData.getAfter = {
      user:{
        tableName:'User',
        middleKey:'passage1',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0]
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
        if(self.data.mainData.user.length>0&&self.data.mainData.passage1==wx.getStorageSync('info').user_no){
          self.data.isMe = true;
          self.setData({
            web_isMe:self.data.isMe
          });
        }else if(self.data.mainData.user.length>0){
          self.data.isOther = true;
          self.setData({
            web_isOther:self.data.isOther
          })
        };
      }else{
        api.showToast('数据错误','none');
      };
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getMainData',self);
      self.setData({
        web_mainData:self.data.mainData,
      });  
    };
    api.productGet(postData,callback);
  },


  chooseReward(){
    const self = this;
    var rewardNum = Math.ceil(Math.random()*self.data.mainData.limit); 

    const postData = {
      paginate:{
        count: 0,
        currentPage:2,
        pagesize:rewardNum-1,
        is_page:true,
      },
      searchItem:{
        product_id:self.data.mainData.id
      },
      tokenFuncName:'getProjectToken' 
    };

    if(rewardNum==1){
      postData.paginate.pagesize = 1;
      postData.paginate.currentPage = 1;
    };
    const callback = (res)=>{
      if (res.solely_code==100000&&res.info.data.length>0) {
        self.userInfoUpdateTwo(res.info.data[0].user_no)
      }else{
        api.showToast('网络故障','none')
      };
      self.getMainData();
      
    }
    api.orderItemGet(postData,callback);
  },

  addOrder(){
    const self = this;
    api.buttonCanClick(self);
    const postData = {
      tokenFuncName:'getProjectToken',
      orderList:[
        {
          product:[
            {id:self.data.mainData.id,count:1}
          ], 
        }
      ],      
      type:1,
      pay:{
        wxPay:{
          price:self.data.mainData.price
        }
      }
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        const payCallback=(payData)=>{
          if(payData==1){
            if(self.data.mainData.stock==1){
              api.showToast('支付成功','none')
              self.chooseReward()  
            }else{
              api.showToast('支付成功','none')
              self.getMainData()
            };
            
          }else{
            api.showToast('支付失败','none');
          }   
        };
        api.realPay(res.info,payCallback);  
      }else{
        api.showToast(res.msg,'none')
      }
      api.buttonCanClick(self,true);
    };
    api.addOrder(postData,callback);  
  },


  changeBind(e) {
    const self = this;
    api.fillChange(e, self, 'submitData');
    self.setData({
      web_submitData: self.data.submitData,
    });
    console.log(self.data.submitData)
  },



  userInfoUpdate(e){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.data =self.data.submitData;
    postData.saveAfter = [
      {
        tableName:'Product',
        FuncName:'update',
        searchItem:{
          id:self.data.mainData.id
        },
        data:{
          passage2:self.data.submitData.name+self.data.submitData.phone
        }
      }
    ];
    const callback = (res)=>{
      if(res.solely_code==100000){
        api.showToast('领取成功','none')

      }else{
        api.showToast('领取失败','none')
      }
      self.getMainData();
    };
    api.userInfoUpdate(postData,callback);
  },

  userInfoUpdateTwo(user_no){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.data ={
      update_time:new Date().getTime()
    };
    postData.saveAfter = [
      {
        tableName:'Product',
        FuncName:'update',
        searchItem:{
          id:self.data.mainData.id
        },
        data:{
          passage1:user_no
        }
      }
    ];
    const callback = (res)=>{
      console.log('开奖结果',res);
    };
    api.userInfoUpdate(postData,callback);
  },


  submit() {
    const self = this;
    api.buttonCanClick(self)
    var name = self.data.submitData.name;
    var phone= self.data.submitData.phone;
    const pass = api.checkComplete(self.data.submitData);
    if (pass) {
      if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
        api.showToast('手机格式错误', 'none')
      } else {
        if (!/^[\u4E00-\u9FA5]+$/.test(name)) {
          api.showToast('姓名格式错误', 'none')
        } else {
          self.userInfoUpdate();
        }
      }
    } else {
      api.showToast('请补全信息', 'none');
    };
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

