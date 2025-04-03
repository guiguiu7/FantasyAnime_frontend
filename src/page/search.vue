<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import Anime from "./anime.vue";
import {onMounted, ref} from "vue";
import {AnimeInfoProps} from "../interface/interface.ts";
import axios from "axios";

const router = useRouter()
const route = useRoute()

onMounted(() => {
  if (word != null && word !== '') {
    getAnimeInfoByName()
  }
  if (type != null) {
    getAnimeInfoByType()
  }
})

let word = route.query.word
let type = route.query.type

let animeInfo = ref<AnimeInfoProps[]>([])
function getAnimeInfoByName () {
  axios.get(`/search/${word}`).then((res) => {
    animeInfo.value = res.data
    console.log(animeInfo.value)
  })
}
function getAnimeInfoByType () {
  axios.get(`/search/type?type=${type}`).then((res) => {
    animeInfo.value = res.data
  })
}

</script>
<script lang="ts">
export default {
  name: 'search'
}
</script>
<template>
  <anime ref="search" :animeInfo="animeInfo"></anime>
  <div v-if="animeInfo.length == 0">
    <el-empty image-size="500" description="没有您要搜索的动漫" />
  </div>
</template>

<style scoped>

</style>
