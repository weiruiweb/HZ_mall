import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();



Page({
  data: {
   array: ['类型1', '类型2', '类型3', '类型4'],
   currentId:0,
  }, 
  onLoad(options){
    const self = this;
  },
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  choose(e){
    const self = this;
    self.setData({
      currentId:e.currentTarget.dataset.id
    })
    console.log(self.data.currentId)
  },
 
})