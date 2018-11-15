import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    disabled: true,

  },
  //事件处理函数
  preventTouchMove: function(e) {

  },

  onLoad(options) {
    const self = this;

    self.setData({
      web_currentWordNumber: 400
    });
    self.getMainData()
  },



  changeBind(e) {
    const self = this;
    api.fillChange(e, self, 'submitData');
    self.setData({
      web_submitData: self.data.submitData,
    });
    console.log(self.data.submitData)
  },

  currentWordNumber(e) {
    const self = this;
    var currentWordNumber = api.fillChange(e, self, 'submitData');
    var value = e.detail.value;
    var len = parseInt(value.length);
    if (len > self.data.max) {
      return;
    }
    var lens = parseInt(400 - len)
    self.setData({
      web_submitData: self.data.submitData,
      web_currentWordNumber: lens,
    });
  },

  reSetInfomation() {
    const self = this;
    self.data.submitData = {
      content: '',
      passage1: '',
      mainImg: [],
      title: '',
      keywords: '',
      phone: '',
      passage_array: '',
      product_no: '',
      passage2: '',
    };
    self.setData({
      web_submitData: self.data.submitData,
    });
  },


  submit() {
    const self = this;
    var name = self.data.submitData.title;
    var id_num = self.data.submitData.keywords;
    var newObject = api.cloneForm(self.data.submitData);

    delete newObject.mainImg;
    delete newObject.passage2;
    delete newObject.passage1;

    const pass = api.checkComplete(newObject);
    if (pass) {
      if (!id_num || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|[xX])$/.test(id_num)) {
        api.showToast('身份证格式错误', 'none')
      } else {
        if (!/^[\u4E00-\u9FA5]+$/.test(name)) {
          api.showToast('姓名格式错误', 'none')
        } else {
          self.messageAdd();
        }
      }
    } else {
      api.showToast('请补全信息', 'none');
    };
  },



  getMainData() {
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id: getApp().globalData.thirdapp_id,
      id: self.data.id
    };
    const callback = (res) => {
      self.data.mainData = {};
      if (res.info.data.length > 0) {
        self.data.mainData = res.info.data[0];
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      };

      self.setData({
        web_mainData: self.data.mainData,
      });
    };
    api.articleGet(postData, callback);
  },



  intoPath(e) {
    const self = this;
    api.pathTo(api.getDataSet(e, 'path'), 'nav');
  },

  intoPathRedi(e) {
    const self = this;
    wx.navigateBack({
      delta: 1
    })
  },

  intoPathRedirect(e) {
    const self = this;
    api.pathTo(api.getDataSet(e, 'path'), 'redi');
  }

})