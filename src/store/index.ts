import {defineStore} from "pinia";
import {UserInfo} from "../interface/userInterface.ts";

export const useMainStore =  defineStore('user',{
    // 类似于Vue2组件中的data，用于存储全局状态数据，但有两个要求
    // 1. 必须是函数，目的是为了在服务端渲染的时候避免交叉请求导致的数据状态污染
    // 2. 必须是箭头函数，这样是为了更好的 TS 类型推导
    state:()=>{
        return {
            userInfo: {
                id: '',
                username: '',
                gender: '',
                headUrl: '',
                email: '',
                realName: '',
            } as UserInfo,
            loginPop: {
                toLogin: false,
                isLogin: true,
                isForget: false
            },
            token: ''
        }
    },
    getters:{},
    actions:{
        setUserInfo (data:any) {
            this.userInfo = data
        },
        delUserInfo () {
            this.userInfo = {}
            this.token = ''
        },
        setToken (token: any) {
            this.token = token
        },
        handleRegister() {
            this.loginPop.toLogin = true
            this.loginPop.isLogin = false
        },
        handleLogin() {
            this.loginPop.toLogin = true
            this.loginPop.isLogin = true
        },
        handleClose() {
            this.loginPop.toLogin = false
            this.loginPop.isLogin = true
            this.loginPop.isForget = false
        }
    },
    persist: true
})
