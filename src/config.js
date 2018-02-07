// ENV
const env = 'production' // 'development' or 'production'
// WXAPP VERSION
const version = 2.0
const hosts = {
  development: 'https://wx.wwina.com.cn/zkmsys/index.php?s=',
  production: 'https://xcx.zhikemao.com/index.php?s='
}
// apis
const api = {
  user: {
    login: {
      method: 'POST',
      url: 'wp_authlogin'
    },
    baseurl: {
      method: 'POST',
      url: 'sq_'
    }
  }
}

module.exports = {
  env,
  version,
  hosts,
  api: disposeUrl(api, hosts[env])
}

function disposeUrl (obj, prefix) {
  Object.keys(obj).forEach(v => {
    if (obj[v].url) {
      obj[v].url = prefix + obj[v].url
    } else {
      obj[v] = disposeUrl(obj[v], prefix)
    }
  })

  return obj
}
