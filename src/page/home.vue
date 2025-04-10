<script setup lang="ts">
import axios from "axios";
import {onMounted, ref} from "vue";
import "../interface/interface.ts"
import {Anime, AnimeInfoProps, AnimeType, Banner} from "../interface/interface.ts";
import {useRouter} from "vue-router";

// 页面挂载时渲染
onMounted(() => {
  getAnimeType()
  getBanner()
  getRecommend()
  getAnimeInfo()
})

let loading = ref(true)

// 轮播图信息
const bannerList = ref<Banner[]>()

const getBanner = () => {
  axios.get("/home/banner").then(({data}) => {
    bannerList.value = data.data
  })
}

// 获取推荐动漫
const recommendList = ref<AnimeInfoProps[]>()
const getRecommend = () => {
  axios.get("/home/recommend").then(({data}) => {
    recommendList.value = data.data
  })
}


// 获取动漫信息
let animeInfos = ref<Anime[]>()
const getAnimeInfo = (): void => {
  axios.get('/home/animeInfo').then((res) => {
    const dataVo = () => {
      return res.data.map((Vos: any) => {
        return {
          name: Vos.name,
          animeInfoVos: Vos.animeInfoVos.map((Vo: any) => {
            return {
              id: Vo.id, // 映射属性
              name: Vo.name, // 映射属性
              url: Vo.url, // 映射属性
            };
          }),
        };
      })
    }
    animeInfos.value = dataVo()
    loading.value = false
  })
}

// 动漫类型
let animeType = ref<AnimeType[]>([{
  id: '',
  name: ''
}])
const getAnimeType = (): void => {
  axios.get('/home/animeType').then((res) => {
    animeType.value = res.data
  })
}

// 点击类型跳转到搜索页面，搜索对应类型动漫
const router = useRouter()
function toSearchType(type: string) {
  router.push({path: '/search/type', query: {type}})
}

// 点击动漫跳转到播放页面
function toPlayer(id: string) {
  router.push({path: '/player', query: {id}})
}

</script>

<script lang="ts">
export default {
  name: "home"
}
</script>
<template>
  <div class="header-category">
    <div class="left">
      <a href="/community" target="_blank">
        <el-icon size="35" color="gray">
          <Compass/>
        </el-icon>
        <span>社区</span>
      </a>
      <a href="/goods" target="_blank">
        <el-icon size="35" color="gray">
          <ShoppingCartFull/>
        </el-icon>
        <span>商品</span>
      </a>
      <a href="/activity" target="_blank">
        <el-icon size="35" color="gray">
          <Flag/>
        </el-icon>
        <span>活动</span>
      </a>
    </div>
    <div class="right">
      <a v-for="o in animeType" :key="o.id" @click="toSearchType(o.name)">{{ o.name }}</a>
    </div>
  </div>
  <!--    轮播图-->
  <div class="recommend">
    <el-carousel height="460px" indicator-position="outside" style="width: 50%">
      <el-carousel-item v-for="o in bannerList" :key="o.animeId">
        <img style="object-fit: contain; height: 100%; width: auto" :src="o.url" @click="toPlayer(o.animeId)" alt="">
      </el-carousel-item>
    </el-carousel>

    <div class="recommend-content">
      <div class="recommend-card">
        <div v-for="i in recommendList" :key="i.id" class="card-item" style="max-width: 480px" @click="toPlayer(i.id)"
             :data-tip="i.synopsis.slice(0, 100) + '...'"
        >
          <div class="card-content">
            <img alt="" :src="i.url || '/img.jpg'"/>
          </div>
          <div class="card-footer" :title="i.name">{{ i.name }}</div>
        </div>
      </div>
    </div>
  </div>


  <!--    内容区-->
  <el-skeleton :rows="5" v-if="!animeInfos" style="text-align: left"/>
  <div v-for="o in animeInfos" :key="o.name" v-else>
    <a class="title" :href="'/search/type?type='+ o.name">{{ o.name }}></a>
    <div class="content">
      <div v-for="i in o.animeInfoVos" :key="i.id" class="card-item" style="max-width: 480px" @click="toPlayer(i.id)">
        <div class="card-content">
          <img alt="" :src="i.url"/>
        </div>
        <div class="card-footer">{{ i.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../style/home.css";
</style>
