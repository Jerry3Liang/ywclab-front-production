//引入 SFC 元件
import TimePicker from './TimePicker.vue';
import AllTimePickerList from './AllTimePickerList.vue';
import PersonalTimePickerList from './PersonalTimePickerList.vue';
import ReInsertEndTime from './ReInsertEndTime.vue';
import ReTimePicker from './ReTimePicker.vue';

//設定 orderRoutes 網址:
export default [
    {name: "partTimeJob-timePicker-link", path: "/TimePicker", component: TimePicker},
    {name: "partTimeJob-AllTimePickerList-link", path: "/AllTimePickerList", component: AllTimePickerList},
    {name: "partTimeJob-PersonalTimePickerList-link", path: "/PersonalTimePickerList", component: PersonalTimePickerList},
    {name: "partTimeJob-reInsertEndTime-link", path: "/ReInsertEndTime", component: ReInsertEndTime},
    {name: "partTimeJob-reTimePicker-link", path: "/ReTimePicker", component: ReTimePicker}
];