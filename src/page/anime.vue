<script setup lang="ts">
import {AnimeInfoProps} from "../interface/interface.ts";
import {useRouter} from "vue-router";

const props = defineProps<{ animeInfo: AnimeInfoProps[] }>()
const router = useRouter()

// 跳转播放页
function toPlayer(id:string) {
  router.push({path: '/player', query: {id}})
}
</script>

<script lang="ts">
export default {
  name: 'anime'
}
</script>

<template>
  <div class="content">
    <ul type="none">
      <li v-for="o in props.animeInfo" :key="o.id">
        <div class="anime" @click="toPlayer(o.id)">
          <img :src="o.url" alt="">
          <div class="animeInfo">
            <div class="title">{{ o.name }}</div>
            <div class="info" :title="o.synopsis">{{ o.synopsis }}</div>
            <div class="footer">共{{o.episodes}}集</div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
@import "../style/anime.css";
</style>
