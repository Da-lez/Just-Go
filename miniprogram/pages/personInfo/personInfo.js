const user = wx.cloud.database().collection('user');
var cells = [
  [],
  [],
  []
];
var id = '';
Page({
  data: {
    cells: []
  },
  esc: function (){
    wx.showModal({
      title: '提示',
      content: '该应用不会收集个人信息噢',
      showCancel: false,
      confirmText: '好的',
      success:res=>{
        wx.navigateBack({
          delta: 0,
        })
      }
    })
    
  },
  onShow: async function () {
    await this.get_data()
  },
  onLoad: function (options) {
    cells[0].push({
      name: '姓名',
      text: '未填写'
    })
    cells[0].push({
      name: '昵称',
      text: '未填写'
    })
    cells[0].push({
      name: '性别',
      text: '未填写'
    })
    cells[0].push({
      name: '年龄',
      text: '未填写'
    })
    cells[0].push({
      name: '生日',
      text: '未填写'
    })
    cells[0].push({
      name: '星座',
      text: '未填写'
    })
    cells[1].push({
      name: '公司',
      text: '未填写'
    })
    cells[1].push({
      name: '学校',
      text: '未填写'
    })
    cells[1].push({
      name: '手机号码',
      text: '未填写'
    })
    cells[1].push({
      name: '邮箱',
      text: '未填写'
    })
    cells[2].push({
      name: '个性签名',
      text: '未填写'
    });
    this.setData({
      cells
    });

    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        id = res.result.openid;
      }
    })


  },
  get_data: async function (id) {
    var that = this;
    await user.where({
      _id: id
    }).get().then(async res => {
      if (!res.data.length) return
      else await that.get_data2(res.data[0])
    });


  },
  get_data2: async function (data) {
    cells = [
      [],
      [],
      []
    ];
    cells[0].push({
      name: '姓名',
      text: data.name,
    })
    cells[0].push({
      name: '昵称',
      text: data.nickName,
    })
    cells[0].push({
      name: '性别',
      text: data.gender,
    })
    cells[0].push({
      name: '年龄',
      text: data.age,
    })
    cells[0].push({
      name: '生日',
      text: data.birthday,
    })
    cells[0].push({
      name: '星座',
      text: data.constellation,
    })
    cells[1].push({
      name: '公司',
      text: data.company,
    })
    cells[1].push({
      name: '学校',
      text: data.school,
    })
    cells[1].push({
      name: '手机号码',
      text: data.tel,
    })
    cells[1].push({
      name: '邮箱',
      text: data.email,
    })
    cells[2].push({
      name: '个性签名',
      text: data.intro,
    })

    this.setData({
      cells
    })
  }
})