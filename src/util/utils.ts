import {UserInfo} from "../interface/userInterface.ts";
import axios from "axios";
import {ref} from "vue";

/**
 * 获取uuid
 */
export const getUuid = (): string => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// export const getUserInfo = (token: string): UserInfo => {
//     const userInfo = ref<UserInfo>()
//     axios.get("http://127.0.0.1:8080/sys/user/info", {headers: {'token': token}}).then(({data}) => {
//         userInfo.value = data.data
//     })
//     return <UserInfo>userInfo.value;
// }
