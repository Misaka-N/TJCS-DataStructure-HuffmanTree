<template>
    <section v-if="!ifShow">
        <a class="back-button" href="../../index.html">
            <ArrowLeft style="width: 30px; height: 30px; margin-left: 15px;margin-top: 15px"/>
        </a>
        <div class="keyword-container">
            <el-scrollbar max-height="550px">
                <p v-for="item in count" :key="item" class="scrollbar-demo-item">
                    <div v-for="index in 10" :key="index" :style="getAnimationStyle(index)" class="keyword-box">
                        <div v-if="(item-1)*10+index-1<keywords.size()" class="keyword-up">
                            {{ content[(item - 1) * 10 + index - 1].item }}
                        </div>
                        <div v-if="(item-1)*10+index-1<keywords.size()" class="keyword-down">
                            {{ scientificNotation(content[(item - 1) * 10 + index - 1].priority) }}
                        </div>
                        <div class="keyword-button">
                            <el-button v-if="(item-1)*10+index-1<keywords.size()" type="danger" :icon="Delete" circle
                                       @click="deleteKeyword(item,index)"/>
                        </div>
                    </div>
                </p>
            </el-scrollbar>
        </div>
        <div class="input-container">
            <div class="input-line">
                <div class="input-frame-1">
                    <el-input v-model="input" maxlength="1"/>
                </div>
                <div class="input-frame-2">
                    <el-input-number v-model="num" :min="1"/>
                </div>
            </div>
            <el-button :icon="Upload" round plain color="#8dc6ff" size="large" @click="addKeyword">添加关键词
            </el-button>
            <el-button :icon="Check" round plain color="#A2D9CE" size="large" style="margin-top: 20px;margin-left: 0;"
                       @click="createTree()">
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
import {ElMessage} from 'element-plus'
import {Upload, Check, Delete, ArrowLeft} from '@element-plus/icons-vue'
import {PriorityQueue} from '../assets/js/priority_queue.js'
import HuffmanTree from "./HuffmanTree.vue";

const count = ref(0)
const input = ref('')
const num = ref(1)
const keywords = reactive(new PriorityQueue())
const content = ref([])
const ifShow = ref(false)

const scientificNotation = (value) => {
    if (value >= 1e6)
        return value.toExponential(2);
    else
        return value
}

const getAnimationStyle = (index) => {
    const delay = index * 100; // 延迟时间基于索引值，可以根据需要调整
    return {
        animationDelay: `${delay}ms`,
    };
};
const addKeyword = () => {
    if (input.value === "") {
        ElMessage.error('关键词不能为空！')
        return;
    }

    const list = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!”$%&‘()+,–./:;<=>?@[\\]^_`{|}~"    // 可见字符集

    if (list.indexOf(input.value) === -1) {
        ElMessage.error('关键词错误！（范围：0-9，a-z，A-Z，及其他可见英文标点符号）')
        return;
    }

    if (!keywords.enqueue(input.value, num.value)) {
        ElMessage.error('关键词重复，请重新输入!')
        return;
    }



    if (!keywords.isEmpty())
        count.value = ~~(keywords.size() / 10) + 1;
    else
        count.value = 0;
    content.value = keywords.content();
}

const deleteKeyword = (item, index) => {
    keywords.dequeue((item - 1) * 10 + index - 1);
    content.value = keywords.content();
}

const createTree = () => {
    if (!keywords.size()) {
        ElMessage.error('关键值表为空，请添加后再生成！')
        return;
    }
    ifShow.value = true;
}

</script>

<style scoped>
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

.keyword-container {
    width: 90%;
    height: 60%;
    position: absolute;
    top: 15%;
    left: 5%;
    z-index: 2;
}

el-scrollbar {
    position: relative;
}

.scrollbar-demo-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    margin: 10px;
}

.input-line {
    display: flex;
    justify-content: center;
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

.input-line .input-frame-1, .input-frame-2 {
    width: 100px;
    margin-bottom: 30px;
    margin-right: 50px;
}

el-input {
    font-size: 50px;
}

.keyword-box {
    width: 180px;
    height: 200px;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
}

.keyword-box:first-child {
    margin-left: 0;
}

.keyword-up,
.keyword-down {
    margin: 0 auto;
    width: 110px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.6);
    border-right: 3px solid rgba(50, 50, 50, 0.2);
    text-align: center;
    font-family: STZhongsong;
    color: rgba(50, 50, 50, 0.5);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.keyword-up {
    height: 100px;
    z-index: 3;
    font-size: 40px;
    padding-top: 25px;
}

.keyword-down {
    height: 80px;
    border-bottom: 3px solid rgba(50, 50, 50, 0.2);
    font-size: 24px;
    padding-top: 30px;
}

.keyword-button {
    width: 50px;
    height: 50px;
    position: absolute;
    left: 1%;
    top: 0%;
    z-index: 4;
    margin-top: -10px;
}

.input-container a {
    display: inline-block;
    text-decoration: none;
    color: inherit;
}


</style>
