// 前端数据
export interface Banner {
    animeId: string,
    name: string,
    url: string
}

export interface Anime {
    name: string,
    animeInfoVos: [AnimeInfo]
}

export interface AnimeInfo {
    id: string,
    name: string,
    url: string,
}

export interface AnimeType {
    id: string,
    name: string
}

export interface AnimeInfoVO {
    name: '',
    genres: '',
    synopsis: '',
    imageUrl: '',
    episodes: ''
}

export interface AnimeInfoProps {
    id: string
    name: string,
    genres: string,
    synopsis: string,
    url: string,
    episodes: string
}


export interface AnimePlayList {
    animeId: string,
    animeName: string,
    likes: number,
    isLike: boolean,
    isCollect: boolean,
    playList: PlayList[]
}

export interface PlayList {
    id: string,
    description: string,
    num: number,
    title: string,
    url: string,
}

export interface Article {
    id: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string,
    likes: number,
    views: number,
    createTime: string,
    isShow: boolean,
    isLike: boolean,
    isExpanded: boolean,
    replyValue: string
    replyComment: Comment[]
}

export interface Comment {
    id: string,
    userId: string,
    articleId: string,
    animeId: string,
    content: string,
    createTime: string,
    userName: string,
    userAvatar: string
}

export interface Goods {
    id: string,
    name: string,
    price: number,
    url: string
}

export interface GoodsDetail {
    id: string,
    name: string,
    price: number,
    url: string,
    num: number
}

export interface Cart {
    id: string,
    name: string,
    price: number,
    url: string,
    num: number,
    total: number
}

export interface Order{
    id: string,
    goodName: string,
    price: number,
    url: string,
    num: number,
    status: string
}


export interface Activity {
    id: string,
    name: string,
    content: string,
    startTime: string,
    endTime: string,
    organizer: string,
    organizerId: string,
    number: number
}
