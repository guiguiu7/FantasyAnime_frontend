export interface LoginInfo {
    username: string,
    password: string,
    email: string,
    captcha: string,
    uuid: string,
    verCode: string,
    operation: string
}

export interface UserInfo {
    id: string,
    username: string,
    gender: string,
    headUrl: string,
    email: string,
    realName: string
}

// 通用常量定义（如 constants.ts）
export const GENDER_MAP: { [key: number]: string } = {
    0: "男",
    1: "女",
    2: "保密",
};
