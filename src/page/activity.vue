<script setup lang="ts">

import Editor from "../components/editor.vue";
import {onMounted, ref, useTemplateRef} from "vue";
import {Activity} from "../interface/interface.ts";
import {useRouter} from "vue-router";
import axios from "axios";
import {Toolbar} from "@wangeditor/editor-for-vue";
import {ElMessage, ElMessageBox} from "element-plus";
import {useMainStore} from "../store";

const activities = ref<Activity[]>()
const router = useRouter()
const editor = useTemplateRef<any>("editor")
const uploadUrl = "http://127.0.0.1:9999/api/activity/upload"

const userStore = useMainStore()
const userInfo = userStore.userInfo

let visible = ref(false)
let text = ref()
let name = ref()
let startTime = ref()
let endTime = ref()

onMounted(() => {
  getActivityList()
  console.log(editor.value.editorConfig.MENU_CONF.uploadImage.server)
})

function toDetail(id: string) {
  router.push({path: '/activity/activityDetail', query: {id: id}})
}

const getActivityList = () => {
  axios.get("/activity").then((res) => {
    activities.value = res.data.data
  })
}

function pubActivity() {
  if (userInfo.id){
    text = editor.value.valueHtml
    // 判断输入区内容是否为空
    var html = editor.value.editorRef.getHtml();
    const isEmpty = html.match(/^<p>\s*<br\s*\/?>\s*<\/p>$/i) !== null
    if (name.value == undefined || startTime.value == undefined || endTime.value == undefined) {
      ElMessageBox({
        type: "warning",
        message: "请补全活动信息"
      })
    } else if (isEmpty) {
      ElMessage({
        type: "warning",
        message: "活动内容不能为空"
      })
    } else {
      ElMessageBox.confirm('确定要发布活动吗?', "Tip", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
          .then(() => {
            axios.post("/activity/publish", {
                  userId: userInfo.id,
                  name: name.value,
                  startTime: startTime.value,
                  endTime: endTime.value,
                  content: text
                },{requiresAuth: true}
            ).then(({data}) => {
              if (data.code == 0){
                editor.value.valueHtml = ''
                name.value = undefined
                startTime.value = undefined
                endTime.value = undefined
                getActivityList()
                visible.value = !visible.value
                ElMessage({
                  type: "success",
                  message: "发布成功,等待审核"
                })
              }else {
                ElMessage.warning(data.msg)
              }
            })
          })
          .catch(() => {
            // catch error
            ElMessage({
              type: "warning",
              message: "发布失败"
            })
          })
    }
  }else {
    ElMessage.warning("请登录")
  }

}
</script>
<script lang="ts">
export default {
  name: "activity"
}
</script>
<template>
  <div class="container">
    <template v-if="!!activities">
      <div class="activity-card">
        <a class="card-item" v-for="o in activities" :key="o.id" @click="toDetail(o.id)">
          <el-card shadow="hover" style="max-width: 500px; border-radius: 10px">
            <div class="title">{{ o.name }}</div>
            <div class="content">时间: {{ o.startTime }} 至 {{ o.endTime }}</div>
            <div class="footer">参与人数: {{ o.number }}</div>
          </el-card>
        </a>
      </div>
    </template>
    <template v-else>
      <el-empty description="暂无活动" style="margin: 0 auto;height: 600px;"/>
    </template>
  </div>
  <div class="edit">
    <el-popover
        :visible="visible"
        placement="left-end"
        title="发布活动"
        trigger="click"
        :width="1500"
    >
      <template #reference>
        <el-button @click="visible = !visible">
          <el-icon size="35" color="hotpink">
            <Edit/>
          </el-icon>
        </el-button>
      </template>
      <template #default>
        <div class="header">
          <div>
            <span>活动名称:&nbsp;</span>
            <el-input v-model="name" style="width: 200px" placeholder="活动名称"></el-input>
          </div>
          <div>
            <span>开始时间:&nbsp;</span>
            <el-date-picker
                :required="true"
                v-model="startTime"
                value-format="YYYY-MM-DD HH:mm"
                type="datetime"
                placeholder="活动开始时间"
            />
          </div>
          <div>
            <span>结束时间:&nbsp;</span>
            <el-date-picker
                v-model="endTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm"
                placeholder="活动结束时间"
            />
          </div>
          <el-button class="button" type="primary" @click="pubActivity()">发布</el-button>
        </div>
        <Editor ref="editor" style="height: 600px;" :upload-url="uploadUrl"></Editor>
        <Toolbar></Toolbar>
      </template>
    </el-popover>
  </div>
</template>

<style scoped>
@import "../style/activity.css";

.edit :deep(.el-button) {
  border-radius: 30px;
  height: 60px;
  width: 60px;
}
</style>
