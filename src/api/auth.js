import request from "@/service/request";

export default class authApi {
  /**
   * 管理员登录
   * @param {String} userName 用户名
   * @param {String} passWord 密码
   * @returns 登录结果
   */
  login(userName, passWord) {
    return request.post("/auth/login", {
      userName: userName,
      passWord: passWord
    });
  }

  /**
   * 获取登录管理员的信息和权限菜单
   * @returns 登录管理员的信息和权限菜单
   */
  getLoginInfo() {
    return request.get("/auth/login_info");
  }

  /**
   * 根据菜单数组生成路由数组
   * @param {Object} router 路由对象
   * @param {Array} menu 菜单数组
   * @returns 路由数组
   */
  analysisMenu(router, menu) {
    let routers = [];
    // 根据获取到的menu生成根路由的子集
    for (let i = 0; i < menu.length; i++) {
      // 判断是否为目录
      if (menu[i].type === 1) {
        // 读取其子集
        for (let j = 0; j < menu[i].children.length; j++) {
          // 生成其路由
          let path = {
            path: menu[i].children[j].path, // 访问路径
            name: menu[i].children[j].name, // 路由名称
            component: () =>
              import(`../view/${menu[i].children[j].component}.vue`)
            // import("../view" + menu[i].children[j].component + ".vue"), // 组件路径
          };
          routers.push(path);
          router.addRoute("Main", path);
        }
      } else if (menu[i].type === 0) {
        // 无子级导航
        let path = {
          path: menu[i].path, // 访问路径
          name: menu[i].name, // 路由名称
          component: "../view" + menu[i].component + ".vue" // 组件路径
        };
        routers.push(path);
        router.addRoute("Main", path);
      }
    }
    sessionStorage.setItem("routers", JSON.stringify(routers));
  }

  /**
   * app页重新加载路由
   * @param {Object} router 路由对象
   */
  againRouter(router) {
    let routers = JSON.parse(sessionStorage.getItem("routers")) || [];
    for (let i = 0; i < routers.length; i++) {
      router.addRoute("Main", routers[i]);
    }
  }
}
