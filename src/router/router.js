//引入 vue-orderRoutes 函式庫
import { createRouter, createWebHistory } from "vue-router";

// //引入 SFC 元件
import Home from '../views/Home.vue';
import NotFound from '../views/NotFound.vue';
import UpdateFileNameExceptCWave from '../views/UpdateFileNameExceptCWave.vue';
import Member from '@/views/Member/member-routes.js';
import ERG from '@/views/ERG/erg-routes.js';
import OCT from '@/views/OCT/oct-routes.js';
import PLR from '@/views/PLR/plr-routes.js';
import PartTimeJob from '@/views/PartTimeJob/parttimejob-routes.js';

//設定 orderRoutes 網址:
const routes = [
    { name: "home-link", path: "/", component: Home },
    { name: "notfound-link", path: "/:pathMatch(.*)*", component: NotFound },
    { name: "updateFileNameExceptCWave-link", path: "/UpdateFileNameExceptCWave", component: UpdateFileNameExceptCWave },
    ...Member,
    ...ERG,
    ...OCT,
    ...PLR,
    ...PartTimeJob
];

//產生 orderRoutes 物件
export default createRouter({
    routes,
    history: createWebHistory()
});