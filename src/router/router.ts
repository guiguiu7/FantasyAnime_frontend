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

const routes = [
    {
        path: "/",
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
        component: personal
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
