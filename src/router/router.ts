import {createRouter, createWebHistory} from "vue-router"
import home from "../page/home.vue";
import anime from "../page/anime.vue";
import community from "../page/community.vue";
import goods from "../page/goods.vue";
import activity from "../page/activity.vue";
import player from "../page/player.vue";
import search from "../page/search.vue";
import goodsDetail from "../page/goodsDetail.vue";
import activityDetail from "../page/activityDetail.vue";
import personal from "../page/personal.vue";
import {useMainStore} from "../store";


// 定义路由元信息类型
declare module 'vue-router' {
    interface RouteMeta {
        requiresAuth?: boolean // 是否需要登录认证
    }
}

const routes = [
    {
        path: "/",
        name: "Home",
        component: home
    },
    {
        path: "/anime",
        component: anime
    },
    {
        path: "/community",
        component: community
    },
    {
        path: "/goods",
        component: goods
    },
    {
        path: "/activity",
        component: activity
    },
    {
        path: "/player",
        name: "player",
        props: true,
        component: player
    },
    {
        path: "/search/:param",
        name: "search",
        component: search,
        props: true
    },
    {
        path: "/goods/:id",
        name: "goodsDetail",
        component: goodsDetail,
        props: true
    },
    {
        path: "/activity/:id",
        name: "activityDetail",
        component: activityDetail,
        props: true
    },
    {
        path: "/personal",
        name: "personal",
        component: personal,
        meta: { requiresAuth: true } // 需要登录认证
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    // 1. 检查目标路由是否需要认证
    if (to.meta.requiresAuth) {
        // 2. 检查用户登录状态（示例使用 localStorage）
        const isAuthenticated = checkAuthStatus()

        if (!isAuthenticated) {
            // 3. 未登录则重定向到首页（或登录页）
            next({ name: 'Home' }) // 根据需求可改为 Login
            return
        }
    }

    // 4. 正常放行
    next()
})

// 认证状态检查函数
function checkAuthStatus(): boolean {
    const token = useMainStore().token
    const id = useMainStore().userInfo.id
    const flag = token && id
    return !!flag
}
export default router
