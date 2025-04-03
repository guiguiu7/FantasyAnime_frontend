<script lang="ts" setup>

import {useRouter} from "vue-router";
import {onMounted, reactive, ref} from "vue";
import {GENDER_MAP, LoginInfo} from "./interface/userInterface.ts";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import axios from "axios";
import {useMainStore} from "./store";
import {getUuid} from "./util/utils.ts";

onMounted(() => {
  word.value = ''
  notice()
  getCaptchaUrl()
})

const userStore = useMainStore()
const userInfo = userStore.userInfo
let word = ref();

const loginPop = useMainStore().loginPop

const router = useRouter()

function toSearch() {
  if (word.value.trim()) {
    router.push({path: '/search/word', query: {word: word.value.trim()}})
  }
}

// 用户弹窗的操作
function toPersonalPage() {
  router.push({path: '/personal'})
}

function toActivityPage() {
  router.push({path: '/activity'})
}

function toGoodsPage() {
  router.push({path: '/Goods'})
}

const loginOut = () => {
  userStore.delUserInfo()
  window.location.reload();
}

const ruleFormRef = ref<FormInstance>()
const loginInfo = ref<LoginInfo>({operation: "",verCode: "",uuid: "",captcha: "", email: "", password: "", username: ""})

const rules = reactive<FormRules<LoginInfo>>({
  username: [
    {required: true, message: '请输入用户名', trigger: 'blur'},
    {min: 3, max: 16, message: '长度在3到5个字符', trigger: 'blur'},
  ],
  password: [
    {required: true, message: '请输入密码', trigger: 'blur'},
    {min: 6, max: 12, message: '长度在6到12', trigger: 'blur'}
  ],
  email: [
    {required: true, message: '请输入邮箱', trigger: 'blur'},
    {type: "email", message: '请输入正确邮箱格式', trigger: 'blur'}
  ],
  captcha:[
    {required: true, message: '请输入验证码', trigger: 'blur'}
  ],
  verCode: [
    {required: true, message: '请输入邮箱验证码', trigger: 'blur'}
  ]
})

// 验证码倒计时简单实现
let countdown = 60; // 倒计时秒数
let timer: NodeJS.Timeout;

// 启动倒计时
function startCountdown(operation: string) {
  if (!loginInfo.value.email) {
    ElMessage.warning("请输入邮箱")
    return
  }
  countdown = 60;

  // 发送验证码
  loginInfo.value.operation = operation
  sendVerifyCode()

  // 更新按钮状态
  const button = document.getElementById('sendBtn') as HTMLButtonElement;
  button.disabled = true;
  button.textContent = `${countdown}秒后重试`;

  timer = setInterval(() => {
    countdown--;
    button.textContent = `${countdown}秒后重试`;

    if (countdown <= 0) {
      clearInterval(timer);
      button.disabled = false;
      button.textContent = "获取验证码";
    }
  }, 1000);
}

// 登录验证码
const captchaUrl = ref("");

const getCaptchaUrl = () => {
  loginInfo.value.uuid = getUuid();
  captchaUrl.value = `https://anime-api.gwynliu.top/captcha?uuid=${loginInfo.value.uuid}`;
};

// 登录
const login = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      axios.post(`https://anime-api.gwynliu.top/login`, {
        username: loginInfo.value.username,
        password: loginInfo.value.password,
        captcha: loginInfo.value.captcha,
        uuid: loginInfo.value.uuid
      }).then(({data}) => {
        if (data.code == 0) {
          ElMessage.success("登录成功")
          userStore.setToken(data.data.token)
          getUserInfo()
          userStore.handleClose()
        } else {
          ElMessage.warning(data.msg)
        }
      })
    } else {
      ElMessage.warning("请输入正确账号信息")
    }
  })
}

// 获取用户信息
const getUserInfo = () => {
  axios.get("https://anime-api.gwynliu.top/sys/user/info", {headers: {'token': userStore.token}}).then(({data}) => {
    // 转换性别字段
    const userData = {
      ...data.data,
      gender: GENDER_MAP[data.data.gender],
    };
    userStore.setUserInfo(userData)
    window.location.reload();
  })
}

// 忘记密码
const forgetPassword = () => {
  loginPop.isForget = true
}

// 验证用户名是否可用
const verifyName = () => {
  axios.post("/user/verifyName", {userName: loginInfo.value.username}).then(({data}) => {
    if (data.code == 0){
      ElMessage.success(data.data);
    }else {
      ElMessage.warning(data.msg);
    }
  })
}

// 发送验证码
const sendVerifyCode = () => {
  axios.get(`/user/register/sendEmail?email=${loginInfo.value.email}&operation=${loginInfo.value.operation}`)
      .then(({data}) => {
    if (data.code == 0){
      ElMessage.success(data.data);
    }else {
      ElMessage.warning(data.msg);
    }
  })
}

// 注册
const sign = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      axios.post(`/user/register`, {
        userName: loginInfo.value.username,
        password: loginInfo.value.password,
        email: loginInfo.value.email,
        verCode: loginInfo.value.verCode
      }).then(({data}) => {
        if (data.code == 0){
          ElMessage.success(data.data);
          loginPop.isLogin = true
          loginInfo.value.verCode = ''
          loginInfo.value.email = ''
        }else {
          ElMessage.warning(data.msg);
        }
      })
    } else {
      ElMessage.warning("请输入正确账号信息")
    }
  })
}

// 修改密码
const changePassword = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      axios.post(`/user/forget`, {
        email: loginInfo.value.email,
        password: loginInfo.value.password,
        verCode: loginInfo.value.verCode
      }).then(({data}) => {
        if (data.code == 0){
          ElMessage.success(data.data);
          loginPop.isForget = false
          loginInfo.value.verCode = ''
          loginInfo.value.email = ''
          loginInfo.value.password = ''
        }else {
          ElMessage.warning(data.msg);
        }
      })
    } else {
      ElMessage.warning("请输入正确账号信息")
    }
  })
}

// 获取通知
let noticeInfo = reactive([{id: '', info: ''}])
const notice = () => {
  axios.get("/home/notice").then(({data}) => {
    if (data.code == 0){
      noticeInfo = data.data
    }
  })
}
</script>

<template>
  <div class="container" id="container">
    <div class="page-header">
      <a class="logo" href="/" title="fantasy动漫网站-讨论、观看一站式"></a>
      <div class="search">
        <input v-model="word" placeholder="搜索动漫~" type="text" onkeydown="if(event.keyCode===13){btn.click()}">
        <button id="btn" type="submit" @click="toSearch()"></button>
      </div>
      <div class="nav">
        <div class="header-nav">
          <div class="user">
            <img :src="userInfo?.headUrl || '/img.jpg'" alt=""/>
            <div class="popover-user">
              <template v-if="userInfo?.id">
                <div class="info">
                  <div class="name">{{ userInfo.username }}</div>
                  <div class="content">
                    <span>性别:&nbsp;{{ userInfo.gender }}</span>
                    <span>邮箱:&nbsp;{{ userInfo.email }}</span>
                    <button @click="toPersonalPage">个人中心</button>
                    <button @click="toActivityPage">参与活动</button>
                    <button @click="toGoodsPage">购买商品</button>
                  </div>
                  <div class="footer">
                    <button @click="loginOut">退出登录</button>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="no-login">
                  <div style="margin: 35px 0;">
                    <span style="margin-bottom: 5px">登陆后你可以:</span>
                    <span>动漫交互  发布文章</span>
                    <span>购买周边  参加活动</span>
                    <button class="login" @click="userStore.handleLogin()">立即登录</button>
                  </div>
                  <div style="margin: 35px 0;">
                    <span>没有账号？</span>
                    <span style="display: block; color: #00aeec" @click="userStore.handleRegister()">点我注册</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <!--          <a href="#" class="icon medal">-->
          <!--            <gold-medal/>-->
          <!--            <span>签到</span></a>-->
          <el-popover
              placement="bottom"
              width="400"
          >
            <template #reference>
              <a href="#" class="icon bell">
                <bell/>
                <span>通知</span>
              </a>
            </template>
            <template #default>
              <div class="notice">
                <div class="notice-item" v-for="o in noticeInfo" :key="o.id">
                  {{o.info}}
                </div>
              </div>
            </template>
          </el-popover>

<!--          <a href="#" class="icon msg">-->
<!--            <Message/>-->
<!--            <span>消息</span></a>-->
        </div>
      </div>
    </div>
    <router-view :key="$route.fullPath">
    </router-view>
    <div class="foot">本网站所有内容 &copy; 2025</div>

    <div class="overlay" v-show="loginPop.toLogin">
      <div class="login-pop">
        <div class="title">欢迎来到Fantasy动漫社区</div>
        <div class="close" @click="userStore.handleClose()"></div>
        <template v-if="loginPop.isLogin">
          <el-form
              ref="ruleFormRef"
              :rules="rules"
              :model="loginInfo"
              label-width="auto"
              style="margin: 0 100px;"
          >
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="loginInfo.username"/>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="loginInfo.password"/>
            </el-form-item>
            <el-form-item label="验证码" prop="captcha" style="display: flex; margin-bottom: 0;">
              <el-input type="text" v-model="loginInfo.captcha" style="width: 50%"/>
              <img style="vertical-align: middle; height: 40px; cursor: pointer; width: 50%" :src="captchaUrl" @click="getCaptchaUrl()" alt="" />
            </el-form-item>
            <div class="forget" @click="forgetPassword()">
              忘记密码
            </div>
            <div class="operate" style="margin-top: 15px;">
              <button class="sign" @click.prevent="loginPop.isLogin = !loginPop.isLogin">注册</button>
              <button class="login" @click.prevent="login(ruleFormRef)">登录</button>
            </div>
          </el-form>
        </template>
        <template v-else>
          <el-form ref="ruleFormRef" :model="loginInfo" label-width="auto" style="margin: 0 100px;" :rules="rules">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="loginInfo.username">
                <template #append>
                  <el-button @click="verifyName()">
                    验证用户名可用
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="loginInfo.password"/>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="loginInfo.email"/>
            </el-form-item>
            <el-form-item label="验证码" prop="verCode">
              <el-input type="text" v-model="loginInfo.verCode">
                <template #append>
                  <el-button id="sendBtn" @click="startCountdown('register')">发送验证码</el-button>
                </template>
              </el-input>
            </el-form-item>
            <div class="operate">
              <button class="sign-login" @click.prevent="sign(ruleFormRef)">注册</button>
            </div>
          </el-form>
        </template>
      </div>
      <div class="forget-card" v-if="loginPop.isForget">
        <div class="login-pop">
          <div class="title">忘记密码</div>
          <div class="close" @click="userStore.handleClose()"></div>
          <el-form ref="ruleFormRef" :model="loginInfo" label-width="auto" style="margin: 0 100px;" :rules="rules">
            <el-form-item label="邮箱" prop="email">
              <el-input type="email" v-model="loginInfo.email"/>
            </el-form-item>
            <el-form-item label="验证码" prop="verCode">
              <el-input type="text" v-model="loginInfo.verCode">
                <template #append>
                  <el-button id="sendBtn" @click="startCountdown('forget')">发送验证码</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="新密码" prop="password">
              <el-input type="password" v-model="loginInfo.password"/>
            </el-form-item>
            <div class="operate">
              <button class="sign-login" @click.prevent="changePassword(ruleFormRef)">修改</button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
  <el-backtop :right="100" :bottom="100"/>
</template>

<style scoped>
@import "./style.css";
.login-pop :deep(.el-form .el-form-item:last-child) {
  margin-bottom: 0 !important;
}
</style>
