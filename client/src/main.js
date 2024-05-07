import { createAuth0 } from "@auth0/auth0-vue";
import { createApp } from "vue";
import App from "./app.vue";
import "./assets/css/styles.css";
import router from "./router/index";

const app = createApp(App);

app
  .use(router)
  .use(
    // Initialize Auth0 with enviroment variables in .env file
    createAuth0({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        redirect_uri: import.meta.env.VITE_AUTH0_CALLBACK_URL,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "openid profile email manage:users read:machines",
      },
    })
  )
  .mount("#root");
