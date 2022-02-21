import { Router } from "@vaadin/router";

const router = new Router(document.querySelector("#root"));
router.setRoutes([
  { path: "/", component: "x-home-page" },
  { path: "/login", component: "x-login-page" },
  { path: "/user-data", component: "x-user-data-page" },
  { path: "/user-pets", component: "x-user-pets-page" },
  { path: "/pet-data", component: "x-pet-data-page" },
]);
