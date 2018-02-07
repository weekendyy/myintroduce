import wepy from 'wepy'
import * as apis from '../api/api.js'
import _isEmpty from 'lodash.isempty'
import _size from 'lodash.size'

export default class loadmoreMixin extends wepy.mixin {
  data = {
      onReachBottomAble: false,
      onLoadAll: false,
      page:1,
      skid: 0,
      vtype: 8,
      total_number: 0,
      viewdatalist:[],
      sparam:{}
  }
  methods = {
    tap () {
      this.mixin = 'mixin data was changed'
      console.log('mixin method tap')
    }
  }
  async loadReply(params){
    console.log('params')
    if(_isEmpty(params)){
      params = {vtype: this.vtype, page: this.page, skid: this.skid}
    }else{
      if(!params.hasOwnProperty('vtype')){
        params['vtype'] = this.vtype
      }

      if(!params.hasOwnProperty('page')){
        params['page'] = this.page
      }
      if(!params.hasOwnProperty('skid')){
        params['skid'] = this.skid
      }
    }
    params = Object.assign(params, this.sparam);
    console.log(this.sparam)
    console.log(params)
    wx.showLoading({title:"数据加载中"})
    this.onReachBottomAble = false
    this.$apply()
    let res_3 = await apis.apiFetch(apis.API_BASE_URL + this.loadReplyUrl, params);
    wx.hideLoading()
    if(res_3.errcode == 0){
        res_3.errmsg.data
        let viewdatalist_tmp  = this.viewdatalist
        let viewdatalist  = res_3.errmsg.data
        if(_isEmpty(viewdatalist_tmp)){
          this.viewdatalist = viewdatalist
        }else{
          this.viewdatalist = viewdatalist_tmp.concat(viewdatalist)
        }
        this.page =   res_3.errmsg.page_info.page - 0 + 1
        this.total_number = res_3.errmsg.page_info.total_number
        if(_size(res_3.errmsg.data)==10){
          this.onReachBottomAble = true
        }else{
          this.onLoadAll = true
        }
        this.$apply()
    }
  }
  async onReachBottom(){
    if(this.onReachBottomAble){
       this.loadReply({skid: this.skid, page: this.page})
    }
  }
  initLoadMoreFn(){
    this.onReachBottomAble = false
    this.onLoadAll = false
    this.$apply()
  }
}
