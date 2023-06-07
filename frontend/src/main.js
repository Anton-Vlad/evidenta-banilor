import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";

import "@/assets/main.css";
// import "primevue/resources/themes/lara-light-teal/theme.css";
import "primevue/resources/themes/lara-dark-blue/theme.css";
import "primevue/resources/primevue.min.css";
// import "primeicons/primeicons.css";

const app = createApp(App);
app.use(PrimeVue);

app.component("Button", Button);
app.component("FileUpload", FileUpload);

app.mount("#app");
