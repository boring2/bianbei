const errorMap = {
  '403': '你没有该权限',
  '124': '请求超时'
}

exports.MyError = function MyError (code = 405, msg = '') {
  return {
    code: code,
    msg: errorMap[code] || msg
  }
}

