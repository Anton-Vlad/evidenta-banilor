import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";
import Button from "primevue/button";
import FileUpload from "primevue/fileupload";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
// import ColumnGroup from 'primevue/columngroup';   // optional
// import Row from 'primevue/row';                   // optional
import InputText from "primevue/inputtext";

import "@/assets/main.css";
// import "primevue/resources/themes/lara-light-teal/theme.css";
import "primevue/resources/themes/lara-dark-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(PrimeVue);

app.component("Button", Button);
app.component("FileUpload", FileUpload);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("InputText", InputText);

app.mount("#app");
