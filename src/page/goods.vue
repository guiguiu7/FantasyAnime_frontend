<script setup lang="ts">

import {computed, onMounted, ref} from "vue";
import {Cart, Goods, Order} from "../interface/interface.ts";
import axios from "axios";
import {useRouter} from "vue-router";
import {ElMessage, ElNotification} from "element-plus";
import {useMainStore} from "../store";

const userStore = useMainStore()
const userInfo = userStore.userInfo

const goodsList = ref<Goods[]>()
const router = useRouter()
const cartList = ref<Cart[]>()
const orderList = ref<Order[]>()

onMounted(() => {
  getGoodsList()
})

function toDetail(id: string) {
  router.push({path: '/goods/goodsDetail', query: {id: id}})
}

const getGoodsList = () => {
  axios.get("/goods").then((res) => {
    goodsList.value = res.data
  })
}

const getCartList = () => {
  axios.get(`/goods/cart/${userInfo.id}`, {requiresAuth: true}).then((res) => {
    cartList.value = res.data.data
  })
}
const getOrderList = () => {
  axios.get(`/goods/order/${userInfo.id}`, {requiresAuth: true}).then((res) => {
    orderList.value = res.data.data
  })
}
// 从购物车移除商品
const removeCart = (id: string) => {
  axios.post("/goods/removeCart", {id: id, userId: userInfo.id}, {requiresAuth: true}).then((res) => {
    getCartList()
    if (res.data.code == 0) {
      ElNotification({
        type: "success",
        message: "删除成功"
      })
      getCartList()
    } else {
      ElNotification({
        type: "warning",
        message: "删除失败"
      })
    }
  })
}

// 移除订单
const removeOrder = (id: string) => {
  axios.post("/goods/removeOrder", {id: id, userId: userInfo.id}, {requiresAuth: true}).then((res) => {
    getOrderList()
    if (res.data.code == 0){
      ElNotification({
        type: "success",
        message: "删除成功"
      })
      getOrderList()
    }else {
      ElNotification({
        type: "warning",
        message: "删除失败"
      })
    }
  })
}

// 总价格
const total = computed(() => {
  let tempTotal = 0
  if (cartList.value != undefined) {
    cartList.value.map(item => {
      tempTotal += item.price
    })
  }
  return tempTotal;
})

// 订单支付
const goToPay = async (id: string) => {
  try {
    const response = await axios.get(`/goods/orderInfo/${id}`, {requiresAuth: true})
    const res = response.data.data
    if (!res) {
      ElMessage.error('购买失败')
    }
    if (res.code === 0) {
      window.open(
          `http://localhost:8080/api/alipay/pay?subject=${res.data.name}&traceNo=${res.data.id}&totalAmount=${res.data.amount}`
      )
      ElMessage.success('付款成功')
      // 如果 load 是加载数据的方法，需要定义或导入
      getOrderList()
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

// 购物车购买
const goToPayCart = async (id: string) => {
  try {
    const response = await axios.get(`/goods/cartInfo/${id}`,{requiresAuth: true} )
    const res = response.data.data
    if (!res) {
      ElMessage.error('购买失败')
    }
    console.log('res:', res)

    if (res.code === 0) {
      window.open(
          `http://localhost:8080/api/alipay/pay?subject=${res.data.name}&traceNo=${res.data.id}&totalAmount=${res.data.amount}`
      )
      ElMessage.success('付款成功')

      // 如果 load 是加载数据的方法，需要定义或导入
      getCartList()

      // 如果需要路由跳转
      // router.push('/some-path')
    } else {
      ElNotification({
        type: 'warning',
        message: res?.msg || '支付失败，请重试'
      })
    }
  } catch (error) {
    console.error('支付出错:', error)
    ElNotification({
      type: 'error',
      message: '支付请求失败，请检查网络'
    })
  }
}
</script>
<script lang="ts">
export default {
  name: "goods"
}
</script>
<template>
  <div class="container">
    <div class="goods-card">
      <a class="card-item" v-for="o in goodsList" :key="o.id" @click="toDetail(o.id)">
        <el-card shadow="hover" style="max-width: 360px">
          <img
              :src="o.url||'/img.jpg'"
              style="height: 300px;width: 100%;object-fit: contain"
          />
          <template #footer>
            <div class="good-name">{{ o.name }}</div>
            <div class="good-price">{{ o.price }}</div>
          </template>
        </el-card>
      </a>
    </div>
  </div>
  <div class="order">
    <el-popover
        placement="left-end"
        title="订单"
        :width="460"
        trigger="click"
        :persistent="false"
        v-if="userInfo.id"
    >
      <template #reference>
        <el-button @click="getOrderList()">
          <el-icon size="35" color="hotpink">
            <Tickets/>
          </el-icon>
        </el-button>
      </template>
      <template #default>
        <div style="height: 550px; overflow-y:auto;">
          <div class="order-item" v-for="o in orderList" :key="o.id">
            <div class="picture">
              <img :src="o.url||'/img.jpg'" alt="商品图片">
            </div>
            <div class="info">
              <div class="name" :title="o.goodName">名称:&nbsp{{ o.goodName }}</div>
              <div class="price">价格:&nbsp{{ o.price }}</div>
              <div class="number">数量:&nbsp{{ o.num }}</div>
            </div>
            <div class="status">
              {{ o.status }}
            </div>

              <div class="button">
                <button class="buy" @click="goToPay(o.id)"
                        :style="{visibility: o.status == '已支付' ? 'hidden' : 'visible'}">支付
                </button>
                <button class="delete" @click="removeOrder(o.id)">删除</button>
              </div>

          </div>
        </div>
      </template>
    </el-popover>
  </div>
  <div class="cart">
    <el-popover
        placement="left-end"
        title="购物车"
        :width="460"
        trigger="click"
        :popper-style="{height: 300}"
        v-if="userInfo.id"
    >
      <template #reference>
        <el-button @click="getCartList()">
          <el-icon size="35" color="hotpink">
            <ShoppingCart/>
          </el-icon>
        </el-button>
      </template>
      <template #default>
        <div style="height: 600px; overflow-y:auto;">
          <div class="goods-item" v-for="o in cartList" :key="o.id" v-if="cartList">
            <div class="picture">
              <img :src="o.url||'/img.jpg'" alt="商品图片">
            </div>
            <div class="info">
              <div class="name" :title="o.name">名称:&nbsp{{ o.name }}</div>
              <div class="price">价格:&nbsp{{ o.price }}</div>
              <div class="number">
                <el-input-number :disabled="true" v-model="o.num"/>
              </div>
            </div>
            <div class="button">
              <button class="buy" @click="goToPayCart(o.id)">购买</button>
              <button class="delete" @click="removeCart(o.id)">删除</button>
            </div>
          </div>
          <div class="cart-footer">
            <div class="total">
              共计:&nbsp{{ total }}
            </div>
          </div>
        </div>
      </template>
    </el-popover>
  </div>
</template>

<style scoped>
@import "../style/goods.css";

:deep(.el-card) {
  width: 360px;
}

:deep(.el-card__footer) {
  padding: 0 10px 10px 10px;
  border-top: none;
}

:deep(.el-button) {
  border-radius: 30px;
  height: 60px;
  width: 60px;
}

:deep(.el-popper) {
  height: 200px;
  overflow: hidden;
}
</style>
