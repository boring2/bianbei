
/**
 * 管理员 权限: 发布topic + 正常用户权限
 * 正常用户 权限：浏览，发帖，点赞/踩/举报
 * 禁言用户 权限：浏览
 * 黑户： 权限：无法浏览
 */
const USER_ROLE = {
  ADMIN: { name: 'Administrator', read: true, write: false }, 
  NORMAL: { name: 'Normal', read: true, write: true },
  SILENT: { name: 'Silent', read: true, write: true },
  BLACK: { name: 'Black', read: true, write: true }
}

export {
  USER_ROLE
}
