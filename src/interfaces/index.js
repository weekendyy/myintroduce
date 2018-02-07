import wepy from 'wepy'
import { hosts,api } from '../config'
import _isEmpty from 'lodash.isempty'
// // import * as apis from '../api/api'
// const mock_host_base = 'http://192.168.3.100/gitlab/team/git_sys/index.php?s='
const bindUserRefer  =  () => {
  let _refer_scene = wepy.getStorageSync('scene');
  let Authorization = wepy.getStorageSync('_jwtoken')
  if(!_isEmpty(_refer_scene)&&!_isEmpty(Authorization)){
    let appscene = wepy.getStorageSync('app_load_scene');
    let userinfo = wepy.request({
      url: hosts.production + 'fr-drp-index-bindrefer',
      method: 'post',
      dataType: 'json',
      header: {'Content-Type': 'application/json','Authorization': Authorization},
      data: {_scene: _refer_scene, appscene: appscene}
    })
  }
}
const interfaces = {
  async getUserInfo () {
    const loginData = await wepy.login()
    const userinfo = await wepy.getUserInfo()
    userinfo.code = loginData.code
    return userinfo
  },
  async initlogin () {
    console.log('initlogin')
    let self = this
    let extAppid = 'unsupport'
    if(wx.getExtConfig) {
      let resConfig = await wepy.getExtConfig()
      extAppid = resConfig.extConfig.extAppid
    }
    let userinfoRaw = {}
    let userinfo = {}
    const loginData = await wepy.login()
    try{
        userinfoRaw = await wepy.getUserInfo()
        userinfo = await wepy.request({
        url: hosts.production + 'sq_infologin',
        method: api.user.login.method,
        dataType: 'json',
        data: {wxid: extAppid, signature: userinfoRaw.signature, iv: userinfoRaw.iv, code: loginData.code, encryptedData: userinfoRaw.encryptedData, rawData: userinfoRaw.rawData,ver:70805}
      })
    }catch(e){
      userinfo = await wepy.request({
      url: hosts.production + 'sq_wxlogin',
      method: 'post',
      dataType: 'json',
      data: {wxid: extAppid, code: loginData.code,ver:70805}
    })
    }

    console.log(loginData)
    
    let response = userinfo.data
    if(response.errcode == 0){
      let access_token = response.errmsg.access_token
      if(response.errmsg.uid>0){
        console.log('response')
        await wepy.setStorageSync('_jwtoken',response.errmsg.access_token)
        await wepy.setStorageSync('_refer_uid',response.errmsg.uid)
        await wepy.setStorageSync('_jwtoken_login_time',Date.parse(new Date()) )
        await wepy.setStorageSync('_is_auth_login', response.errmsg.is_auth)
      
      }else{
         await wepy.setStorageSync('_jwtoken',response.errmsg.access_token)
      }
      bindUserRefer();
    }else{
      return '';
    }
  },
  async loadglobalSetting(opt){
    let Authorization = await wepy.getStorageSync('_jwtoken')
      if(_isEmpty(Authorization)){
        Authorization = ''
      }
    let res = await wepy.request({
      url:  hosts.production + 'sys_setting',
      // url: 'https://xcx.zhikemao.com/index.php?s=ds_login',
      method: 'post',
      dataType: 'json',
      data: {ver:20180109,appscene: opt.query.scene},
      header: {'Content-Type': 'application/json','Authorization': Authorization},
    })
    // console.log(res.)
    if(res.data.errcode == 0){
       await wepy.setStorageSync('_sys_setting',(res.data.errmsg))
    }
    // this.$wxapp
    // this.$wxapp.globalData.setting = res.data.errmsg
    return res.data.errmsg
  },
  async btnlogin (userinfoRaw) {
    let self = this
    let extAppid = 'unsupport'
    if(wx.getExtConfig) {
      let resConfig = await wepy.getExtConfig()
      extAppid = resConfig.extConfig.extAppid
    }
    let _jwtoken = await wepy.getStorageSync('_jwtoken')
    let userinfo = await wepy.request({
      url: hosts.production + 'sq_relogin',
      method: 'post',
      dataType: 'json',
      header: {'Content-Type': 'application/json','Authorization': _jwtoken},
      data: {wxid: extAppid, signature: userinfoRaw.signature, iv: userinfoRaw.iv, encryptedData: userinfoRaw.encryptedData, rawData: userinfoRaw.rawData,ver:70805}
    })
    let response = userinfo.data
    // await wepy.removeStorageSync('_jwtoken')
    // await wepy.removeStorageSync('_jwtoken_login_time')
    // await wepy.removeStorageSync('_refer_uid')
    if(response.errcode == 0){
  
      return true
    }else{
      return false;
    }
  },
  async login () {
    let userinfoRaw = {}
    let self = this
    let extAppid = 'unsupport'
    userinfoRaw = await interfaces.getUserInfo()
    if(wx.getExtConfig) {
      let resConfig = await wepy.getExtConfig()
      extAppid = resConfig.extConfig.extAppid
    }
    let userinfo = await wepy.request({
      url: api.user.login.url,
      method: api.user.login.method,
      dataType: 'json',
      data: {wxid: extAppid, signature: userinfoRaw.signature, iv: userinfoRaw.iv, code: userinfoRaw.code, encryptedData: userinfoRaw.encryptedData, rawData: userinfoRaw.rawData,ver:70805}
    })
    let response = userinfo.data
    await wepy.removeStorageSync('_jwtoken')
    await wepy.removeStorageSync('_jwtoken_login_time')
    await wepy.removeStorageSync('_refer_uid')
    if(response.errcode == 0){
      let access_token = response.errmsg.access_token
      if(response.errmsg.uid>0){
        await wepy.setStorage({
          key: '_jwtoken',
          data: response.errmsg.access_token
        })
        await wepy.setStorage({
          key: '_refer_uid',
          data: response.errmsg.uid
        })
        await wepy.setStorage({
          key: '_jwtoken_login_time',
          data: Date.parse(new Date())
        })
        
        return response.errmsg;
      }else{
        await wepy.setStorage({
          key: '_jwtoken',
          data: response.errmsg
        }) 
      }
    }else{
      return '';
    }
  }
}

export default interfaces
