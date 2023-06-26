import request from "../utils/request";

export default class adminApi {
  /**
   * 添加管理员
   * @param {Object} admin 管理员实体类
   * @returns 添加结果
   */
  createAdmin(admin) {
    return request({
      url: "/admin/create",
      method: "POST",
      data: admin,
    });
  }

  /**
   * 修改管理员
   * @param {Object} admin 管理员实体类
   * @returns 修改结果
   */
  updateAdmin(admin) {
    return request({
      url: "/admin/update",
      method: "POST",
      data: admin,
    });
  }

  /**
   * 删除管理员
   * @param {String} id 管理员ID
   * @returns 删除结果
   */
  deleteAdmin(id) {
    return request({
      url: `/admin/delete/${id}`,
      method: "DELETE",
    });
  }

  /**
   * 分页查询管理员
   * @param {Number} pageNo 查询页码
   * @param {Number} pageSize 查询条数
   * @returns 已分页的管理员集合
   */
  pageQuery(pageNo, pageSize) {
    return request({
      url: `/admin/page?pageNo=${pageNo}&pageSize=${pageSize}`,
      method: "GET",
    });
  }

  findAdminAndRole(id) {
    return request({
      url: `/admin/${id}`,
      method: "GET",
    });
  }
}
