var app = getApp()
Page({
  data:{
    cells: [
      [{name: '个人资料', text: '', access: true, fn: 'viewPersonInfo'}],
      [
        {name: '手机信息', text: '', access: true, fn: 'viewSystemInfo'},
        {name: '清除个人信息', text: '', access: false, fn: 'clearStorage'}
      ],
      [{name: '更新位置', text: '', access: true, fn: 'viewLocation'}],
      [{name: '关于', text: '', access: true, fn: 'viewAbount'}]
    ]
  },
  onLoad:function(options){},
  viewPersonInfo: function(){
    wx.showModal({
      title: '提示',
      content: 'Just Go正在申请收集您的个人信息，该信息保证仅将用于小程序内出行推荐功能。如涉及个人隐私或需要注销数据,请点击设置-清除个人信息',
      success (res) {
        if (res.confirm) {
          wx.redirectTo({
            url: "../personInfo/personInfo"
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  viewSystemInfo: function(){
		wx.redirectTo({
			url: "../systemInfo/systemInfo"
		})
  },
  viewLocation: function(){
		wx.redirectTo({
			url: "../location/location"
		})
  },
  clearStorage: function() {
    wx.showModal({
      title: '确认要清除',
      content: '清除缓存会删除浏览历史和收藏及个人资料',
      success: function(res) {
        if (res.confirm) {
          wx.clearStorage()
          app.initStorage()
          wx.showToast({
            title: '清除成功',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  },
  viewAbount: function() {
		wx.redirectTo({
			url: "../about/about"
		})
  }
})