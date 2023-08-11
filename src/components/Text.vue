<template>
    <section v-if="!ifShow">
        <a class="back-button" href="../../index.html">
            <ArrowLeft style="width: 30px; height: 30px; margin-left: 15px;margin-top: 15px"/>
        </a>
        <div class="text-container">
            <el-input
                class="text-input"
                v-model="text"
                :autosize="{ minRows: 1, maxRows: 21 }"
                type="textarea"
                placeholder="请输入文本内容或导入文本文件"
                resize="none"
                :input-style="input_style"
            />
        </div>
        <div class="input-container">
            <div class="input-button">
                <el-upload
                    ref="upload"
                    class="upload-demo"
                    action="#"
                    :limit="1"
                    :before-upload="beforeFileUpload"
                    :on-change="handleFileChange"
                    :on-exceed="handleExceed"
                    :auto-upload="true"
                >
                    <template #trigger>
                        <el-button :icon="Upload" round plain color="#8dc6ff" size="large"
                                   style="width: 200px !important;">上传文件
                        </el-button>
                    </template>
                </el-upload>
                <el-button :icon="Refresh" round plain color="#8dc6ff" size="large" style="width: 200px !important;"
                           @click="randomGenerate">随机生成
                </el-button>
            </div>
            <el-button :icon="Check" round plain color="#A2D9CE" size="large"
                       style="margin-bottom: 0px;margin-left: 0;" @click="createTree">
                生成Huffman树
            </el-button>
        </div>
    </section>
    <section v-else>
        <HuffmanTree :keywords="content" v-model="ifShow" @backPage="ifShow=false;"></HuffmanTree>
    </section>

</template>

<script lang="ts" setup>
import {ref, reactive} from 'vue'
import {ElMessage, genFileId} from 'element-plus'
import {Check, ArrowLeft, Upload, Refresh} from '@element-plus/icons-vue'
import {PriorityQueue} from '../assets/js/priority_queue.js'
import HuffmanTree from "./HuffmanTree.vue";
import type {UploadInstance, UploadProps, UploadRawFile} from 'element-plus'


/* 定义一些变量 */
const content = ref([])
const ifShow = ref(false)       // 是否显示哈夫曼树页面
const text = ref("")            // 输入的文本内容
const input_style = {
    fontSize: "18px",
    backgroundColor: "transparent",
    boxShadow: "none"
}
const upload = ref<UploadInstance>()                // 上传文件用变量
const keywords = reactive(new PriorityQueue())      // 关键词组，是优先队列


const beforeFileUpload = (file) => {
    const filename = file.name;
    const ext = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);    // 获取文件的类型

    if (ext !== "txt") {
        ElMessage.error('文本文件必须为txt格式！')    // 不允许上传非txt格式文件，进行判断和拦截
        return false; // 返回 false，取消上传
    }
    return true;  // 返回 true，继续上传
};

/* 处理更换文件的情况 */
const handleExceed: UploadProps['onExceed'] = (files) => {

    const file = files[0] as UploadRawFile
    const filename = file.name;
    const ext = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);    // 获取文件的类型

    if (ext !== "txt") {
        ElMessage.error('文本文件必须为txt格式！')    // 不允许上传非txt格式文件，进行判断和拦截
        return   // 返回 false，取消上传
    }

    upload.value!.clearFiles()
    file.uid = genFileId()
    upload.value!.handleStart(file)
}


/* 处理上传文件的情况 */
const handleFileChange = (uploadEvent) => {
    const filename = uploadEvent.raw.name;
    const ext = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);    // 获取文件的类型

    if (ext !== "txt")      // 不允许上传非txt格式文件，进行判断和拦截
        return false;       // 返回 false，取消上传

    /* 否则可以正常读取 */
    const reader = new FileReader();
    reader.readAsText(uploadEvent.raw);

    reader.onload = (event) => {
        text.value = event.target.result.toString();
    };

    return true;
}


/* 随机生成文本 */
const randomGenerate = () => {
    const list = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!”$%&‘()+,–./:;<=>?@[\\]^_`{|}~"    // 可见字符集
    let length = Math.random() * 65535 + 1  // 随机生成1-65536个数
    text.value = ""                         // 先清空已有文本内容
    for (let i = 0; i < length; i++) {
        let id = Math.floor(Math.random() * list.length)
        text.value += list.charAt(id)
    }
}


/* 生成对应的关键词对 ，构建Huffman树 */
const createTree = () => {
    console.log(text.value)
    if (text.value.length === 0) {
        ElMessage.error('文本内容为空！')
        return
    }

    const charCount = {};
    const list = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!”$%&‘()+,–./:;<=>?@[\\]^_`{|}~"    // 可见字符集

    for (let char of text.value) {      // 统计各个字符出现的次数
        if (list.indexOf(char) === -1)      // d3.js处理不可见字符时会有问题，忽略掉这些字符
            continue
        if (charCount[char]) {
            charCount[char]++;
        } else {
            charCount[char] = 1;
        }
    }

    keywords.clear()        // 一定要先清空

    for (let char in charCount) {
        keywords.enqueue(char, charCount[char])
    }
    content.value = keywords.content();
    ifShow.value = true
}

</script>

<style lang="less" scoped>
.back-button {
    width: 60px;
    height: 60px;
    border-radius: 1000px;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    margin-top: 5%;
    position: absolute;
    bottom: 1.5%;
    right: 1.5%;
    animation: fadeIn 1s forwards;
    animation-fill-mode: both;
    animation-duration: 1s;
    transition: box-shadow 0.5s ease;
}

.back-button:hover {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
}

.text-container {
    width: 90%;
    height: 61%;
    position: absolute;
    top: 15%;
    left: 5%;
    z-index: 2;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 10px;
}

.input-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 300px;
    height: 150px;
    position: absolute;
    bottom: 5%;
    left: 50%;
    margin-left: -150px;
    z-index: 2;
}


.input-container a {
    display: inline-block;
    text-decoration: none;
    color: inherit;
}

.input-button {
    display: flex;
    width: 600px;
    height: 85px;
    margin-left: -150px;
    justify-content: space-between;
}


</style>
