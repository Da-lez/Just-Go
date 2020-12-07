//语音插件
const map = wx.cloud.database().collection('map'),
    util = require('../../utils/share');
var plugin1 = requirePlugin("WechatSI"),
    QQMap = require('../../utils/qqmap-wx-jssdk');
var manager = plugin1.getRecordRecognitionManager(),
    places = {
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
    }),
    flag = false;
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
            longitude: 120,
            latitude: 30
        }],
        show_map: true,
        place: [],
        show_place: false,
    },
    /**

    用户点击右上角分享

    */

    onShareAppMessage: function (option) {

        console.log(option);

        let obj = {

            title: 'Just Go!',

            path: 'pages/go/go',

            imageUrl: '../../image/bg.jpg'

        };

        return util.shareEvent(option, obj);

    },
    onLoad: function () {
        var that = this;
        wx.getLocation({
            type: 'gcj02',
            success: res => {
                that.set_location(Number(res.longitude), Number(res.latitude)).then(() => {
                    wx.createMapContext('myMap').moveToLocation();
                    that.set_Data(that.data.longitude, that.data.latitude)
                }).then(() => {
                    flag = true
                });
            },
        })

    },
    set_location: async function (longitude, latitude) {
        this.setData({
            latitude,
            longitude
        })

    },
    set_Data: function (longitude, latitude) {
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

        for (let i in places)
            this.search_place(i, latitude, longitude)
    },
    search_place: async function (keyword, latitude, longitude) { //查找地点
        var that = this;
        qqMap.search({
            keyword: keyword,
            location: {
                latitude: latitude,
                longitude: longitude
            },
            address_format: 'short',
            page_size: 20,
            auto_extend: 0,
            success: function (d) {
                var res = d.data
                for (var i in res)
                    that.check_place(i, keyword, res[i]) //与数据库核对
            }
        })
    },
    check_place: async function (i, keyword, res) {
        var that = this;
        await map.where({
            _id: res.id
        }).field({
            value: true,
            _id: false,
            photo_url: true,
            cost: true,
            time: true,
            rank: true,
            id: true
        }).limit(1).get().then(t_res => {
            var data = t_res.data;
            if (!data.length) that.place_init(i, keyword, res, res) //如果数据库中没有
            else
                that.place_init(i, keyword, data[0], res)
        })
    },
    place_init: function (i, keyword, data, res) {
        places[keyword][i] = ({ //数据库中的数据是否存在?否就取默认数据
            value: data.value ? data.value : data.title.slice(0, 12),
            photo_url: data.photo_url ? data.photo_url : '',
            cost: data.cost ? data.cost : '50+',
            time: data.time ? data.time : '10:10',
            distance: res._distance,
            location: res.location,
            id: res.id,
            rank: data.rank ? data.rank : Math.floor(Math.random() * 80) + 10 - Math.floor(data._distance * Math.random()) % 10
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

    go: function () {
        console.log(flag)
        if (Math.max(places['娱乐'].length, places['购物'].length, places['餐饮'].length) < 13) {
            wx.showToast({
                title: '努力加载中',
                icon: 'loading'
            })
            return
        }

        this.check().then(() => {
            var list = play_list.concat(eat_list, buy_list).slice(0, 12)
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
        })

    },
    check: async function () {
        for (let i in places) this.checkList(i)
    },
    checkList: function (str) {
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


    move: function (e) {
        this.setData({
            show_place: false
        })
        this.set_Data(e.detail.longitude, e.detail.latitude);
        wx.showToast({
            title: '搜索地图中',
            icon: 'loading'
        })
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

    onChange: function (e) {
        console.log(e.detail.index)
        this.set_place(e.detail.index)
    },
    onTabCLick: function (e) {
        this.set_place(e.detail.index)
    },
    //三个窗口点击函数
    get_places: function (str) {
        if (places[str].length < 11) {
            wx.showToast({
                title: '努力加载中',
                icon: 'loading'
            })
            return
        }
        var that = this;
        //t_str用于判断是否重复点击组件
        if (t_str !== str) { //如果不是重复点击，进入if更新数据,窗口先关掉再开,否则直接对show_place取反
            this.setData({
                place: places[str].sort((a, b) => {
                    return a.distance < b.distance
                }),
                show_place: false,
            })
            t_str = str
        }
        this.set_place(0).then(() => that.setData({
            show_place: !(this.data.show_place)
        }))
    },
    //place是窗口用于展示的数据,分别为右侧数据和activeTab
    set_place: async function (index) {
        var place = this.data.place;
        if (place[index]) {
            var data = places[t_str].filter(v => {
                return v.id === place[index]['id']
            })[0];
            place[index] = data
        }
        this.setData({
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