import HomePage from "@/pages/home-page.vue";
import { authGuard } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from "vue-router";

const NotFoundPage = () => import("@/pages/not-found-page.vue");
const ProtectedPage = () => import("@/pages/protected-page.vue");
const AdminPage = () => import("@/pages/admin-page.vue");
const CallbackPage = () => import("@/pages/callback-page.vue");
const SetMachinesPage = () => import("@/pages/set-machines-page.vue");

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/protected",
    name: "protected",
    component: ProtectedPage,
    beforeEnter: authGuard, // can access this page only if authenticated
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPage,
    beforeEnter: authGuard, // can access this page only if authenticated
  },
  {
    path: "/set-machines/:userId:userName",
    name: "setMachines",
    component: SetMachinesPage,
    beforeEnter: authGuard, // can access this page only if authenticated
    props: true,
  },
  {
    path: "/callback",
    name: "callback",
    component: CallbackPage,
  },
  {
    path: "/:catchAll(.*)",
    name: "Not Found",
    component: NotFoundPage,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
