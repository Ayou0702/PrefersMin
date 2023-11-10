import axios from "axios";
import cookie from "js-cookie";
import router from "./router";

export const url = "http://localhost:8089";

// Axios 实例
const service = axios.create({
  baseURL: url,
  timeout: 10000 // 请求超时时间
});

// 设置cross跨域 并设置访问权限 允许跨域携带cookie信息,使用JWT可关闭
service.defaults.withCredentials = false;

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 将cookie中的token设置在请求头中
    if (cookie.get("tokenValue") !== "" || cookie.get("tokenValue") != null) {
      config.headers["token"] = cookie.get("tokenValue");
    }
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    let code = res.data.code;  // 获取后端返回的状态码
    if (code === 401) {           // token失效
      cookie.remove("tokenValue"); // 移除cookie
      cookie.remove("menu");
      cookie.remove("loginAdmin");
      // 页面跳转
      router.push({
        path: "/auth/login",
        query: {
          message: "paramValue", // 要传递的参数名和值
        },
      });
    }
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
