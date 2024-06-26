import HomePage from "@/pages/home-page.vue";
import { authGuard } from "@auth0/auth0-vue";
import { createRouter, createWebHistory } from "vue-router";

const NotFoundPage = () => import("@/pages/not-found-page.vue");
const ProtectedPage = () => import("@/pages/protected-page.vue");
const AfterSignupPage = () => import("@/pages/after-signup-page.vue")
const AdminPage = () => import("@/pages/admin-page.vue");
const CallbackPage = () => import("@/pages/callback-page.vue");
const SetMachinesPage = () => import("@/pages/set-machines-page.vue");
const MachineConnectionPage = () => import("@/pages/machine-connection-page.vue");
const ProfilesPage = () => import("@/pages/profiles-page.vue");

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
    path: "/userCreation",
    name: "userCreation",
    component: AfterSignupPage,
    beforeEnter: authGuard, // can access this page only if authenticated
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminPage,
    beforeEnter: authGuard, // can access this page only if authenticated
  },
  {
    path: "/set-users/:roleId:roleName",
    name: "setUsers",
    component: ProfilesPage,
    beforeEnter: authGuard, // can access this page only if authenticated
    props: true,
  },
  {
    path: "/set-machines/:roleId:roleName",
    name: "setMachines",
    component: SetMachinesPage,
    beforeEnter: authGuard, // can access this page only if authenticated
    props: true,
  },
  {
    path: "/connect/:machineId:machineName",
    name: "connectToMachine",
    component: MachineConnectionPage,
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
