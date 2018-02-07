import wepy from 'wepy'
import * as apis from '../api/api.js'
import _isEmpty from 'lodash.isempty'
import _size from 'lodash.size'
import _forEach from 'lodash.foreach'

export default class payMixin extends wepy.mixin {
  data = {
      navItems:[],  //顶部导航
      paySup:{wx:1}, //
      goodsList:[],
      ordergoodlist:[],
      subing:false,
      curAddressData: {},
      HaveDefault: false,
      isNeedLogistics:0, // 是否需要物流信息
      allGoodsPrice:0,
      yunPrice:0,
      goodsJsonStr:"",
      addressid: 0,
      vtype: 8,
      goodsnums:0,
      goodsweight:0,
      WaitPayFee:0,
      usecoupon:[],
      couponfee:0,
      navIndex:'kd',
      navZtMore: 0,
      navZtTime: 0,
      navZtStore: 0,
      categories: [{
        id: 1,
        name: '11',
        second: [{
          id: 111,
          name: 1111,
        }]
      },{
        id: 2,
        name: '22',
        second: [{
          id: 222,
          name: 2222,
        }]
      },{
        id: 3,
        name: '33',
        second: [{
          id: 333,
          name: 3333,
        }]
      }],
      leftRightId:0,
      leftRightId1:0,
      sendstore:{},
      pickTime:'',
      datepick: 0,
      toggle:true,
      payWayShow2:false,
      iscart: false,
      loadSysTimes: 0,
      addlen:1,
      addwidth:1,
      openArea:-1,
      uname:'',
      umobile:''

  }
  setTime(start_time,end_time,index){
        var id=0
        let selfarr = []
        let base_val = index * 10000
        for(var i=start_time;i<=end_time;i+=30){
            id++
            var hour=(parseInt(i/60)).toString().length==1?'0'+(parseInt(i/60)):(parseInt(i/60))
            var min=(i%60).toString().length==1?'0'+(i%60):(i%60)
            selfarr.push({
              id:'index'+index+'-'+id,
              name:hour+':'+min,
              stime: base_val - 0 + i
            })          
        }
        let name = ''
        if(index==0){
          name = '今天'
        }else if(index==1){
           name = '明天'
        }else if(index==2){
           name = '后天'
        }
        this.categories[index].name = name
        this.categories[index].second = selfarr

        this.$apply()
        console.log(this.categories)
  }

  methods ={
    bindinput(e){
      console.log(e)
      if(e.target.dataset.itype == 'uname'){
        this.uname = e.detail.value
        this.$apply();
      }else if(e.target.dataset.itype =='umobile'){
        this.umobile = e.detail.value
        this.$apply();
      }
    },
    addAddress() {
      wx.navigateTo({
        url:"/pages/address-add/index"
      })
    },
    selectAddress() {
      wx.navigateTo({
        url:"/pages/select-address/index"
      })
    },
    navTap(e){
        this.navIndex=e.currentTarget.dataset.navitem;
        wx.setStorageSync('navIndex', this.navIndex);
      },
      toShopAddress(){
        apis.navTo('pages/to-pay-order/shopAdress')
      },
    closepayWay(){
        this.payWayShow=false;
        this.payWayShow2=false;
        this.$apply();
      },
      rightLeft(e){
        this.leftRightId = e.currentTarget.dataset.id;
        this.date= e.currentTarget.dataset.name;
        this.$apply();
        // console.log(this.leftRightId);
      },
      rightView(e){
        console.log(e.currentTarget.dataset.day)
        this.pickTime=e.currentTarget.dataset.text+'('+e.currentTarget.dataset.day+')';
        this.leftRightId1=e.currentTarget.dataset.id;
        this.payWayShow2=false
        this.datepick =  e.currentTarget.dataset.stime
        this.$apply()
        console.log(this.datepick)
        wx.setStorage({key:'scorll_index',data:e.currentTarget.dataset.id});
      },
      takeBySelf_timeTap(){
        if(this.sendstore.id>0){
          console.log(this.sendstore)
          var start_time_hour=parseInt(this.sendstore.opentime.split(':')[0])
          var start_time_min=parseInt(this.sendstore.opentime.split(':')[1])
          var end_time_hour=parseInt(this.sendstore.closetime.split(':')[0])
          var end_time_min=parseInt(this.sendstore.closetime.split(':')[1])
          var now = (new Date().getHours())*60-0 +(new Date().getMinutes()) + 30;
          var start_time=start_time_hour*60 -0 +start_time_min
          var end_time=end_time_hour*60 - 0 +end_time_min
          console.log([now,end_time])
          this.setTime(now,end_time,0)
          this.setTime(start_time,end_time,1)
          this.setTime(start_time,end_time,2)
          this.payWayShow2=true
          this.$apply()
        }else{
          wx.showModal({
            title: '错误',
            content: '请选择门店',
            showCancel: false
          })
          return;
        }
        
      },
      async createOrder(e) {
    let paymt = e.detail.target.dataset.id
   
    var that = this;
    this.subing =true
    this.$apply()

    let goodsJsonStr = this.mk_goodstopay()
    var remark = e.detail.value.remark; // 备注信息
    var postData = {
      goodsJsonStr: goodsJsonStr,
      remark: remark,
      sendtype: this.navIndex
    };
    if(this.navIndex == 'zt'){
      if(_isEmpty(this.sendstore) && this.navZtStore>0){
        wx.showModal({
          title: '错误',
          content: '没有选择自提门店',
          showCancel: false
        })
        return;
      }
      if(this.datepick<1 && this.navZtTime>0){
        wx.showModal({
          title: '错误',
          content: '没有选择自提时间',
          showCancel: false
        })
        return;
      }
      postData.shopid = this.sendstore.id
      postData.sendtime = this.datepick
      postData.uname = this.uname
      postData.umobile = this.umobile
      // postData.sendtype = ''
    }

    
    if (that.isNeedLogistics > 0) {
      if (!that.data.curAddressData) {
        wx.showModal({
          title: '错误',
          content: '请选择您的收货地址',
          showCancel: false
        })
        return;
      }
    }
    postData.addressid = that.curAddressData.id;
    if(!_isEmpty(this.usecoupon)){
      postData.coupon = this.usecoupon.id
    }
    postData.paymt = paymt
    let res = await apis.apiFetch(apis.API_BASE_URL + 'v5_ds_vtype8_order#fake', postData);
    this.subing =false
    this.$apply()
    if (res.errcode == 0) {
      if(paymt=='balance' || paymt =='cod'){
        wx.removeStorage({
          key: 'shopCarInfo'
        })
        // apis.navTo('/subPackages/giftForPay/index?ordersn='+res.errmsg.ordersn)
        apis.navTo('/pages/order-list/index?ordersn='+res.errmsg.ordersn)
        return 
      }
      let payjs = res.errmsg.payjson
      wx.requestPayment({
      'timeStamp': payjs.timeStamp,
      'nonceStr':  payjs.nonceStr,
      'package':  payjs.package,
      'signType': 'MD5',
      'paySign':  payjs.paySign,
        success:function(){
              wx.showModal({
                title: '支付成功',
                content: '已经支付成功，请返回订单列表',
                showCancel: false
              })
              if(that.iscart){
                wx.removeStorage({
                  key: 'shopCarInfo'
                })
              }
              let _sys_setting = wepy.getStorageSync('_sys_setting')
              if(_sys_setting.buygift>0){
                apis.navTo('/subPackages/giftForPay/index?ordersn='+res.errmsg.ordersn)
              }else{
                apis.navTo('/pages/order-list/index?ordersn='+res.errmsg.ordersn)
              }
              
            },
            fail:function(){
              wx.showModal({
                title: '支付失败',
                content: '支付失败',
                showCancel: false
              })
            }
        })
      // console.log(res)
    }else{
      wx.showModal({
          title: '有点小问题',
          content: '' + res.errmsg,
          showCancel: false
        })
    }
  }
  }

  
  async setSysConfig(){
    let self = this
    console.log('this.loadSysTimes='+this.loadSysTimes)
    console.log(self.$parent.globalData)
    if(self.$parent.globalData.setting){
      this.init_onload(self.$parent.globalData.setting)
    }else{
      let _sys_setting = await wepy.getStorageSync('_sys_setting')
      if(_sys_setting){
         this.init_onload(_sys_setting)
      }else{
        
        if(this.loadSysTimes<5){
          this.loadSysTimes = this.loadSysTimes - 0 + 1
          this.$apply();
          setTimeout(function(){
            self.setSysConfig()
          },1000);
        } 
        
      }
    }
    
    

  }


  async onRoute(){
    var shop_adress = wx.getStorageSync('shop_adress');
    var shop_name = wx.getStorageSync('shop_name');
    var navIndex = wx.getStorageSync('navIndex');
    if(shop_adress){
      this.takeBySelf={shop_adress:shop_adress,shop_name:shop_name}
    }
    if(navIndex){
      this.navIndex=wx.getStorageSync('navIndex');
    }
    let sendstore = wx.getStorageSync('cache_sendstore');
    if(_isEmpty(sendstore)){
      this.sendstore = {
        name:'未选择'
      }
    }else{
      this.sendstore =sendstore
    }
    this.$apply()
  }
  async initShippingAddress() {
    var self = this;
    let res = await apis.apiFetch(apis.API_BASE_URL + 'ms_addr_default', {});
    if (res.errcode == 0) {
      if(!_isEmpty(res.errmsg.data)){
        self.curAddressData = res.errmsg.data
        self.addressid = res.errmsg.data.id
        self.HaveDefault = true
        self.$apply()
        console.log(self.curAddressData)
      } 
    }
  }
  
  async init_onload(_sys_setting){
    let self = this
    if(_sys_setting.tobuy){
      this.navItems = _sys_setting.tobuy
      this.navIndex = _sys_setting.tobuy[0]['md']
      _forEach(_sys_setting.tobuy,function(val, idx){
        if(val.md=='zt'){
          if(val.hasinfo>0){
            self.navZtMore = 1;
            self.$apply();
          }
          if(val.hastime>0){
            self.navZtTime = 1;
            self.$apply();
          }
          if(val.hasstore>0){
            self.navZtStore = 1;
            self.$apply();
          }
        }
      })
    }
    if(_sys_setting.paymt){
      this.paySup = _sys_setting.paymt

    }
    this.$apply()
  }

}
