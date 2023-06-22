import { createRouter, createWebHashHistory } from "vue-router";
import AppLayout from "@/layout/AppLayout.vue";

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
          component: () => import("@/views/pages/home/Dashboard.vue")
        }
      ]
    },
    {
      path: "/data",
      component: AppLayout,
      children: [
        {
          path: "/data/courseData",
          name: "courseData",
          component: () => import("@/views/pages/data/CourseData.vue")
        },
        {
          path: "/data/teacherData",
          name: "teacherData",
          component: () => import("@/views/pages/data/TeacherData.vue")
        },
        {
          path: "/data/scheduleData",
          name: "scheduleData",
          component: () => import("@/views/pages/data/ScheduleData.vue")
        },
      ]
    },
    {
      path: "/data",
      component: AppLayout,
      children: [
        {
          path: "/util/moonPhoto",
          name: "moonPhoto",
          component: () => import("@/views/pages/util/MoonPhoto.vue")
        },
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      name: "notFound",
      component: () => import("@/views/pages/NotFound.vue")
    }
  ]
});

export default router;
