<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {Article, AnimeInfo, Activity} from "../interface/interface.ts";
import axios from "axios";
import {useMainStore} from "../store";
import {
  ElMessage,
  ElMessageBox, FormInstance, FormRules,
  TabsPaneContext, UploadFile,
} from "element-plus";
import {useRouter} from "vue-router";
import {GENDER_MAP} from "../interface/userInterface.ts";
import {Delete} from "@element-plus/icons-vue";

onMounted(() => {
  getCollectInfo()
})

const userStore = useMainStore()
const userInfo = computed(() => userStore.userInfo)
const animeInfos = ref<AnimeInfo[]>()
const activeTab = ref('collect');

let loading = ref(false)

//tab触发事件
const handleTabClick = (tab:TabsPaneContext) => {
  let name = tab.paneName
  if (name == 'collect') {
    getCollectInfo();
  } else if (name == 'article') {
    getCommunityArticles();
  } else if (name == 'activity') {
    getActivities();
  }
};

// 获取收藏动漫
const router = useRouter()

// 点击收藏动漫跳转播放页
function toPlayer(id:string) {
  router.push({path: '/player', query: {id}})
}
const getCollectInfo = () => {
  loading.value = true
  axios.get(`/user/collect/${userInfo.value.id}`, {requiresAuth: true}).then(({data}) => {
    animeInfos.value = data.data
    loading.value = false
  })
}
const delCollectAnime = (animeId: string) => {
  axios.post("/user/delCollectAnime", {animeId: animeId, userId: userInfo.value.id},{requiresAuth: true}).then(({data}) => {
    if (data.code == 0) {
      ElMessage.success("删除收藏成功")
    } else {
      ElMessage.error("删除失败")
    }
    getCollectInfo()
  })
}

// 获取文章信息
const articles = ref<Article[]>()

const getCommunityArticles = () => {
  loading.value = true
  axios.get(`/user/article/${userInfo.value.id}`,{requiresAuth: true}).then(({data}) => {
    articles.value = data.data
    loading.value = false
  })
}
// 查看评论
const showComment = (o: Article) => {
  o.isShow = !o.isShow
  if (o.isShow) {
    axios.get(`/community/comment/${o.id}`).then((res) => {
      o.replyComment = res.data
    }).catch(() => {
    })
  }
}
//删除文章
const delArticle = (articleId: string) => {
  ElMessageBox.confirm('确定要删除文章吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
        axios.post("/user/delArticle", {articleId: articleId, userId: userInfo.value.id},{requiresAuth: true}).then(({data}) => {
          if (data.code == 0) {
            ElMessage.success("删除文章成功")
          } else {
            ElMessage.error("删除失败")
          }
          getCommunityArticles()
        })
      }
  )
}

//参加的活动

const activities = ref<Activity[]>()

function toActivityDetail(id: string) {
  router.push({path: '/activity/activityDetail', query: {id: id}})
}

const getActivities = () => {
  loading.value = true
  axios.get(`/user/activity/${userInfo.value.id}`,{requiresAuth: true}).then(({data}) => {
    activities.value = data.data
    loading.value = false
  })
}

// 修改个人信息
const dialogFormVisible = ref(false)
const modifyUserInfo = ref({email: "", gender: 2, headUrl: "", id: "", realName: "", username: ""})
const rules = reactive<FormRules>({
  username:[
    {required: true, message: '请输入用户名', trigger: 'blur'},
    { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
  ],
  headUrl:[
    {required: true, message: '请上传头像', trigger: 'blur'}
  ],
  gender: [
    {required: true, message: '请选择性别', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change']}
  ],
  realName: [
    {required: false, message: '请输入真实姓名', trigger: 'blur'},
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ]
})

// 初始化弹窗
const openDialog = () => {
  dialogFormVisible.value = true
  modifyUserInfo.value = {
    ...userInfo.value,
    gender: convertGenderToNumber(userInfo.value.gender)
  };
}
// 性别类型转换
const convertGenderToNumber = (gender: string): number => {
  switch (gender) {
    case '男':
      return 0;
    case '女':
      return 1;
    default:
      return 2;
  }
}

// 表单提交
const formRef = ref<FormInstance>()
const setUserInfo = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const response = ref()
    const formData = new FormData()
    formData.append('userInfo', JSON.stringify(modifyUserInfo.value))

    // 当前没有选择文件时，使用默认头像
    if (!currentFile.value) {
      const url = modifyUserInfo.value.headUrl.split('/fantasy-anime')[1]
      formData.append('headUrl', url)
      const {data} = await axios.post(`/user/updateUserInfo`, formData, {requiresAuth: true})
      response.value = data
    }else {
      // 上传头像
      formData.append('file', currentFile.value)
      const {data} = await axios.post('/user/updateUserInfo', formData, {requiresAuth: true})
      response.value = data
    }
    if (response.value.code == 0) {
      ElMessage.success('修改成功')
      modifyUserInfo.value = response.value.data
      // 创建中间变量格式化性别字段
      const tempInfo = {
        ...response.value.data,
        gender: GENDER_MAP[response.value.data.gender]
      }
      userStore.setUserInfo(tempInfo)
      dialogFormVisible.value = false
    } else {
      ElMessage.error('修改失败')
    }
  } catch (error) {
    ElMessage.error('提交失败，请检查输入')
  }
}
// 文件状态管理
const currentFile = ref<File | null>(null)

// 文件选择处理（自动覆盖旧文件）
const previewFile = ref('')
const handleFileChange = (file: UploadFile) => {
  const rawFile = file.raw
  if (rawFile == undefined) {
    ElMessage.error('头像不能为空!')
    return false
  }
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(rawFile.type)) {
    ElMessage.error('头像必须是 JPG/PNG/GIF 格式!')
    return false
  }
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('头像大小不能超过 5MB!')
    return false
  }
  currentFile.value = file.raw!
  if (previewFile.value){
    URL.revokeObjectURL(previewFile.value)
  }
  modifyUserInfo.value.headUrl = currentFile.value
  previewFile.value = URL.createObjectURL(file.raw!)
}
// 超出文件限制提示
const handleExceed = () => {
  ElMessage.warning('每次只能上传一个头像')
}

// 删除头像
const uploadRef = ref<any>()
const delAvatar = () => {
  currentFile.value = null
  previewFile.value = null
  modifyUserInfo.value.headUrl = ''
  uploadRef.value?.clearFiles()
  ElMessage.success('删除成功')
}

</script>
<script lang="ts">
export default {
  name: "personal"
}
</script>

<template>
  <div class="container">
    <div class="user-info">
      <div class="avatar">
        <img :src="userInfo.headUrl || '/img.jpg'" alt="头像">
      </div>
      <div class="info">
        <div class="name">
          {{ userInfo.username }}
        </div>
        <div class="gender">
          {{ userInfo.gender || '保密' }}
        </div>
        <div class="email">
          {{ userInfo.email }}
        </div>
      </div>
      <div class="operate">
        <button @click="openDialog()">修改信息</button>
      </div>
    </div>
    <el-tabs :tab-position="'top'" @tabClick="handleTabClick" v-model="activeTab">
      <el-tab-pane label="收藏" name="collect">
        <el-empty description="暂无收藏" v-if="!animeInfos" v-loading="loading"/>
        <div class="collect" v-if="animeInfos">
          <div class="content">
            <div v-for="i in animeInfos" :key="i.id" class="card-item" style="max-width: 480px" @click="toPlayer(i.id)">
              <div class="del" @click="delCollectAnime(i.id)">
                <el-icon>
                  <Delete/>
                </el-icon>
              </div>
              <div class="card-content">
                <img alt="" :src="i.url"/>
              </div>
              <div class="card-footer">{{ i.name }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="社区" name="article">
        <el-empty description="暂无发表" v-if="!articles" v-loading="loading"/>
        <div v-if="articles">
          <div class="article" v-for="o in articles" :key="o.id">
            <div class="author">
              <div class="avatar">
                <img :src="o.userAvatar||'/img.jpg'" alt="头像">
              </div>
              <div class="author-info">
                <div class="name">{{ o.userName }}</div>
                <div class="time">{{ o.createTime }}</div>
              </div>
            </div>
            <div style="all: initial">
              <div v-html="o.content" class="content" :style="{'-webkit-line-clamp': o.isExpanded ? '100' : '7'}">
              </div>
            </div>
            <div class="footer-bar">
              <div class="expand-btn" v-if="o.content && (o.content.match(/<\//g) || []).length > 7"
                   @click="o.isExpanded = !o.isExpanded">
                {{ !o.isExpanded ? '展开' : '收起' }}
              </div>
              <div class="del" @click="delArticle(o.id)">
                <el-icon>
                  <Delete/>
                </el-icon>
              </div>
              <div class="comment" @click="showComment(o)">
                <el-icon size="30">
                  <ChatDotSquare/>
                </el-icon>
              </div>
              <div class="like">
                <button>
                  <svg :style="{color: (o.isLike? '#ff8787' : '')}"
                       xmlns="http://www.w3.org/2000/svg"
                       xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 18 18" width="30" height="30"
                       style="width: 30px; height: 30px;">
                    <path
                        d="M10.4511 2.2220125C10.218425 2.194885 10.002175 2.2953725 9.884175 2.433395C9.4264 2.9688525 9.321875 3.7501399999999996 8.978575 4.3581725C8.533574999999999 5.146395 8.1198 5.6213375 7.609775000000001 6.068507499999999C7.1751375 6.449565 6.738407499999999 6.697442499999999 6.3125 6.8050575L6.3125 14.854575C6.9198900000000005 14.868174999999999 7.572900000000001 14.876875 8.25 14.876875C9.936425 14.876875 11.367025 14.823325 12.33115 14.773699999999998C13.03235 14.737575 13.646025000000002 14.390075 13.966750000000001 13.81945C14.401900000000001 13.04535 14.9387 11.909650000000001 15.264174999999998 10.571200000000001C15.56665 9.327275 15.704699999999999 8.304325 15.766675 7.582224999999999C15.7988 7.208262500000001 15.50165 6.875019999999999 15.059999999999999 6.875019999999999L11.323274999999999 6.875019999999999C11.156575 6.875019999999999 11.000800000000002 6.791952499999999 10.907975 6.653499999999999C10.783725 6.468192500000001 10.82855 6.2670175 10.9037 6.07485C11.059 5.675084999999999 11.29355 4.9974475 11.382425000000001 4.4018275C11.470875000000001 3.80917 11.450999999999999 3.32219 11.212050000000001 2.86913C10.9571 2.3857825 10.66065 2.2464475 10.4511 2.2220125zM12.034300000000002 5.87502L15.059999999999999 5.87502C16.02035 5.87502 16.850875 6.64489 16.763 7.667825C16.697100000000002 8.435525 16.55155 9.5092 16.235825000000002 10.807500000000001C15.882625 12.259950000000002 15.3035 13.482225 14.838450000000002 14.309474999999999C14.32695 15.2194 13.377475 15.721150000000002 12.38255 15.772375C11.405125 15.822725 9.956949999999999 15.876875000000002 8.25 15.876875000000002C6.5961925 15.876875000000002 5.0846825 15.826025000000001 4.0136674999999995 15.77715C2.8370825 15.723474999999999 1.8519999999999999 14.850000000000001 1.725645 13.654824999999999C1.6404649999999998 12.849274999999999 1.5625 11.80725 1.5625 10.689375C1.5625 9.665175000000001 1.6279400000000002 8.736175 1.7045524999999997 7.998975C1.8351224999999998 6.7427075 2.9137075 5.87502 4.130655 5.87502L5.8125 5.87502C6.072015 5.87502 6.457235 5.7490675 6.9505175 5.316582499999999C7.377705000000001 4.942045 7.7193000000000005 4.5546075 8.107775 3.8665374999999997C8.492075 3.18585 8.605825 2.389785 9.124075 1.783595C9.452975 1.3988800000000001 9.99475 1.162025 10.5669 1.228745C11.16225 1.29816 11.717425 1.683875 12.09655 2.4025825000000003C12.478275 3.1262375000000002 12.474075 3.8618225 12.371500000000001 4.54938C12.302149999999997 5.0139949999999995 12.155425000000001 5.510059999999999 12.034300000000002 5.87502zM5.3125 14.82705L5.3125 6.875019999999999L4.130655 6.875019999999999C3.3792199999999997 6.875019999999999 2.77211 7.400795 2.6991975000000004 8.10235C2.6253525 8.812875 2.5625 9.70665 2.5625 10.689375C2.5625 11.762875 2.6374975 12.768475 2.7200975 13.549700000000001C2.7919925 14.229675 3.3521950000000005 14.74595 4.05924 14.778224999999999C4.4278775 14.795 4.849985 14.812050000000001 5.3125 14.82705z"
                        fill="currentColor"></path>
                  </svg>
                </button>
                <div class="like-num">{{ o.likes }}</div>
              </div>
            </div>
            <div class="reply" v-if="o.isShow">
              <el-card shadow="never">
                <template #header>
                  <div class="player-list-title">
                    评论
                  </div>
                </template>
                <div class="player-comment">
                  <!--评论-->
                  <el-skeleton :loading="!o.replyComment" :rows="3"/>
                  <div style="text-align: center" v-if="o.replyComment && o.replyComment.length == 0">
                    <el-divider content-position="center">暂无评论</el-divider>
                  </div>
                  <div v-for="i in o.replyComment" :key="i.id" class="player-comment-info">
                    <div class="user">
                      <div class="avatar">
                        <img :src="i.userAvatar||'/img.jpg'" alt="头像">
                      </div>
                      <div class="main">
                        <div class="name">
                          {{ i.userName || '用户' }}
                        </div>
                        <div class="content">
                          {{ i.content }}
                        </div>
                        <div class="footer">
                          <div class="time">
                            {{ i.createTime }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr/>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="活动" name="activity">
        <el-empty description="暂无活动" v-if="!activities" v-loading="loading"/>
        <div class="activity-card" v-if="activities">
          <a class="card-item" v-for="o in activities" :key="o.id" @click="toActivityDetail(o.id)">
            <el-card shadow="hover" style="max-width: 500px; border-radius: 10px">
              <div class="title">{{ o.name }}</div>
              <div class="content">时间: {{ o.startTime }} 至 {{ o.endTime }}</div>
              <div class="footer">参与人数: {{ o.number }}</div>
            </el-card>
          </a>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>

<!--  修改个人信息-->
  <el-dialog v-model="dialogFormVisible" title="修改信息">
    <el-form :model="modifyUserInfo" :rules="rules" ref="formRef" label-width="100px">
      <!-- 头像上传 -->
      <el-form-item label="头像" prop="headUrl">
        <el-upload
            ref="uploadRef"
            class="avatar-uploader"
            :auto-upload="false"
            :show-file-list="false"
            :limit="1"
            :on-exceed="handleExceed"
            :on-change="handleFileChange"
        >
          <img v-if="previewFile" :src="previewFile" class="avatar-image"/>
          <img v-else-if="modifyUserInfo.headUrl" :src="modifyUserInfo.headUrl" class="avatar-image"/>
          <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <el-icon v-if="previewFile || modifyUserInfo.headUrl" class="delete" size="35" @click="delAvatar">
          <Delete />
        </el-icon>
      </el-form-item>

      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="modifyUserInfo.username" />
      </el-form-item>

      <!-- 真实姓名 -->
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="modifyUserInfo.realName" />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="modifyUserInfo.email" type="email" />
      </el-form-item>

      <!-- 性别 -->
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="modifyUserInfo.gender">
          <el-radio :value="0">男</el-radio>
          <el-radio :value="1">女</el-radio>
          <el-radio :value="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="setUserInfo()">
          OK
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
@import "../style/personal.css";

:deep(.el-tabs__item) {
  height: 100px;
}
:deep(.el-tabs__item) {
  width: 300px;
}
.container > :deep(.el-dialog) {
  width: 600px;
}
</style>
