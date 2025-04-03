<script setup lang="ts">
import {onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {Activity} from "../interface/interface.ts";
import axios from "axios";
import {ElMessage} from "element-plus";
import {useMainStore} from "../store";

let route = useRoute()
let id = route.query.id
const activity = ref<Activity>()

const userStore = useMainStore()
const userInfo = userStore.userInfo;

onMounted(() => {
  getActivityDetail()
})

const getActivityDetail = () => {
  axios.get(`/activity/activityDetail/${id}`).then((res) => {
    activity.value = res.data.data
  })
}

const join = (id: string) => {
    axios.post("/activity/join",{activityId: id, userId: userInfo.id}, {requiresAuth: true}).then(({data: {data}}) => {
      if (data.code == 0){
        ElMessage({
          type: "success",
          message:data.data
        })
      }else {
        ElMessage({
          type: "warning",
          message: data.msg
        })
      }
    })

}
</script>
<script lang="ts">
export default {
  name: "activityDetail"
}
</script>
<template>
  <div class="container">
    <div v-html="activity.content" v-if="activity"></div>
    <div class="footer">

    </div>
    <div class="toolbar">
      <button class="join" @click="join(activity?.id)" v-if="activity">
        报名参与
      </button>
    </div>
  </div>
</template>

<style scoped>
@import "../style/activityDetail.css";
</style>
