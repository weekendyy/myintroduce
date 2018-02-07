
import wepy from 'wepy'
import { $wuxButton } from '../components/wux/wux.js'
import * as apis from '../api/api.js'
export default class globalMixin extends wepy.mixin {
  data={
    basicColor:'#00A137',
    loadingModal: true,  //展示loading
    showabnor: 0,  //无产品
    types: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'], 
    index: 3, 
    opened: !1,
    tipsshow: 1,
    tips_arr:{
      tipsIcon: 'http://oyu2qzx2v.bkt.clouddn.com/success.png',
      tips_txt: '页面加载中',
      tips_desc: '请稍等,正在请求后台数据中...',
    }
  }
 initsyscolor(){
    let globalData = this.$parent.globalData
    if(globalData.hasOwnProperty('basicColor')){
      this.basicColor = globalData.basicColor
      this.$apply()
    }
    if(globalData.hasOwnProperty('frontColor')&&globalData.hasOwnProperty('backgroundColor')){
      wx.setNavigationBarColor({
        frontColor: globalData.frontColor,
        backgroundColor: globalData.backgroundColor
      })
    }
 }
  initButton(position = 'bottomRight') {
      this.setData({
          opened: 1, 
          backdrop: 1, 
      })
      this.button = $wuxButton.init('br', apis.showBtns(position))
  }
  onRoute(){
    this.initsyscolor()
  }
  

}
