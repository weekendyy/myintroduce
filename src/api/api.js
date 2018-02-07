import wepy from 'wepy';
import _isEmpty from 'lodash.isempty';
import _size from 'lodash.size';
import _forEach from 'lodash.foreach';
import interfaces from '../interfaces'
import { api } from '../config'
import { hosts } from '../config'
const host = 'https://wx.zhikemiao.com/sq_';
const hostip = '192.168.3.100'
const mockhost = 'http://www.doclever.cn:8090/mock/5a1522d06e367a22c06846b2/'
const mock_host = 'http://'+ hostip +'/gitlab/team/git_sys/index.php?s=sq_'
const mock_host_base = 'http://'+ hostip +'/gitlab/team/git_sys/index.php?s='
const API_BASE_URL = api.user.baseurl.url;
const API_HOST_URL = hosts;
const API_BASE_URL_PATH = 'fr-zk_mail-index-'
const VERSION = '2.1.7'
const FakeAuthorization = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImp0aSI6Ind4YmY2NGJkYWIzNzlmY2RjZSJ9.eyJpc3MiOiJodHRwOlwvXC93eC56aGlrZW1pYW8uY29tIiwianRpIjoid3hiZjY0YmRhYjM3OWZjZGNlIiwiaWF0IjoxNTE1OTg0MDc0LCJuYmYiOjE1MTU5ODQxMzQsImV4cCI6MTUxNTk4NzY3NCwib3BlbmlkIjoib18xZ0F3QXBpT2E2NWx5TFZkLXdSd0U1VUZsMCIsInd4aWQiOiJ3eGJmNjRiZGFiMzc5ZmNkY2UiLCJ1aWQiOjEyLCJub25jZV9zdHIiOiJqclJnZTRQa2pwS25uMFBjIn0.S_TbEuhMpDcmzv5g9Q6snj_P5Zsckl7YnDqjyjJFQxw'
const wxRequest = async (params = {}, url) => {
    let res = await wepy.request({
        url: url,
        method: params.method || 'GET',
        data: params.data || {},
        header: {'Content-Type': 'application/json'},
    });
    wx.hideToast();
    return res;
};
const apiFetch = async (url, params = {}, method = 'POST') => {
  // console.log(url)

  // if(url.indexOf('#fake')>0){
  //    let idx = url.split('s=');
  //    console.log(idx)
  //    url = mock_host_base  +idx[1];
  // } 


  // if(url == API_BASE_URL + 'v2_drp_index'){
  //   url = mock_host  +  'v2_drp_index';
  // }

  if(wx.getExtConfig) {
        let resConfig = await wepy.getExtConfig()
        let extAppid = resConfig.extConfig.extAppid
        let scene = await wepy.getStorageSync('scene')
        // if(_isEmpty(scene)){
        //   scene = 'noAuth'
        // }
        if(_isEmpty(scene)){
          scene = '11004'
        }
      let pages = getCurrentPages()    //获取加载的页面
      let currentPage = pages[pages.length-1]    //获取当前页面的对象
      let purl = currentPage.route    //当前页面url
      if(_isEmpty(params)){
          params = {
            iswxapp: 2,
            // scene: scene,
            wxappid: extAppid,
            extwxid: extAppid,
            ref: purl
          }
      }else{
          // params.scene = scene;
          params.iswxapp = 2;
          params.wxappid = extAppid;
          params.extwxid = extAppid;
          params.ref = purl;
      }
      params.appscene = wepy.getStorageSync('app_load_scene');

      let Authorization = wepy.getStorageSync('_jwtoken')
      if(_isEmpty(Authorization)){
        Authorization = ''
      }
      // if(url.indexOf('!FakeAuthorization')>0){
      //    Authorization = FakeAuthorization
      // }
      try{
          if(url.indexOf('!showloading')>0){
              wx.showLoading({
                title: '加载中',
              })
          }
          console.log('url='+url)
         let res = await wepy.request({
            url: url,
            method: method,
            data: params || {},
            header: {'Content-Type': 'application/json','Authorization': Authorization},
        });
        if(url.indexOf('!showloading')>0){
          wx.hideLoading()
        }
        if(res.data.errcode == 30001){
            wx.showModal({
              title: '系统提示',
              content: res.data.errmsg
            })
            return {'errcode':1}
        }
        if(res.data.errcode == 2001){
            await wepy.removeStorageSync('_jwtoken')
        }
        return res.data;
      }catch(e){
        let res = await wepy.request({
            url: url,
            method: method,
            data: params || {},
            header: {'Content-Type': 'application/json','Authorization': Authorization},
        });
        if(res.hasOwnProperty('errMsg')){
          console.log('retry')
          console.log(res.errMsg)
        }
        if(res.data.errcode == 30001){
            wx.showModal({
              title: '系统提示',
              content: res.data.errmsg
            })
            return {'errcode':1}
        }
        if(res.data.errcode == 2001){
            await wepy.removeStorageSync('_jwtoken')
        }
        return res.data;
      }

    }else{
      wx.showModal({
        title: '微信版本过低',
        content: '请先更新微信'
      })
    }
};
const checkLogin = async (params = {}, url) => {
  let _jwtoken =  wepy.getStorageSync('_jwtoken')
  if(_size(_jwtoken)>0){
    let _jwtoken_arr = _jwtoken.split('.');
    if(_size(_jwtoken_arr)==3){
      return true;
    }
  }
  wx.navigateTo({
    url: '/pages/common/btnlogin'
  })
  return false;
};
const checkAccessToken = async (params = {}, url) => {
  let _jwtoken = await wepy.getStorageSync('_jwtoken')
  // console.log(_jwtoken)
  // return _jwtoken;
  if(_size(_jwtoken)>0){
    let _jwtoken_arr = _jwtoken.split('.');
    if(_size(_jwtoken_arr)==3){
      return _jwtoken;
    }
  }
  return false;
};
const navMap = async(lat, lng, maptitle, mapsubtitle) =>{
  wx.getSetting({
        success(res) {
            if (!res.authSetting['scope.userLocation']) {
              console.log("scope.userLocation")
                wx.authorize({
                    scope: 'scope.userLocation',
                    success() {
                       wx.openLocation({
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lng),
                        name: maptitle,
                        address: mapsubtitle,
                        scale: 28
                      })
                    }
                })
            }else{
              wx.openLocation({
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                name: maptitle,
                address: mapsubtitle,
                scale: 28
              })
            }
        }
      })
}
const navTrans = (pageurl) => {
  if(pageurl.substr(0,1) != '/'){
    pageurl = '/'+pageurl
  }
  pageurl = pageurl.replace(/\/pages\/coupon/, "/subPackages\/coupon")
  pageurl = pageurl.replace(/\/pages\/webview/, "/subPackages\/webview")
  pageurl = pageurl.replace(/\/pages\/article/, "/subPackages\/article")
  pageurl = pageurl.replace(/\/pages\/market\/fxcenter/, "/subPackages\/drp\/index")
  pageurl = pageurl.replace(/\/pages\/market\/fxcenter/, "/subPackages\/drp\/index")
  return pageurl;
}


const navTo = async (pageurl, isRedirect) => {
  if(_isEmpty(pageurl)){
      wepy.showModal({
            title: '提示',
            content: `请先设置跳转链接~\n\n...`,
            showCancel: false,
            confirmText: '好的',
            confirmColor: '#666666'
        })
      return
  }
  let router_map = getCurrentPages();
  pageurl = await navTrans(pageurl)
  if(isRedirect){
    wx.redirectTo({
      url: pageurl
    })
    return 
  }
  console.log(pageurl)
  wx.navigateTo({
            url: pageurl,
            fail: function() {
                let taburl = pageurl.split('?')
                let navTaburl = taburl[0]
                wx.switchTab({
                    url: navTaburl,
                    fail: function() {
                        wx.redirectTo({
                          url: pageurl,
                          fail: function() {
                            wx.showModal({
                                  title: '跳转页面出错',
                                  content: '当前链接跳转出现问题，无法跳转',
                                  showCancel: false
                                })
                          }
                        })
                    }
                })
            }
        })
};
const sysConfig = async () => {
  if(wx.setNavigationBarColor){
      let pageHeaderConfig = await wepy.getStorageSync('pageHeaderConfig')
      console.log(pageHeaderConfig)
      if(pageHeaderConfig){
        if(pageHeaderConfig.hasOwnProperty("backgroundColor")&&pageHeaderConfig.hasOwnProperty("frontColor")){
            wx.setNavigationBarColor({
              frontColor: pageHeaderConfig.frontColor,
              backgroundColor: pageHeaderConfig.backgroundColor,
              animation: {
                  duration: 400,
                  timingFunc: 'easeIn'
              }
          })
        }
      }

    }
};
const showBtns = (position) => {
  return {
            position: position,
            buttons: [
                {
                    label: '分类',
                    icon: "http://oo6nt6u5x.bkt.clouddn.com/scapp.png",
                    linktype: 1,
                    val: "/pages/cate-index/index",
                },
                {
                    label: '首页',
                    icon: "http://oo6nt6u5x.bkt.clouddn.com/schome.png",
                    linktype: 1,
                    val: "/pages/index/index",
                },
                {
                    label: '搜索',
                    icon: "http://oo6nt6u5x.bkt.clouddn.com/scsearch.png",
                    linktype: 1,
                    val: "/pages/cate-index/search2",
                }
            ],
            buttonClicked(index, item) {
              if(item.linktype == 1){
                navTo(item.val)
              }
              return true
            },
            callback(vm, opened) {
                vm.setData({
                    opened,
                })
            },
        }
};
const fetchSetting = async (params = {}) => {
  let res = await apiFetch(API_BASE_URL + 'sys_gsetting#fake', params);
  return res;
};

const loadSetting =  async (opt = {})=>{
    let Authorization = await wepy.getStorageSync('_jwtoken')
      if(_isEmpty(Authorization)){
        Authorization = ''
      }

    let  res = await apiFetch(API_HOST_URL.production + 'sys_setting#fake',{ver:20180109,appscene: opt.query.scene});
    // console.log(res.)
    if(res.errcode == 0){
       await wepy.setStorageSync('_sys_setting',(res.errmsg))
    }
    // this.$wxapp
    // this.$wxapp.globalData.setting = res.data.errmsg
    return res.errmsg
}
const scene_2_arr = (scene) => {
  if(_isEmpty(scene)){
    return []
  }else{
    let decode_str = decodeURIComponent(scene)
    let str_1_arr = decode_str.split('&')
    let scene_obj = {}
    _forEach(str_1_arr, function(val, index){
      let str_split = val.split('=')
        scene_obj[str_split[0]] = str_split[1]
    })
    return scene_obj
  }
  // console.log('scene='+ )
};

const buildShare = (title,path,successfn,errfn) =>{
  return {
      title: '自定义转发标题',
      path: '/page/user?id=123',
      success: function(res){
        successfn(res)
      },
      error: function(res){
        errfn(res)
      },

    }
}

module.exports = {
  API_HOST_URL,
  navTrans,
  scene_2_arr,
  buildShare,
  checkAccessToken,
  API_BASE_URL,
  API_BASE_URL_PATH,
  VERSION,
  apiFetch,
  loadSetting,
  checkLogin,
  showBtns,
  navTo,
  navMap,
  sysConfig,
  fetchSetting
};
