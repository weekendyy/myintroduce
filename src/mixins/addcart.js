import wepy from 'wepy'
import * as apis from '../api/api.js'
import _isEmpty from 'lodash.isempty'
import _size from 'lodash.size'
import _forEach from 'lodash.foreach'
 function sortNumber(a,b)
{
return a - b
}
export default class addcartMixin extends wepy.mixin {
  data = {
    hideShopPopup : true,
    propertyChildIds:"",
    propertyChildNames:"",
    canSubmit:false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo:{},
    selectSize:"选择：",
    selectSizePrice:0,
    selectOrgPrice:0,
    stockstr:''
  }

  methods ={
    tobuy(){
      if (this.data.goodsDetail.properties && !this.data.canSubmit) {
        this.bindGuiGeTap();
        return;
      }
      if(this.data.buyNumber < 1){
        wx.showModal({
          title: '提示',
          content: '暂时缺货哦~',
          showCancel:false
        })
        return;
      }
      this.addShopCar();
      this.goShopCar();
    },
    tobuyNow(){
      if(this.canSubmit){
           wx.navigateTo({
          url:"/pages/to-pay-order/buy?id=" + this.goodsDetail.basicInfo.id + '&opid=' + this.selectOpid + '&nums=' + this.buyNumber
        })
      }
    },
    numJianTap() {
     if(this.buyNumber > this.buyNumMin && this.canSubmit){
        var currentNum = this.buyNumber;
        currentNum--;
        this.buyNumber = currentNum
        this.$apply()
     }
    },
    numJiaTap() {
       if(this.buyNumber < this.buyNumMax&& this.canSubmit){
          var currentNum = this.buyNumber;
          currentNum++ ;
          this.buyNumber = currentNum
          this.$apply()
       }
    },
    closePopupTap() {
      this.hideShopPopup = true
      this.$apply()
    },
    // sortNumber(a,b)
    // {
    // return a - b
    // },
    async labelItemTap(e) {
      var that = this;
      this.noSelectAll = true
      this.stockstr = ''
      // 取消该分类下的子栏目所有的选中状态
      var childs = that.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods;
      for(var i = 0;i < childs.length;i++){
        that.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[i].active = 0;
      }
      // 设置当前选中状态
      that.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex].active = 1;
      let chosePro = that.goodsDetail.properties[e.currentTarget.dataset.propertyindex].childsCurGoods[e.currentTarget.dataset.propertychildindex]
      if(_isEmpty(chosePro.thumb)){
        this.goodThumb = this.goodsDetail.basicInfo.pic;
      }else{
        this.goodThumb = chosePro.thumb
      }
      // 获取所有的选中规格尺寸数据
      var needSelectNum = that.data.goodsDetail.properties.length;
      var curSelectNum = 0;
      // var propertyChildIds= "";
      var propertyChildNames = "";
      let childsid = []
      let idnums = 0;
      for (var i = 0;i < that.data.goodsDetail.properties.length;i++) {
        childs = that.data.goodsDetail.properties[i].childsCurGoods;
        for (var j = 0;j < childs.length;j++) {
          if(childs[j].active){
            curSelectNum++;
            childsid[idnums] = childs[j].id
            //
            idnums++;
            propertyChildNames = propertyChildNames + that.data.goodsDetail.properties[i].name + ":"+ childs[j].name +"  ";
          }
        }
      }
      this.buyNumber = 1
      let propertyChildIds = ''
      let TmppropertyChildNames = ''
      if( _size(childsid) == _size(that.goodsDetail.properties)){
        childsid.sort(sortNumber)
        propertyChildIds =  childsid.join('_');
        TmppropertyChildNames = propertyChildNames
      }
      this.propertyChildNames = TmppropertyChildNames
      // this.$apply()

      var canSubmit = false;
      if (needSelectNum == curSelectNum) {
        canSubmit = true;
      }
      this.propertyChildIds = propertyChildIds
      // 计算当前价格
      if (canSubmit) {
          if(this.goodsDetail.hasOwnProperty('option')){
            let obj = this.goodsDetail.option.data.find(obj => obj.propertyids === propertyChildIds)
            console.log('------------')
            console.log('------------')
            console.log(obj)
            console.log('------------')
            console.log('------------')

            if(_isEmpty(obj)){
              this.noSelectAll = true
              canSubmit=false
              this.selectOpid = 0
            }else{
              // this.propertyChildIds = propertyChildIds

              this.optid = obj.id
              this.buyNumMax = obj.stores
              
              this.selectSizePrice = obj.price
              this.selectOpid = obj.id
              that.noSelectAll = true
              this.stockstr = ',库存:'+obj.stores
              if(obj.stores > 0 && obj.price > 0){
                
                canSubmit = true
              }else{
                canSubmit = false
              }
              // this.selectSizePrice = obj.showPrice
              // this.selectOrgPrice = obj.showOrgPrice
         
            }
          }else{
            canSubmit=false
            this.noSelectAll = true
          
          }
      }else{
          canSubmit=false
          this.noSelectAll = true
      }
      this.goodsDetail = that.data.goodsDetail
      this.canSubmit = canSubmit
      this.$apply()
    },
    btnaddGuiGeShopCar(){
      this.addGuiGeCar()
    },
  }
  addGuiGeCar(){
    if(!this.canSubmit){
      wx.showModal({
        title: '提示',
        content: '请先选择规格~',
        showCancel:false
      })
      return;
    }
    this.addShopCommonCar()
  }
  addShopCommonCar(){
    if(this.buyNumber < 1){
      wx.showModal({
        title: '提示',
        content: '暂时缺货哦~',
        showCancel:false
      })
      return;
    }
    // 加入购物车
    var shopCarMap = {};
    shopCarMap.uuid=(new Date()).getTime()+ '' + parseInt(Math.random()*(100000-10000+1)+10000,10);
    shopCarMap.goodsId=this.goodsDetail.basicInfo.id;
    shopCarMap.pic=this.goodsDetail.basicInfo.pic;
    shopCarMap.name=this.goodsDetail.basicInfo.name;
    shopCarMap.propertyChildIds=this.propertyChildIds;
    shopCarMap.optid=this.optid;
    shopCarMap.label= this.propertyChildNames;
    shopCarMap.price= this.selectSizePrice;
    shopCarMap.errcode=0;
    shopCarMap.errmsg='';
    shopCarMap.left="";
    shopCarMap.active=true;
    shopCarMap.number = this.buyNumber;
    shopCarMap.buyNumMax = this.buyNumMax;
    shopCarMap.logisticsType=this.goodsDetail.basicInfo.logisticsId;

    var shopCarInfo = this.shopCarInfo;
    if (!shopCarInfo.shopNum){
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList){
      shopCarInfo.shopList = [];
    }
    var hasSameGoodsIndex = -1;
    for (var i = 0;i<shopCarInfo.shopList.length;i++) {
      var tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number=shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }

    shopCarInfo.shopNum = shopCarInfo.shopNum + this.buyNumber;
    if (hasSameGoodsIndex > -1) {
      console.log('hasSameGoodsIndex');
      shopCarInfo.shopList.splice(hasSameGoodsIndex,1, shopCarMap);
    } else {
       console.log(shopCarInfo.shopList);
       console.log('not-hasSameGoodsIndex');
       shopCarInfo.shopList.push(shopCarMap);
    }

    this.shopCarInfo = shopCarInfo,
    this.shopNum = shopCarInfo.shopNum

    this.$apply()
    wx.setStorage({
      key:"shopCarInfo",
      data:shopCarInfo
    })
    this.closePopupTapFn();
    wepy.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  }
  

  async onRoute(){
    console.log('onRoute')
  }
}
