//引入 SFC 元件
import Register from './Register.vue';
import memberLogin from './MemberLogin.vue';

//設定 orderRoutes 網址:
export default [
    {name: "register-link", path: "/Member/Register", component: Register},
    {name: "memberLogin-link", path: "/Member/memberLogin", component: memberLogin}

];