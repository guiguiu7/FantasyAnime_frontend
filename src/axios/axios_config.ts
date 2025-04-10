import axios from "axios";
import {useMainStore} from "../store/index.ts"
import {ElMessage} from "element-plus";

axios.defaults.baseURL = "https://anime-api.gwynliu.top/api"

// 请求拦截器
axios.interceptors.request.use(
    (config) => {

        const userStore = useMainStore()
        const userInfo = userStore.userInfo

        // 检查登录状态
        if (config.requiresAuth === true) {
            if (!userInfo?.id) {
                userStore.handleLogin()
                return Promise.reject(ElMessage.warning("请登录"));
            }
            // 可选：为已登录请求添加 token
            config.headers.Token = userStore.token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;
