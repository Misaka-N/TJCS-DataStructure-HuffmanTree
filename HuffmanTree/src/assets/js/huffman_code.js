export class HuffmanTree {
    keywordsDict = []

    init(keywords) {//初始化函数
        for (let i = 0; i < keywords.length; i++)
            this.keywordsDict.push({
                keyword: keywords[i].item,
                priority: keywords[i].priority,
                father: -1,
                lchild: -1,
                rchild: -1,
                code: ''
            })
        for (let i = 0; i < keywords.length - 1; i++)
            this.keywordsDict.push({
                keyword: '',
                priority: 999999,
                father: -1,
                lchild: -1,
                rchild: -1,
                code: ''
            })
    }

    Select(num)//查找两个father为-1且权重最小的结点
    {
        let min_weight1 = 9999999, min_weight2 = 9999999;
        let s1 = -1, s2 = -1;
        for (let i = 0; i < num; i++) {
            if (this.keywordsDict[i].father === -1 && this.keywordsDict[i].priority < min_weight1) {
                min_weight2 = min_weight1;
                s2 = s1;
                min_weight1 = this.keywordsDict[i].priority;
                s1 = i;
            } else if (this.keywordsDict[i].father === -1 && this.keywordsDict[i].priority < min_weight2) {
                s2 = i;
                min_weight2 = this.keywordsDict[i].priority;
            }
        }
        return {s1: s1, s2: s2};
    }

    HuffmanCode(now, code)//建立每个字符的哈夫曼编码
    {
        this.keywordsDict[now].code = code;
        if (this.keywordsDict[now].lchild !== -1)
            this.HuffmanCode(this.keywordsDict[now].lchild, code + '0');
        if (this.keywordsDict[now].rchild !== -1)
            this.HuffmanCode(this.keywordsDict[now].rchild, code + '1');
    }

    HuffmanTreeCreat(keywords)//建立哈夫曼树
    {
        let num = keywords.length;
        this.init(keywords)
        if (this.keywordsDict.length < 1)
            return;
        else if (this.keywordsDict.length === 1) {
            this.keywordsDict[0].code = '0';
            return;
        }
        for (let i = num; i < 2 * num - 1; i++) {
            let res = this.Select(i);
            this.keywordsDict[res.s1].father = i, this.keywordsDict[res.s2].father = i;
            this.keywordsDict[i].lchild = res.s1, this.keywordsDict[i].rchild = res.s2;
            this.keywordsDict[i].priority = this.keywordsDict[res.s1].priority + this.keywordsDict[res.s2].priority;
        }
        this.HuffmanCode(2 * num - 2, '')
    }

}


