import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import OldApp from "../views/OldApp.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },
    {
      path: "/old",
      name: "OldApp",
      component: OldApp,
    },
  ],
});

export default router;
