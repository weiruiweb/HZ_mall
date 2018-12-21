import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();



Page({
  data: {
    labelData:[],
    array: ['类型1', '类型2', '类型3', '类型4'],
    currentId:0,
    submitData:{
      title:'',
      keywords:'',
      class:1,
      content:'',
      passage1:'',
      phone:'',
      passage2:'',
      type:2,
      behavior:1
    },
 
    isFirstLoadAllStandard:['getLabelData'],
  }, 



  onLoad(options){
    const self = this;
    api.commonInit(self);
    self.setData({
      web_submitData:self.data.submitData
    });
    self.getLabelData();
  },


  getLabelData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['商品分类']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data)
      }else{
        api.showToast('没有更多了','none');
      }
      api.checkLoadAll(self.data.isFirstLoadAllStandard,'getLabelData',self);
      console.log('self.data.buttonCanClick',self.data.buttonCanClick)
      console.log(self.data.labelData)
      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },

  bindPickerChange: function(e) {
    const self = this;
    console.log('picker发送选择改变，携带值为', e)
    self.data.submitData.title = self.data.labelData[e.detail.value].title;
    console.log(self.data.labelData[e.detail.value].title);
    this.setData({
      web_submitData: self.data.submitData
    })
  },

  changeBind(e){
    const self = this;
    
    if(api.getDataSet(e,'value')){
      self.data.submitData[api.getDataSet(e,'key')] = api.getDataSet(e,'value');
    }else{
      api.fillChange(e,self,'submitData');
    };
    self.setData({
      web_submitData:self.data.submitData,
    }); 
    console.log(self.data.submitData)
  },

  messageAdd(){
    const self = this;
    const postData = {};
    postData.tokenFuncName='getProjectToken';
    postData.data = api.cloneForm(self.data.submitData);
    postData.data.user_no = wx.getStorageSync('info').user_no;
    console.log(postData)
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('发布成功','none');
        self.data.submitData = {
          title:'',
          keywords:'',
          content:'',
          passage1:'',
          phone:'',
          passage2:''
        };
        self.setData({
          web_submitData:self.data.submitData
        });
      }else{
        api.showToast('发布失败','none');
      };
      api.buttonCanClick(self,true);
    };
    api.messageAdd(postData,callback);  
  },


  submit(){
    const self = this;
    api.buttonCanClick(self);
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
      const callback = (user,res) =>{ 
        self.messageAdd(); 
      };
      api.getAuthSetting(callback); 
    }else{
      api.showToast('请补全信息','none');
      api.buttonCanClick(self,true);
    };
  },


  choose(e){
    const self = this;
    self.setData({
      currentId:e.currentTarget.dataset.id
    })
    console.log(self.data.currentId)
  },

 
})