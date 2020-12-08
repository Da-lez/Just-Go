/*
备注
city: 城市（在程序载入时获取一次）
count: 返回结果数量
baiduAK: 百度地图AK
apiList: api列表
hotKeyword: 搜索页热门关键词关键词
hotTag: 搜索页热门类型
bannerList: 首页（热映页）轮播图列表列表
skinList: “我的”页面背景列表
shakeSound: 摇一摇音效地址（带staticUrl表示远程地址）
shakeWelcomeImg: 摇一摇欢迎图片
*/
// 静态资源地址

// api地址
var apiUrl = 'https://sesine.com/mina/api'
module.exports = {
    city: '',
    count: 20,
    baiduAK: 'Y1R5guY8Y2GNRdDpLz7SUeM3QgADAXec',
    apiList: {
        popular: apiUrl + '/movie/in_theaters',
        coming: apiUrl + '/movie/coming_soon',
        top: apiUrl + '/movie/top250',
        search: {
            byKeyword: apiUrl + '/movie/search?q=',
            byTag: apiUrl + '/movie/search?tag='
        },
        filmDetail: apiUrl + '/movie/subject/',
        personDetail: apiUrl + '/movie/celebrity/',
        baiduMap: 'https://api.map.baidu.com/geocoder/v2/'
    }
}
