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
          component: () => import("@/views/pages/home/Dashboard.vue"),
        },
        {
          path: "/data/courseData",
          name: "courseData",
          component: () => import("@/views/pages/data/courseData.vue"),
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

export default router;
