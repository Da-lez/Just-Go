var app = getApp();
Page({
  data: {
    gridList: [{
        enName: 'favorite',
        zhName: '收藏'
      },
      {
        enName: 'history',
        zhName: '浏览记录'
      },
      {
        enName: 'setting',
        zhName: '设置'
      }
    ],
  },
  onLoad: function (cb) {

  },
  onShow: function () {
    var that = this
    wx.getUserInfo({
      success: function (res) {
        that.setData({
          userInfo: res.userInfo
        })
      },
      fail: function (res) {
        wx.switchTab({
          url: '../home/home',
          success: function () {
            wx.showToast({
              image: '../../image/myInfo-active.png',
              title: '请先登陆',
            })
          }
        })
      }

    })

    typeof cb == 'function' && cb()

  },
  onPullDownRefresh: function () {
    this.onLoad(function () {
      wx.stopPullDownRefresh()
    })
  },
  viewGridDetail: function (e) {
    var data = e.currentTarget.dataset
    wx.navigateTo({
      url: "../" + data.url + '/' + data.url
    })
  }
})