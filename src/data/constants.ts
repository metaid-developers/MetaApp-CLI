import {type Network } from '@/stores/network'

export const NETWORK: Network = import.meta.env.VITE_NET_WORK_NEW || 'livenet'

export const SIGNING_MESSAGE =import.meta.env.VITE_APP_NAME

export const MAN_PUB_KEY='048add0a6298f10a97785f7dd069eedb83d279a6f03e73deec0549e7d6fcaac4eef2c279cf7608be907a73c89eb44c28db084c27b588f1bd869321a6f104ec642d'

export const NodeName = {
    SimpleBuzz: 'simplebuzz',
    PayLike: 'paylike',
    File:'file',
} as const;

export type NodeName = typeof NodeName[keyof typeof NodeName];

export const NodeCollection={
    [NodeName.File]:{
        path:'/file',
        body:'',
        contentType:'',
        encryption: '0',
        version: '1.0.0',
        encoding: ''
    }
}

export const ProtocolCollection = {
    // Example usage with NodeName type
    [NodeName.SimpleBuzz]: {
        protocol: 'simplebuzz',
        path: '/protocols/simplebuzz',
        body:{
            content:'',//buzz消息内容
            contentType:'application/json',
            attachments:[], //附件列表,格式为[‘metafile://{PinID}’],其中PinID为附件的PinID
            quotePin:'' //引用的buzz PinID,如果是转发则需要指定
        },
        contentType: 'text/plain;utf-8',
        encryption: '0',
        version: '1.0.0',
        encoding: 'utf-8'
    },

    [NodeName.PayLike]: {
        protocol: 'paylike',
        path: '/protocols/paylike',
        body:{
            isLike:'1', //1 点赞 0 取消点赞
            likeTo:'' //要指定点赞的buzz PinID
        },
        contentType: 'text/plain;utf-8',
        encryption: '0',
        version: '1.0.0',
        encoding: 'utf-8'
    },

};