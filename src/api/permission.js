import request from "../utils/request";

export default class permissionApi {
  /**
   * 添加菜单
   * @param {Object} permission 菜单实体类
   * @returns 添加结果
   */
  createNode(permission) {
    return request({
      url: "/permission/create",
      method: "POST",
      data: permission,
    });
  }

  /**
   * 修改菜单
   * @param {Object} permission 菜单实体类
   * @returns 修改结果
   */
  updateNode(permission) {
    return request({
      url: "/permission/update",
      method: "POST",
      data: permission,
    });
  }

  /**
   * 删除菜单
   * @param {String} id 菜单ID
   * @returns 删除结果
   */
  deleteNode(id) {
    return request({
      url: `/permission/delete/${id}`,
      method: "DELETE",
    });
  }

  /**
   * 获取预备父节点
   * @returns 可以作为父节点的菜单集合
   */
  getParentNodes() {
    return request({
      url: "/permission/parentNodes",
      method: "GET",
    });
  }

  /**
   * 获取已分级的菜单
   * @returns 菜单集合
   */
  getAllNode() {
    return request({
      url: "/permission/all",
      method: "GET",
    });
  }
}
