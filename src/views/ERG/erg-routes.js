//引入 SFC 元件
import OPs from './OPs/OPs.vue';
import OPsWaveComparison from './OPs/OPsWaveComparison.vue';
import CWave from './CWave/CWave.vue';
import ABWaveComparison from './CWave/ABWaveComparison.vue';
import ABCWaveComparison from './CWave/ABCWaveComparison.vue';
import CWaveComparison from './CWave/CWaveComparison.vue';
import GroupingByCWaveData from './CWave/GroupingByCWaveData.vue';
import VEP from './VEP/VEP.vue';
import VEPWaveComparison from './VEP/VEPWaveComparison.vue';
import PhNR from './PhNR/PhNR.vue';
import PhNRWaveComparison from './PhNR/PhNRWaveComparison.vue';


//設定 orderRoutes 網址:
export default [
    {name: "ops-link", path: "/ERG/OPs", component: OPs},
    {name: "ops-waveComparison-link", path: "/ERG/OPsWaveComparison", component: OPsWaveComparison},
    {name: "cWave-link", path: "/ERG/CWave", component: CWave},
    {name: "abWave-comparison-link", path: "/ERG/ABWaveComparison", component: ABWaveComparison},
    {name: "abcWave-comparison-link", path: "/ERG/ABCWaveComparison", component: ABCWaveComparison},
    {name: "cWave-comparison-link", path: "/ERG/CWaveComparison", component: CWaveComparison},
    {name: "grouping-by-cWave-link", path: "/ERG/GroupingByCWaveData", component: GroupingByCWaveData},
    {name: "vep-link", path: "/ERG/VEP", component: VEP},
    {name: "vep-comparison-link", path: "/ERG/VEPWaveComparison", component: VEPWaveComparison},
    {name: "phnr-link", path: "/ERG/PhNR", component: PhNR},
    {name: "phnr-comparison-link", path: "/ERG/PhNRWaveComparison", component: PhNRWaveComparison}
];