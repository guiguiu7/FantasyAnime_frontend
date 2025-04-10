<script setup lang="ts">
import {useRoute} from "vue-router";
import axios from "axios";
import {onMounted, ref} from "vue";
import {AnimePlayList, PlayList, Comment} from "../interface/interface.ts";
import {useMainStore} from "../store";
import {ElMessage} from "element-plus";

const route = useRoute()

const userStore = useMainStore()
const userInfo = userStore.userInfo

let id = route.query.id
let currentNum = ref<number>(0)
const animePlayList = ref<AnimePlayList>({
  animeId: '',
  animeName: '',
  likes: 0,
  rating: 0,
  isLike: false,
  isCollect: false,
  playList: [{
    id: '',
    title: '',
    num: 0,
    description: '',
    url: ''
  }]
})
const playList = ref<PlayList[]>([])


onMounted(() => {
  getPlayerInfo()
  getComment()
})

function getPlayerInfo() {
  if (userInfo.id){
    axios.get(`/player/${id}/${userInfo.id}`,{requiresAuth: true}).then((res) => {
      animePlayList.value = res.data
      rate.value = animePlayList.value.rating
      playList.value = animePlayList.value.playList
    })
  }else {
    axios.get(`/player/${id}`).then((res) => {
      animePlayList.value = res.data
      playList.value = animePlayList.value.playList
    })
  }
}

async function like() {
    if (animePlayList.value.isLike) {
      await axios.post(`/player/like/${id}?operate=-1&userId=${userInfo.id}`
          ,{},{requiresAuth: true}).then((res) => {
        animePlayList.value.isLike = res.data.isLike
        animePlayList.value.likes = res.data.likes
      })
    } else {
      await axios.post(`/player/like/${id}?operate=1&userId=${userInfo.id}`
          ,{},{requiresAuth: true}).then((res) => {
        animePlayList.value.isLike = res.data.isLike
        animePlayList.value.likes = res.data.likes
      })
    }
}

async function collect() {
    if (animePlayList.value.isCollect){
      await axios.post(`/player/collect/${id}?operate=-1&userId=${userInfo.id}`
          ,{},{requiresAuth: true}).then((res) => {
        animePlayList.value.isCollect = res.data
      })
    }else {
      await axios.post(`/player/collect/${id}?operate=1&userId=${userInfo.id}`
          ,{},{requiresAuth: true}).then((res) => {
        animePlayList.value.isCollect = res.data
      })
    }
}

let rate = ref(0)
const rateChange = () => {
  axios.post(`/player/rate`, {
    animeId: id,
    userId: userInfo.id,
    rating: rate.value
  }, {requiresAuth: true}).then(({data}) => {
    if (data.code == 0) {
      rate.value = data.data
    } else {
      ElMessage.warning(data.msg)
    }
  })
}

function playNum(num: number) {
  currentNum.value = num
}

const comment = ref<Comment[]>()
const getComment = () => {
    axios.get(`/player/comment?animeId=${id}`).then(({data}) => {
      comment.value = data.data
    })
}

let text = ref('')
const reply = () => {
    if (text.value == ''){
      ElMessage.warning("评论内容不能为空")
    }else {
      axios.post("/player/reply", {
        animeId: id,
        userId: userInfo.id,
        content: text.value
      },
          {requiresAuth: true}
      ).then(({data}) => {
        comment.value = data.data
        text.value = ''
      })
    }
}
</script>
<script lang="ts">
export default {
  name: 'player'
}
</script>
<template>
  <div class="content">
    <div class="title">
      {{ animePlayList?.animeName }}——{{ currentNum + 1 }}:{{ playList![currentNum]?.title }}
    </div>
    <video controls :src="playList[currentNum]?.url">

    </video>
    <div class="toolbar">
      <div class="anime-like">
        <svg @click="like()" :style="{color: (animePlayList.isLike? '#ff8787' : '')}" xmlns="http://www.w3.org/2000/svg"
             xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 18 18" width="30" height="30"
             style="width: 30px; height: 30px;">
          <path
              d="M10.4511 2.2220125C10.218425 2.194885 10.002175 2.2953725 9.884175 2.433395C9.4264 2.9688525 9.321875 3.7501399999999996 8.978575 4.3581725C8.533574999999999 5.146395 8.1198 5.6213375 7.609775000000001 6.068507499999999C7.1751375 6.449565 6.738407499999999 6.697442499999999 6.3125 6.8050575L6.3125 14.854575C6.9198900000000005 14.868174999999999 7.572900000000001 14.876875 8.25 14.876875C9.936425 14.876875 11.367025 14.823325 12.33115 14.773699999999998C13.03235 14.737575 13.646025000000002 14.390075 13.966750000000001 13.81945C14.401900000000001 13.04535 14.9387 11.909650000000001 15.264174999999998 10.571200000000001C15.56665 9.327275 15.704699999999999 8.304325 15.766675 7.582224999999999C15.7988 7.208262500000001 15.50165 6.875019999999999 15.059999999999999 6.875019999999999L11.323274999999999 6.875019999999999C11.156575 6.875019999999999 11.000800000000002 6.791952499999999 10.907975 6.653499999999999C10.783725 6.468192500000001 10.82855 6.2670175 10.9037 6.07485C11.059 5.675084999999999 11.29355 4.9974475 11.382425000000001 4.4018275C11.470875000000001 3.80917 11.450999999999999 3.32219 11.212050000000001 2.86913C10.9571 2.3857825 10.66065 2.2464475 10.4511 2.2220125zM12.034300000000002 5.87502L15.059999999999999 5.87502C16.02035 5.87502 16.850875 6.64489 16.763 7.667825C16.697100000000002 8.435525 16.55155 9.5092 16.235825000000002 10.807500000000001C15.882625 12.259950000000002 15.3035 13.482225 14.838450000000002 14.309474999999999C14.32695 15.2194 13.377475 15.721150000000002 12.38255 15.772375C11.405125 15.822725 9.956949999999999 15.876875000000002 8.25 15.876875000000002C6.5961925 15.876875000000002 5.0846825 15.826025000000001 4.0136674999999995 15.77715C2.8370825 15.723474999999999 1.8519999999999999 14.850000000000001 1.725645 13.654824999999999C1.6404649999999998 12.849274999999999 1.5625 11.80725 1.5625 10.689375C1.5625 9.665175000000001 1.6279400000000002 8.736175 1.7045524999999997 7.998975C1.8351224999999998 6.7427075 2.9137075 5.87502 4.130655 5.87502L5.8125 5.87502C6.072015 5.87502 6.457235 5.7490675 6.9505175 5.316582499999999C7.377705000000001 4.942045 7.7193000000000005 4.5546075 8.107775 3.8665374999999997C8.492075 3.18585 8.605825 2.389785 9.124075 1.783595C9.452975 1.3988800000000001 9.99475 1.162025 10.5669 1.228745C11.16225 1.29816 11.717425 1.683875 12.09655 2.4025825000000003C12.478275 3.1262375000000002 12.474075 3.8618225 12.371500000000001 4.54938C12.302149999999997 5.0139949999999995 12.155425000000001 5.510059999999999 12.034300000000002 5.87502zM5.3125 14.82705L5.3125 6.875019999999999L4.130655 6.875019999999999C3.3792199999999997 6.875019999999999 2.77211 7.400795 2.6991975000000004 8.10235C2.6253525 8.812875 2.5625 9.70665 2.5625 10.689375C2.5625 11.762875 2.6374975 12.768475 2.7200975 13.549700000000001C2.7919925 14.229675 3.3521950000000005 14.74595 4.05924 14.778224999999999C4.4278775 14.795 4.849985 14.812050000000001 5.3125 14.82705z"
              fill="currentColor"></path>
        </svg>
        <div>{{ animePlayList?.likes }}</div>
      </div>
      <div @click="collect()">
        <el-icon size="30" :color="animePlayList.isCollect ? '#f8b71a': ''">
          <Star/>
        </el-icon>
      </div>
      <div style="">
        <el-rate @change="rateChange()" v-model="rate" size="large"/>
      </div>
    </div>
    <!--    选集-->
    <el-card style="width: 100%">
      <template #header>
        <div class="player-list-title">
          选集
        </div>
      </template>
      <div class="player-list-info">
        <div @click="playNum(o.num-1)" v-for="o in animePlayList?.playList" :key="o.id" class="number-episodes">{{ o.num }}
        </div>
      </div>
    </el-card>
    <!--    评论-->
    <el-card style="width: 100%;">
      <template #header>
        <div class="player-list-title">
          评论
        </div>
      </template>
      <div class="player-comment">
        <div class="publish-comment">
          <div class="avatar">
            <img :src="userInfo.headUrl || '/public/img.jpg'" alt="">
          </div>
          <textarea rows="3" type="text" v-model="text"></textarea>
          <button @click="reply()">发送</button>
        </div>
        <!--        父评论-->
        <div v-for="o in comment" :key="o.id" class="player-comment-info">
          <div class="user">
            <div class="avatar">
              <img :src="o.userAvatar || '/public/img.jpg'" alt="">
            </div>
            <div class="main">
              <div class="name">{{ o.userName }}</div>
              <div class="content">
                {{ o.content }}
              </div>
              <div class="footer">
                <div class="time">
                  {{ o.createTime }}
                </div>
<!--                <div class="like">-->
<!--                  <button>-->
<!--                    <el-icon v-if="o % 2 !== 0" color="hotpink" size="30">-->
<!--                      <CaretTop/>-->
<!--                    </el-icon>-->
<!--                    <el-icon v-if="o % 2 === 0" size="30">-->
<!--                      <CaretTop/>-->
<!--                    </el-icon>-->
<!--                  </button>-->
<!--                  <div class="like-num">15</div>-->
                </div>
              </div>
              <!--              子评论-->
<!--              <div class="reply-box">-->
<!--                <div class="avatar">-->
<!--                  <img src="../../public/img.jpg" alt="">-->
<!--                </div>-->
<!--                <div class="main">-->
<!--                  <div class="name">用户</div>-->
<!--                  <div class="content">-->
<!--                    我赞同-->
<!--                  </div>-->
<!--                  <div class="footer">-->
<!--                    <div class="time">-->
<!--                      xxxx.xx.xx xx:xx-->
<!--                    </div>-->
<!--                    <div class="like">-->
<!--                      <button>-->
<!--                        <el-icon v-if="o % 2 !== 0" color="hotpink" size="30">-->
<!--                          <CaretTop/>-->
<!--                        </el-icon>-->
<!--                        <el-icon v-if="o % 2 === 0" size="30">-->
<!--                          <CaretTop/>-->
<!--                        </el-icon>-->
<!--                      </button>-->
<!--                      <div class="like-num">15</div>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
            </div>
          </div>
          <hr/>
<!--        </div>-->
      </div>
    </el-card>
  </div>
</template>

<style scoped>
@import "../style/player.css";

.el-card {
  box-shadow: none;
  border-radius: 0;
  border: none;
  border-top: 1px solid black
}
</style>
