import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import OldApp from "../views/OldApp.vue";
import AppLayout from "@/layout/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "/",
          name: "Home",
          component: HomeView,
        },
      ],
    },
    {
      path: "/old",
      name: "OldApp",
      component: OldApp,
    },
  ],
});

export default router;
