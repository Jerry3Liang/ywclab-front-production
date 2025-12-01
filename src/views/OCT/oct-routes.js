//引入 SFC 元件
import TotalLayer from './TotalLayer/TotalLayer.vue';
import FourLayer from './FourLayer/FourLayer.vue';


//設定 orderRoutes 網址:
export default [
    {name: "total-layer-link", path: "/OCT/TotalLayer", component: TotalLayer},
    {name: "four-layer-link", path: "/OCT/FourLayer", component: FourLayer}
];