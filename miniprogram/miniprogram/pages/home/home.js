// pages/home/home.js
let app = getApp();
const user =  wx.cloud.database().collection('userlist');

Page({
  data: {
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  onShow: function () {
    
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']&&res.authSetting['scope.userLocation']) {
          wx.getUserInfo({
            success: function (res) {
              wx.switchTab({
                url: '../go/go'
              })
            }
          });
        }

      }
    })
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      wx.showModal({
        title: '提示',
        content: '你已成功授权小程序获取你的公开信息，退出小程序时可在右上角打开设置并关闭权限',
        showCancel: false,
        confirmText: '了解',
      })
      console.log(e.detail.userInfo)
      //用户按了允许授权按钮
      wx.reLaunch({
        url: '../myInfo/myInfo',
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '你已拒绝小程序获取你的公开信息，将无法使用About Me页面',
        showCancel: false,
        confirmText: '返回授权',
      })
    }
  },


})