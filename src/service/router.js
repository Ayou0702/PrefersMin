import { createRouter, createWebHashHistory } from "vue-router";
import AppLayout from "@/layout/AppLayout.vue";
import cookie from "js-cookie";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "/",
          name: "dashboard",
          component: () => import("@/views/pages/home/Dashboard.vue"),
        },
      ],
    },
    {
      path: "/data",
      component: AppLayout,
      children: [
        {
          path: "/data/courseData",
          name: "courseData",
          component: () => import("@/views/pages/data/CourseData.vue"),
        },
        {
          path: "/data/teacherData",
          name: "teacherData",
          component: () => import("@/views/pages/data/TeacherData.vue"),
        },
        {
          path: "/data/scheduleData",
          name: "scheduleData",
          component: () => import("@/views/pages/data/ScheduleData.vue"),
        },
        {
          path: "/data/enterpriseData",
          name: "enterpriseData",
          component: () => import("@/views/pages/data/EnterpriseData.vue"),
        },
      ],
    },
    {
      path: "/util",
      component: AppLayout,
      children: [
        {
          path: "/util/moonPhoto",
          name: "moonPhoto",
          component: () => import("@/views/pages/util/MoonPhoto.vue"),
        },
        {
          path: "/util/cloudPhoto",
          name: "cloudPhoto",
          component: () => import("@/views/pages/util/CloudPhoto.vue"),
        },
      ],
    },
    {
      path: "/auth",
      children: [
        {
          path: "/auth/login",
          name: "login",
          component: () => import("@/views/pages/auth/Login.vue"),
        },
        {
          path: "/auth/register",
          name: "register",
          component: () => import("@/views/pages/auth/Register.vue"),
        },
      ],
    },
    {
      path: "/controller",
      component: AppLayout,
      children: [
        {
          path: "/controller/permission",
          name: "permission",
          component: () =>
            import("@/views/pages/controller/PermissionController.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("@/views/pages/NotFound.vue"),
    },
  ],
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 未登录用户只允许访问登录页
  if (to.name !== "login" && cookie.get("tokenValue") == null) {
    return next({ name: "login" });
  }

  next();
});
export default router;
