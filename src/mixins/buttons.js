import wepy from 'wepy'
import * as apis from '../api/api.js'
import { $wuxButton } from '../components/wux/wux.js'
export default class btnMixin extends wepy.mixin {
  data = {
      opened: 0,
      backdrop: 0
  }
  initButton(position = 'bottomRight') {
      this.setData({
          opened: 1,
          backdrop: 1,
      })
      this.button = $wuxButton.init('br', apis.showBtns(position))
  }
}