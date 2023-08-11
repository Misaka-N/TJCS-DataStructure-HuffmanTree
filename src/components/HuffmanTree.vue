<template>
    <a class="back-button" @click="$emit('backPage')">
        <ArrowLeft style="width: 30px; height: 30px; margin-left: 15px;margin-top: 15px"/>
    </a>
    <section>
        <div class="code-table">
            <el-scrollbar>
                <el-table stripe :data="huffman_tree.keywordsDict.splice(0,props.keywords.length)"
                          style="width: 95%;margin: 0 auto;" height="750">
                    <el-table-column fixed prop="keyword" label="关键词" width="75"/>
                    <el-table-column prop="code" label="编码" width="150"/>
                    <el-table-column fixed="right" prop="priority" label="频率" width="75"></el-table-column>
                </el-table>
            </el-scrollbar>
        </div>
        <div class="tree-table">
            <svg id="tree-svg"></svg>
            <div class="tree-tips">鼠标左键移动 滚轮缩放</div>
            <div class="tree-results">
                带权路径长：{{ weighted_path_length }}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;压缩率：{{ compressibility }}%
            </div>
        </div>
    </section>
</template>

<script setup>
/* 引入必要的组件和文件 */
import {ArrowLeft} from '@element-plus/icons-vue'
import {HuffmanTree} from '@/assets/js/huffman_code'
import {onMounted, ref} from "vue";
import * as d3 from "d3"


const props = defineProps(['keywords', 'ifShow'])
const emits = defineEmits(['backPage'])


/* 画图用到的一些宏定义 */
const SVG_WIDTH = 1120                      // 画布宽度
const SVG_HEIGHT = 750                      // 画布高度
const SVG_ROW_BLANK = 35                    // 画布不能占满，左右空隙大小
const SVG_COL_BLANK = 35                    // 上下也不能占满，上下空隙大小
const HEIGHT_STEP = 150                     // 深度小于五时计算高度的步长
const LEAF_NODE_COLOR = "#92C8FD"           // 叶结点的颜色
const OTHER_NODE_COLOR = "#F9E8B2"          // 非叶节点的颜色
const NODE_RADIUS = 30                      // 结点的半径
const FONT_SIZE = 24                        // 字体大小


/* 定义一些变量 */
const huffman_tree = new HuffmanTree();     // 树的全部信息
const tree_info = {nodes: [], links: []}    // 存储树中的结点信息和结点之间的连接关系
/*
*   结点信息：id：在哈夫曼树数组中的编号
*           index：在完全二叉树中的理论编号（用于计算坐标）
*           keyword：叶结点存储的关键词
*           if_leaf_node: 是否是叶结点
*           x：以左上角为原点，当前结点的横坐标（从左至右）
*           y：以左上角为原点，当前结点的纵坐标（从上至下）
*   连接信息：src：起点在nodes数组中的索引
*           dst：终点在nodes数组中的索引
*           if_left：是否是左孩子（对应编码0）
* */
let max_depth = 0;                            // 哈夫曼树的最大深度
const weighted_path_length = ref(0);    // 哈夫曼树带权路径长
let compressibility = ref(0);           // 压缩率


/* 按下回退按钮后返回上一界面，修改标志 */
const backPage = () => {
    props.ifShow = false;
}

/* 计算每个结点的坐标 */
const x_calculate = (now_index) => {
    let depth = Math.floor(Math.log2(now_index));       // 层数从0开始计算
    let num = 1 << depth;                               // 计算每层有多少个结点
    let width = SVG_WIDTH - 2 * SVG_ROW_BLANK;          // 去除空隙后的宽度
    if (width / (1 << max_depth) < 2 * NODE_RADIUS)
        width = 2 * NODE_RADIUS * (1 << max_depth)
    return SVG_ROW_BLANK + width / num * (now_index - num) + width / (num * 2);   // 计算x坐标
}

const y_calculate = (now_index) => {
    let depth = Math.floor(Math.log2(now_index));    // 层数从0开始计算
    let height = SVG_HEIGHT - 2 * SVG_COL_BLANK;     // 去除空隙后的高度

    if (max_depth < 5)                               // 分深度较深的树和较浅的树两种，两种的高度计算不同
    {
        return SVG_COL_BLANK + height / 2 + (depth - max_depth / 2) * HEIGHT_STEP;      // 计算y坐标
    } else {
        if (max_depth === 0)
            return SVG_COL_BLANK + height / 2;                      //避免除数是0
        else
            return SVG_COL_BLANK + height / max_depth * depth;      // 计算y坐标
    }
}

/* 生成组件后把树生成好 */
onMounted(() => {
    huffman_tree.HuffmanTreeCreat(props.keywords)
    initData(huffman_tree.keywordsDict.length - 1)
    creat_tree()
    get_path_length()
    get_compressibility()
})

/* 遍历整个树的信息，将其存储到结点数组和边数组中 */
const initData = (now_id, now_index = 1) => {
    tree_info.nodes.push({
        id: now_id,
        index: now_index,
        keyword: huffman_tree.keywordsDict[now_id].keyword,
        if_leaf_node: (huffman_tree.keywordsDict[now_id].lchild === -1 && huffman_tree.keywordsDict[now_id].rchild === -1),
        x: 0,
        y: 0
    })
    if (huffman_tree.keywordsDict[now_id].lchild === -1 && huffman_tree.keywordsDict[now_id].rchild === -1) {
        max_depth = Math.max(max_depth, Math.floor(Math.log2(now_index)))
        return
    }

    let length = tree_info.nodes.length

    if (huffman_tree.keywordsDict[now_id].lchild !== -1) {
        tree_info.links.push({
            src: length - 1,
            dst: tree_info.nodes.length,
            if_left: true
        })
        initData(huffman_tree.keywordsDict[now_id].lchild, now_index * 2);
    }
    if (huffman_tree.keywordsDict[now_id].rchild !== -1) {
        tree_info.links.push({
            src: length - 1,
            dst: tree_info.nodes.length,
            if_left: false
        })
        initData(huffman_tree.keywordsDict[now_id].rchild, now_index * 2 + 1);
    }
}

/* 根据得到的数据画图 */
const creat_tree = () => {
    const SVG = d3.select('#tree-svg');
    let g = SVG.append("g")             //整个图的group
        .attr("cursor", "grab");


    const ZOOM = d3.zoom().scaleExtent([0.1, 5.0]).on("zoom", zoomed);
    SVG.call(ZOOM);

    /* 缩放函数 */
    function zoomed(event) {
        const {transform} = event;
        g.attr("transform", transform);
    }


    /* 考虑到叠放次序，先画所有的连线 */
    for (let i = 0; i < tree_info.links.length; i++) {
        tree_info.nodes[tree_info.links[i].src].x = x_calculate(tree_info.nodes[tree_info.links[i].src].index)
        tree_info.nodes[tree_info.links[i].dst].x = x_calculate(tree_info.nodes[tree_info.links[i].dst].index)
        tree_info.nodes[tree_info.links[i].src].y = y_calculate(tree_info.nodes[tree_info.links[i].src].index)
        tree_info.nodes[tree_info.links[i].dst].y = y_calculate(tree_info.nodes[tree_info.links[i].dst].index)

        g.append("line")
            .attr("x1", tree_info.nodes[tree_info.links[i].src].x)
            .attr("x2", tree_info.nodes[tree_info.links[i].dst].x)
            .attr("y1", tree_info.nodes[tree_info.links[i].src].y)
            .attr("y2", tree_info.nodes[tree_info.links[i].dst].y)
            .attr("stroke", "#DDDDDD")
            .attr("stroke-width", 3)
        //     .on("end", dragended));
        let content = '1'
        if (tree_info.links[i].if_left)
            content = '0'
        g.append("text")
            .text(content)
            .attr("x", (tree_info.nodes[tree_info.links[i].src].x + tree_info.nodes[tree_info.links[i].dst].x) / 2)
            .attr("y", (tree_info.nodes[tree_info.links[i].src].y + tree_info.nodes[tree_info.links[i].dst].y) / 2)
            // .attr("dy", -5)
            .style("font-family", "STZhongSong")
            .style("font-size", 2 * FONT_SIZE / 3)
            .style("fill", "#888888")
            .style("text-shadow", "0 0 4px rgba(0,0,0,0.2)")
            .style("text-anchor", "middle")                 // 文本水平居中
            .style("dominant-baseline", "middle");          // 文本垂直居中
    }

    /* 之后再画所有的结点 */
    for (let i = 0; i < tree_info.nodes.length; i++) {
        if (tree_info.nodes[i].if_leaf_node) {
            g.append("circle")
                .attr("cx", tree_info.nodes[i].x)
                .attr("cy", tree_info.nodes[i].y)
                .attr("r", NODE_RADIUS)
                .attr("fill", LEAF_NODE_COLOR)
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged_cir) // 使用箭头函数传递正确的上下文
            //     .on("end", dragended));
            g.append("text")
                .text(`${huffman_tree.keywordsDict[tree_info.nodes[i].id].priority}`)
                .attr("x", tree_info.nodes[i].x)
                .attr("y", tree_info.nodes[i].y)
                .attr("dy", 2) // 调整文本相对于圆心的垂直位置
                .style("font-family", "STZhongSong")
                .style("font-size", FONT_SIZE)
                .style("fill", "#EEEEEE")
                .style("text-shadow", "0 0 4px rgba(0,0,0,0.2)")
                .style("text-anchor", "middle")                 // 文本水平居中
                .style("dominant-baseline", "middle");          // 文本垂直居中
            g.append("text")
                .text(`${huffman_tree.keywordsDict[tree_info.nodes[i].id].keyword}`)
                .attr("x", tree_info.nodes[i].x)
                .attr("y", tree_info.nodes[i].y)
                .attr("dy", 50) // 调整文本相对于圆心的垂直位置
                .style("font-family", "STZhongSong")
                .style("font-size", FONT_SIZE)
                .style("fill", "#888888")
                .style("text-shadow", "0 0 4px rgba(0,0,0,0.2)")
                .style("text-anchor", "middle")                 // 文本水平居中
                .style("dominant-baseline", "middle");          // 文本垂直居中
        } else {
            g.append("rect")
                .attr("x", tree_info.nodes[i].x - NODE_RADIUS)
                .attr("y", tree_info.nodes[i].y - NODE_RADIUS)
                .attr("width", 2 * NODE_RADIUS)
                .attr("height", 2 * NODE_RADIUS)
                .attr("fill", OTHER_NODE_COLOR)
            // .call(d3.drag()
            //     .on("start", dragstarted)
            //     .on("drag", dragged_rec) // 使用箭头函数传递正确的上下文
            //     .on("end", dragended));
            g.append("text")
                .text(`${huffman_tree.keywordsDict[tree_info.nodes[i].id].priority}`)
                .attr("x", tree_info.nodes[i].x)
                .attr("y", tree_info.nodes[i].y)
                .attr("dy", 2) // 调整文本相对于圆心的垂直位置
                .style("font-family", "STZhongSong")
                .style("font-size", FONT_SIZE)
                .style("fill", "#888888")
                .style("text-shadow", "0 0 4px rgba(0,0,0,0.2)")
                .style("text-anchor", "middle")                 // 文本水平居中
                .style("dominant-baseline", "middle");          // 文本垂直居中
        }
    }
    // function dragstarted() {
    //     d3.select(this).raise();
    //     g.attr("cursor", "grabbing");
    // }
    //
    // function dragged_cir(event) {
    //     let node = d3.select(this)
    //     node.attr("cx", node.x = event.x).attr("cy", node.y = event.y);
    // }
    //
    // function dragged_rec(event) {
    //     let node = d3.select(this)
    //     node.attr("x", node.x = event.x - NODE_RADIUS).attr("y", node.y = event.y - NODE_RADIUS);
    // }
    //
    // function dragended() {
    //     g.attr("cursor", "grab");
    // }

}

/* 计算带权路径长 */
const get_path_length = () => {
    for (let i = 0; i < tree_info.nodes.length; i++)
        if (tree_info.nodes[i].if_leaf_node) {
            weighted_path_length.value += huffman_tree.keywordsDict[tree_info.nodes[i].id].priority * huffman_tree.keywordsDict[tree_info.nodes[i].id].code.length
        }
}

/* 计算压缩率 */
const get_compressibility = () => {
    let origin_len = 0;
    let compress_len = 0;
    for (let i = 0; i < tree_info.nodes.length; i++)
        if (tree_info.nodes[i].if_leaf_node) {
            origin_len += huffman_tree.keywordsDict[tree_info.nodes[i].id].priority * 8
            compress_len += huffman_tree.keywordsDict[tree_info.nodes[i].id].priority * huffman_tree.keywordsDict[tree_info.nodes[i].id].code.length
        }
    compressibility.value = ((origin_len - compress_len) / origin_len * 100).toFixed(2);
}


</script>

<style scoped>
@keyframes fadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

section {
    display: flex;
    justify-content: center;
    width: 90%;
    height: 80%;
    position: absolute;
    top: 13%;
    left: 5%;
    animation: fadeIn 1s forwards;
    animation-fill-mode: both;
    animation-duration: 1s;
}

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

.code-table {
    width: 320px;
    height: 750px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.tree-table {
    width: 1120px;
    height: 750px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    margin-left: 30px;
    position: relative;
}

#tree-svg {
    position: relative;
    width: 1120px;
    height: 750px;
}

.tree-tips {
    color: #888888;
    font-size: 18px;
    font-family: STZhongsong;
    position: absolute;
    right: 20px;
    bottom: 20px;
}

.tree-results {
    color: #888888;
    font-size: 18px;
    font-family: STZhongsong;
    position: absolute;
    left: 20px;
    bottom: 20px;
}
</style>