<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import axios from "axios";
import "./goodsDetail.vue";
import {GoodsDetail} from "../interface/interface.ts";
import {useRoute} from "vue-router";
import {ElMessage, ElNotification} from "element-plus";
import {useMainStore} from "../store";

let buyNum = ref(0)
let route = useRoute()
const goodsDetail = ref<GoodsDetail>()

const userStore = useMainStore()
const userInfo = userStore.userInfo

let disable = computed(() => {
  if (goodsDetail.value != undefined){
    return (buyNum.value == 0 || goodsDetail.value.num == 0)
  }
  return false;
})
const handleChange = (num: number) => {

}

onMounted(() => {
  getGoodsDetail()
})

let goodsId = route.query.id
const getGoodsDetail = () => {
  axios.get(`/goods/goodsDetail/${goodsId}`).then((res) => {
    goodsDetail.value = res.data
  })
}

// 购买商品
const toBuy = async (o: any): Promise<any> => {
  try {
    const res = await axios.post("/goods/buy", {
      id: o.id,
      userId: userInfo.id,
      userName: userInfo.username,
      num: buyNum.value,
    }, {requiresAuth: true});
    buyNum.value = 0;
    getGoodsDetail();
    return res.data; // 明确返回响应数据
  } catch (error) {
    throw error; // 抛出错误以便外部捕获
  }
}

// 加入购物车
const addCart = (id: string) => {
  axios.post("/goods/addCart", {
    id: id,
    userId: userInfo.id,
    num: buyNum.value,
  }, {requiresAuth: true}).then((res) => {
    buyNum.value = 0
    getGoodsDetail()
    if (res.data.code == 0){
      ElNotification({
        type: "success",
        message: "加入购物车成功"
      })
    }else {
      ElNotification({
        type: "warning",
        message: "加入购物车失败"
      })
    }
  })
}

const goToPay = async (id: string) => {
  try {
    const params = {id: id, userId: userInfo.id}
    const res = await toBuy(params)
    if (!res) {
      ElMessage.error('购买失败')
    }
    if (res.code === 0) {
      window.open(
          `http://localhost:8080/api/alipay/pay?subject=${res.data.name}
          &traceNo=${res.data.id}&totalAmount=${res.data.amount}`
      )
      ElMessage.success('付款成功')
    } else {
      ElNotification({
        type: 'warning',
        message: res?.msg || '支付失败，请重试'
      })
    }
  } catch (error) {
    ElNotification({
      type: 'error',
      message: '支付请求失败'
    })
  }
}

</script>
<script lang="ts">
export default {
  name: 'goodsDetail'
}
</script>
<template>
  <div class="container">
    <div class="goodsDetail" v-if="goodsDetail">
      <div class="picture">
        <img :src="goodsDetail.url||'/img.jpg'"/>
      </div>
      <div class="info" v-if="goodsDetail">
        <div class="name">{{ goodsDetail.name }}</div>
        <div class="price">
          <div class="label">售价</div>
          <div class="content">{{ goodsDetail.price }}</div>
        </div>
        <div class="support">
          <ul>
            <li>保障</li>
            <li>正品保障</li>
            <li>专业包装</li>
            <li>包邮</li>
            <li>支持7天无理由</li>
            <li>48h内发货</li>
          </ul>
        </div>
        <div class="store">
          库存: {{ goodsDetail.num }}
        </div>
        <el-input-number v-model="buyNum" :min="0" :max="goodsDetail.num" @change="handleChange"/>
        <div class="button">
          <button
              class="buy"
              :style="{background: disable ? 'gray' : ''}"
              :disabled="disable"
              @click="goToPay(goodsDetail.id)"
          >立即购买</button>
          <button
              class="cart"
              :style="{background: disable ? 'gray' : ''}"
              :disabled="disable"
              @click="addCart(goodsDetail.id)"
          >加入购物车</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../style/goodsDetail.css";
</style>
