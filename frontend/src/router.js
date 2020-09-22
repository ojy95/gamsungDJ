import Vue from "vue";
import VueRouter from "vue-router";
import AuthGuard from "./utils/auth.guard";
import { adminRoot } from "./constants/config";
import { UserRole } from "./utils/auth.roles";
import Login from "@/components/User/Login.vue"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: () => import(/* webpackChunkName: "home" */ "./views/home"),
    // redirect: `${adminRoot}/piaf`,
  },
  {
    path: adminRoot,
    component: () => import(/* webpackChunkName: "app" */ "./views/app"),
    redirect: `${adminRoot}/piaf`,
    meta: { loginRequired: true },
    /*
   define with Authorization :
   meta: { loginRequired: true, roles: [UserRole.Admin, UserRole.Editor] },
   */
    children: [
      {
        path: "piaf",
        component: () =>
          import(/* webpackChunkName: "piaf" */ "./views/app/piaf"),
        redirect: `${adminRoot}/piaf/start`,
        children: [
          {
            path: 'start',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/Start')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          {
            path: 'search/:keyword',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/Search')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          {
            path: 'songDetail/:songID',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/SongDetail')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          {
            path: 'albumDetail/:albumID',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/AlbumDetail')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          {
            path: 'artistDetail/:artistID',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/ArtistDetail')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          {
            path: 'profile',
            component: () => import(/* webpackChunkName: "piaf" */ './views/app/piaf/Profile')
            // meta: { roles: [UserRole.Admin, UserRole.Editor] },
          },
          
        ]
      },
      {
        path: "second-menu",
        component: () =>
          import(/* webpackChunkName: "second-menu" */ "./views/app/second-menu"),
        redirect: `${adminRoot}/second-menu/second`,
        children: [
          { path: 'second', component: () => import(/* webpackChunkName: "piaf" */ './views/app/second-menu/Second') }
        ]
      },


      {
        path: "single",
        component: () =>
          import(/* webpackChunkName: "single" */ "./views/app/single")
      }
    ]
  },
  {
    path: "/error",
    component: () => import(/* webpackChunkName: "error" */ "./views/Error")
  },
  {
    path: "/user",
    component: () => import(/* webpackChunkName: "user" */ "./views/user"),
    redirect: "/user/login",
    children: [
      {
        path: "login",
        component: () =>
          import(/* webpackChunkName: "user" */ "./views/user/Login")
      },
      {
        path: "register",
        component: () =>
          import(/* webpackChunkName: "user" */ "./views/user/Register")
      },
      {
        path: "forgot-password",
        component: () =>
          import(/* webpackChunkName: "user" */ "./views/user/ForgotPassword")
      },
      {
        path: "reset-password",
        component: () =>
          import(/* webpackChunkName: "user" */ "./views/user/ResetPassword")
      },

    ]
  },
  {
    path: "*",
    component: () => import(/* webpackChunkName: "error" */ "./views/Error")
  },
  {
    path: "/login",
    component: Login
  },
];

const router = new VueRouter({
  linkActiveClass: "active",
  routes,
  mode: "history",
});
router.beforeEach(AuthGuard);
export default router;