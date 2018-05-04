const USER_ROLE_CONSTANT = {
	ADMIN: 'Administrator',
	NORMAL: 'Normal',
	SILENT: 'Silent',
	BLACK: 'Black'
}
/**
 * 管理员 权限: 发布topic + 正常用户权限
 * 正常用户 权限：浏览，发帖，点赞/踩/举报
 * 禁言用户 权限：浏览
 * 黑户： 权限：无法浏览
 */
const USER_ROLE = {
  ADMIN: { name: 'Administrator', read: true, write: false }, 
  NORMAL: { name: 'Normal', read: true, write: false },
  SILENT: { name: 'Silent', read: true, write: false },
  BLACK: { name: 'Black', read: true, write: false }
}

module.exports = {
	USER_ROLE,
	USER_ROLE_CONSTANT
}