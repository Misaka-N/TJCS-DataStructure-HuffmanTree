<template>
    <section v-if="showIndex === 0">
        <div class="logo"><img class="tree" src="@/assets/icon/logo.svg"/></div>
        <div class="caption"><span style="letter-spacing: 0;">Huffma</span>n编码</div>
        <ul class="options">
            <li @click="changePage(1)">关键值建树</li>
            <li @click="changePage(2)">文本内容建树</li>
        </ul>
    </section>
    <section v-else-if="showIndex === 1">
        <div class="title">关键值建树</div>
        <Keyword></Keyword>
    </section>
    <section v-else-if="showIndex === 2">
        <div class="title">文本内容建树</div>
        <Text></Text>
    </section>

</template>

<script setup>
import {ref} from 'vue'
import Keyword from "@/components/Keyword.vue";
import Text from "@/components/Text.vue";


const showIndex = ref(0)        // 当前要显示哪个网页


const changePage=(index)=>{
    showIndex.value = index
}



</script>

<style scoped>
.logo{
    width: 200px;
    height: 200px;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 1000px;
    position: absolute;
    top: 30%;
    left: 50%;
    margin-left: -100px;
    margin-top: -100px;
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
}

.logo img{
    width: 60%;
    height: 60%;
    padding-left: 35px;
    padding-top: 40px;
}

.caption {
    height: 60px;
    width: 400px;
    font-family: STZhongsong;
    /*font-weight: bold;*/
    font-size: 56px;
    font-weight: bold;
    letter-spacing: 5px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
    position: absolute;
    top: 45%;
    left: 50%;
    margin-left: -200px;
}

.title {
    height: 60px;
    width: 400px;
    font-family: STZhongsong;
    /*font-weight: bold;*/
    font-size: 48px;
    font-weight: bold;
    letter-spacing: 3px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    color: white;
    text-align: center;
    position: absolute;
    top: 3%;
    left: 50%;
    margin-left: -200px;
}

.options{
    display: block;
    width: 600px;
    height: 300px;
    list-style-type: none;
    position: absolute;
    top: 55%;
    left: 50%;
    margin-left: -300px;
}

.options li{
    display: block;
    width: 300px;
    height: 75px;
    background-color: rgba(255,255,255,0.4);
    box-shadow: 0 0 20px rgba(0,0,0,0.2);
    border-radius: 1000px;
    font-family: STZhongsong;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 36px;
    margin: auto;
    margin-top: 50px;
    text-align: center;
    padding-top: 17px;
    transition: box-shadow 0.5s ease;
}

.options li:hover{
    box-shadow: 0 0 30px rgba(0,0,0,0.5);
}

</style>