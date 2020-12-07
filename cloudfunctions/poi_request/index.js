// 云函数入口文件
const cloud = require('wx-server-sdk');
var crypto = require('crypto');
var urlencode = require('urlencode');
function sign(param, appsecret, signmethod) {
    if (signmethod != 'MD5') {
        return '';
    }
    var lists = [];
    var param_str = appsecret;
    for (item in param) {
        lists.push(item);
    }
    lists.sort();
    lists.forEach(function(key) {
        param_str += key + param[key];
    });
    param_str += appsecret;
    return genMd5(param_str);
}

function genMd5(text) {
    return crypto.createHash('md5').update(text, 'utf-8').digest('hex');
}


cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event) => {
  return sign(event.params, '4e0d1be81540c4d1f0868d329b3229467f071f6c', 'MD5')
}