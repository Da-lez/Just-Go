let key = 'AIEBZ-MUFLJ-6UVFL-K5PEI-LVM56-BMFHJ',
  referer = 'justgo',
  plugin2 = requirePlugin('routePlan');
const history = wx.cloud.database().collection('history');
var id = '',
  places = {};
Page({

  /**
   * 页面的初始数据
   */

  data: {
    cells: [],
    show: 'hotest'
  },
  changeViewType: function (e) {
    var data = e.currentTarget.dataset
    this.setData({
      show: data.type,
    })
  },
  go_navi: function (e) {
    var [name, latitude, longitude] = [e.currentTarget.dataset.type.value, e.currentTarget.dataset.type.location.lat, e.currentTarget.dataset.type.location.lng]
    var endPoint = JSON.stringify({ //终点
      'name': name,
      'latitude': latitude,
      'longitude': longitude
    });
    wx.navigateTo({
      url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.set_Data1()
    setTimeout(this.set_Data2, 500)
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
  },
  set_Data1: function () {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        id = res.result.openid;
      }
    })
    wx.getStorage({
      key: 'places',
      success: res => {
        places = res.data
      }
    })
    wx.showToast({
      title: '推荐成功',
    })
  },
  set_Data2: async function () {
    var place = [],
      str_list = ['餐饮', '娱乐', '购物'];
    this.getOpenerEventChannel().on('send', function (data) {
      data.list.forEach(e => {
        str_list.forEach(str => {
          for (var i = 0; e != places[str][i].id; i++) {
            if (i === places[str].length - 1) return;
          }
          places[str][i].access = true;
          places[str][i].fn = 'go_navi';
          place.push([places[str][i]])
        })
      });
    })
    let date = new Date().toLocaleDateString();
    place.forEach(e => {
      e[0].rank += (Math.floor(e[0].rank * Math.random()) % 5)
      e[0].date = date
      e[0]._id = id + date + e[0].value
    })
    this.setData({
      cells: place
    })

    try {
      place.forEach(e => {
        history.add({
          data: e[0]
        })
      })
    } catch (error) {

    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})