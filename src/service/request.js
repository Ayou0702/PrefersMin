import axios from "axios";

// export const url = "http://47.113.216.83:8089"
// export const url = "http://45.128.209.37:11614"
export const url = "http://localhost:8089";

// 创建一个 Axios 实例
const service = axios.create({
  baseURL: url,
  timeout: 10000, // 请求超时时间
});

export default service;
