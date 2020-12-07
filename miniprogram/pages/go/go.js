//语音插件
const history = wx.cloud.database().collection('history');
var plugin1 = requirePlugin("WechatSI"),
    QQMap = require('../../utils/qqmap-wx-jssdk');
let manager = plugin1.getRecordRecognitionManager()
var places = {
        餐饮: [],
        娱乐: [],
        购物: []
    },
    t_str = '',
    [eat_list, play_list, buy_list, list] = [
        [],
        [],
        [],
        []
    ],
    qqMap = new QQMap({
        key: 'AIEBZ-MUFLJ-6UVFL-K5PEI-LVM56-BMFHJ'
    });
Page({
    /**
     * 页面的初始数据
     */
    data: {
        //设置标记点
        markers: [{
            id: 1,
            iconPath: "/image/run.png",
            width: "60rpx",
            height: "60rpx",
            latitude: 31.25696587456597,
            longitude: 121.65518174913194
        }],
        latitude: 31.25696587456597,
        longitude: 121.65518174913194,
        show_map: true,
        place: [],
        show_place: false,
    },

    onLoad: function () {

        wx.getLocation({
            type: 'gcj02',
            success: async (res) => {
                let latitude = Number(res.latitude)
                let longitude = Number(res.longitude)
                this.setData({
                    latitude: latitude,
                    longitude: longitude,
                });
                await this.set_Data(longitude, latitude);
                wx.createMapContext('myMap').moveToLocation();
            }
        })
    },
    set_Data: async function (longitude, latitude) {
        var that = this;
        wx.createMapContext('myMap').translateMarker({
            markerId: 1,
            destination: {
                longitude: longitude,
                latitude: latitude
            },
            duration: 333,
            animationEnd() {
                that.setData({
                    markers: [{
                        id: 1,
                        iconPath: "/image/run.png",
                        width: "60rpx",
                        height: "60rpx",
                        latitude: latitude,
                        longitude: longitude
                    }]
                })
            }
        })
        await this.search_place('餐饮', latitude, longitude, 'http://store.is.autonavi.com/showpic/a33fd948e7fd4379b3a16465a23c18e2')
        await this.search_place('娱乐', latitude, longitude, 'http://store.is.autonavi.com/showpic/16e65829460632a2a0112a13089e1101')
        await this.search_place('购物', latitude, longitude, 'http://store.is.autonavi.com/showpic/46e4601217d437bbf73a8a5d0f5af0a3')
    },
    search_place: async function (keyword, latitude, longitude, photo_url) {
        qqMap.search({
            keyword: keyword,
            location: {
                latitude: latitude,
                longitude: longitude
            },
            address_format: 'short',
            page_size: 20,
            auto_extend: 0,
            success: async function (d) {
                var res = d.data
                for (var i in res) {
                    await history.where({
                        id: res[i].id
                    }).field({
                        value: true,
                        _id: false,
                        photo_url: true,
                        cost: true,
                        time: true,
                        rank: true
                    }).limit(1).get().then(t_res => {
                        var data = t_res.data;
                        if (!data.length) {
                            places[keyword][i] = {
                                value: res[i].title.slice(0, 13),
                                photo_url: photo_url,
                                cost: '50+',
                                time: '10:00-20:00',
                                distance: res[i]._distance,
                                location: res[i].location,
                                id: res[i].id,
                                rank: Math.floor(Math.random() * 80) + 10 - Math.floor(res[i]._distance * Math.random()) % 10
                            }
                        } else {
                            data = data[0]
                            places[keyword][i] = {
                                value: data.value,
                                photo_url: data.photo_url,
                                cost: data.cost,
                                time: data.time,
                                distance: res[i]._distance,
                                location: res[i].location,
                                id: res[i].id,
                                rank: data.rank
                            }
                        }
                    })

                }
            }
        })
    },
    onReady: function () {},
    onShow: function () {
        //选择位置，需要用户授权
        var that = this;
        wx.authorize({
            scope: 'scope.userLocation',
            success() {
                that.setData({
                    show_map: true
                })
            },
            fail() {
                wx.showToast({
                    icon: 'close',
                    title: '请开启位置权限',
                })
                that.setData({
                    show_map: false
                })
            },
        })
    },

    go: async function () {
        var that = this;
        if (!places['餐饮'].length) {
            wx.showModal({
                title: '定位失败啦',
                content: '请稍等片刻或点击左上角图标开始定位',
                showCancel: false,
                confirmText: '好的',
            })
            return;
        }
        this.checkList('餐饮');
        this.checkList('购物');
        this.checkList('娱乐');
        var list = play_list.concat(eat_list, buy_list).slice(0, 11)
        wx.setStorage({
                data: places,
                key: 'places',
            }),
            wx.navigateTo({
                url: '/pages/rec/rec',
                success: function (res) {
                    res.eventChannel.emit('send', {
                        list: list
                    })
                }
            })


    },

    checkList: async function (str) {
        switch (str) { //绝了
            case '餐饮':
                list = eat_list
                break;
            case '娱乐':
                list = play_list
                break;
            case '购物':
                list = buy_list
                break;
        }
        if (list.length > 4) {
            list.slice(4)
        } else {
            var t = places[str].filter(res => {
                return !list.includes(res.id)
            }).sort((a, b) => {
                return a.rank == b.rank ? a.distance < b.distance : a.rank < b.rank
            })

            for (let i = list.length, pos = 0; i < 4; i++) {
                list.push(t[pos++].id);
            }
        }
    },


    move: async function (e) {
        await this.set_Data(e.detail.longitude, e.detail.latitude);
    },

    back: function () {
        wx.createMapContext('myMap').moveToLocation();
        this.onLoad();
    },

    speak: function () {
        manager.onRecognize = function (res) {
            console.log("current result", res.result)
        }
        manager.onStop = function (res) {
            wx.showToast({
                title: '录音已结束',
                duration: 1000
            })
            let [address] = [res.result.slice(0, -1)];
            wx.navigateTo({
                url: '/pages/rec/rec',
                success: function (res) {
                    res.eventChannel.emit('send', {
                        address: address,
                    })
                }
            })
        }
        manager.onStart = function (res) {
            wx.showToast({
                title: '录音已开始',
                icon: 'mike'
            })
        }
        manager.start({
            duration: 4100,
            lang: "zh_CN"
        })
    },
    eat: function () {
        this.get_places('餐饮')
    },
    play: function () {
        this.get_places('娱乐')
    },
    buy: function () {
        this.get_places('购物')
    },
    get_places: async function (str) {
        //t_str用于判断是否重复点击组件

        if (t_str !== str) { //如果是重复点击，重复开关组件
            this.setData({
                show_place: false,
                place: places[str].sort((a, b) => {
                    return a.distance < b.distance
                })
            })
            t_str = str
        }
        await this.set_place(0)
        this.setData({
            show_place: !(this.data.show_place)
        })
    },
    onChange: async function (e) {
        console.log(e.detail.index)
        await this.set_place(e.detail.index)
    },
    onTabCLick: async function (e) {
        await this.set_place(e.detail.index)


    },
    set_place: async function (index) {
        var that = this,
            place = this.data.place;
        var data = places[t_str].filter(v => {
            return v.id === place[index]['id']
        })[0];
        place[index] = data

        that.setData({
            activeTab: index,
            place: place
        })
    },
    checkboxChange(e) {
        console.log(e.detail.value)
        switch (t_str) { //绝了
            case '餐饮':
                eat_list = e.detail.value
                break;
            case '娱乐':
                play_list = e.detail.value
                break;
            case '购物':
                buy_list = e.detail.value
                break;
        }
    }
})