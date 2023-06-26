import request from "../utils/request";

export default class roleApi {
  /**
   * 添加角色
   * @param {Object} role 角色实体类
   * @returns 添加结果
   */
  createRole(role) {
    return request({
      url: "/role/create",
      method: "POST",
      data: role,
    });
  }

  /**
   * 修改角色
   * @param {Object} role 角色实体类
   * @returns 修改结果
   */
  updateRole(role) {
    return request({
      url: "/role/update",
      method: "POST",
      data: role,
    });
  }

  /**
   * 删除角色
   * @param {String} id 角色ID
   * @returns 删除结果
   */
  deleteRole(id) {
    return request({
      url: `/role/delete/${id}`,
      method: "DELETE",
    });
  }

  /**
   * 分页查询角色
   * @param {Number} pageNo 查询页码
   * @param {Number} pageSize 查询条数
   * @returns 已分页的角色集合
   */
  pageQuery(pageNo, pageSize) {
    return request({
      url: `/role/page?pageNo=${pageNo}&pageSize=${pageSize}`,
      method: "GET",
    });
  }

  /**
   * 查询所有角色，供给添加修改管理员中的角色下拉框
   * @returns 角色列表
   */
  findList() {
    return request({
      url: "/role/list",
      method: "GET",
    });
  }

  /**
   * 查询角色权限
   * @param {String} id 角色ID
   * @returns 根据角色ID查询其所管理的权限
   */
  queryPermission(id) {
    return request({
      url: `/role/query/permission/${id}`,
      method: "GET",
    });
  }
}
