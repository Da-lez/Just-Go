let key = 'AIEBZ-MUFLJ-6UVFL-K5PEI-LVM56-BMFHJ',
  referer = 'justgo',
  plugin2 = requirePlugin('routePlan');
const history = wx.cloud.database().collection('history'),
  util = require('../../utils/share');;
const map = wx.cloud.database().collection('map');
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
  onShareAppMessage: function (option) {

    console.log(option);

    let obj = {

      title: 'Just Go!',

      path: 'pages/go/go',

      imageUrl: '../../image/bg.jpg'

    };

    return util.shareEvent(option, obj);

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
      str_list = ['餐饮', '娱乐', '购物'],
      that = this;
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
    place.forEach(e => {
      that.set_Data(e[0])
    })
    this.setData({
      cells: place
    })



  },
  set_Data: async function (e) {

    let date = new Date().toLocaleDateString();
    e.rank += (Math.floor(e.rank * Math.random()) % 5)
    e.date = date
    e._id = id + date + e.value
    await history.where({
      _id: e._id
    }).count().then(cnt => {
      if (!cnt.total)
        history.add({
          data: e
        })

    })
    await map.where({
      _id: e.id
    }).count().then(cnt => {
      if (!cnt.total)
        map.add({
          data: {
            _id: e.id,
            value: e.value,
            photo_url: e.photo_url,
            time: e.time,
            cost: e.cost,
            location: e.location,
            rank: e.rank
          }
        })

    })
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