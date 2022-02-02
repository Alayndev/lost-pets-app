import { Router } from "@vaadin/router";

const router = new Router(document.querySelector("#root"));
router.setRoutes([
  { path: "/", component: "x-home-page" },
  { path: "/signin", component: "x-signin-page" },
]);
