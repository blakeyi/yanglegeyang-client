import { _decorator, Component, Node, Sprite, Prefab, instantiate, Vec3, log, Button, Vec2, tween } from 'cc';
const { ccclass, property } = _decorator;



interface itemNode {
    node: Node
    postion: Vec3,
    id: number
}

interface eventData {
    id: number,
    itemIndex: number
}

const ITEM_WIDTH = 50
const ITEM_HEIGHT = 55

@ccclass('Layout')
export class Layout extends Component {

    @property({ type: [Prefab] })
    private items: Prefab[] = []

    @property({ type: Node })
    private storeNode: Node = null

    @property({ type: Number })
    private itemNum = 3

    @property({ type: Number })
    private layoutWidth = 450

    private itemList: itemNode[] = []


    start() {

    }
    // 所有的方块都需要在layout的范围内,
    onLoad() {
        let oriPos = this.node.getPosition();
        log(oriPos)
        const ROW_NUM = this.layoutWidth / ITEM_WIDTH
        let posArr = this.getPosArray(ROW_NUM, ITEM_WIDTH, ITEM_HEIGHT)
        log(posArr)
        const arrLen = posArr.length
        for (let i = 0; i < this.itemNum; i++) {
            let itemIndex: number = i % 3
            let tempNode: Node = instantiate(this.items[itemIndex])
            // 随机产生一个值在 0 到 arrLen 中的数
            let posIndex = Math.floor(Math.random() * arrLen)
            tempNode.setPosition(posArr[posIndex])
            this.addClickEvent(tempNode, {
                itemIndex: itemIndex,
                id: i
            })

            this.itemList.push({
                node: tempNode,
                postion: posArr[posIndex],
                id: i
            })
            this.node.addChild(tempNode)

        }
        // 计算是否被遮挡了
        this.setGrayNode(ITEM_WIDTH, ITEM_HEIGHT)

    }

    setGrayNode(itemWidth: number, itemHeight: number) {
        // 从后往前遍历, 因为最后添加的都在上面, 所以检查上面的区域是否被占了就ok
        let posMap = new Map()
        for (let i = this.itemList.length - 1; i >= 0; i--) {
            const item = this.itemList[i]
            // 检查是否有中心点重复的
            let replicate = false
            if (posMap.has(item.postion)) {
                replicate = true
                item.node.getComponent(Sprite).grayscale = true
            } else {
                // 遍历检查是否有重叠部分的
                posMap.forEach((_, key) => {
                    if (this.isReplicate(key, item.postion, itemWidth, itemHeight)) {
                        replicate = true
                        item.node.getComponent(Sprite).grayscale = true
                    }
                })
                posMap.set(item.postion, true)
            }
            if (!replicate) {
                item.node.getComponent(Sprite).grayscale = false
            }
        }
    }

    // 检查是否重叠, 通过判断中心点的距离
    isReplicate(vec1: Vec3, vec2: Vec3, itemWidth: number, itemHeight: number) {
        return Math.abs(vec1.x - vec2.x) < itemWidth && Math.abs(vec1.y - vec2.y) < itemHeight
    }

    // 根据行数获取所有能放的位置
    getPosArray(rowNum: number, itemWidth: number, itemHeight: number): Vec3[] {
        let res = []
        let length = 2 * rowNum - 1
        let mid = Math.floor(length / 2)
        for (let i = 0; i < length; i++) {
            // 每一行的高度是一样的
            let y = (mid - i) * itemHeight / 2
            for (let j = 0; j < length; j++) {
                let x = (j - mid) * itemWidth / 2 // 需要除2,可以重叠一半
                res.push(new Vec3(x, y, 0))
            }
        }
        return res
    }

    addClickEvent(node: Node, customEventData: eventData) {
        // log(node)
        let button = node.getComponent(Button);
        let eventHandler = new Component.EventHandler();
        eventHandler.target = this.node;
        eventHandler.component = "Layout"; // 界面上不会显示绑定上了
        eventHandler.handler = "onItemClick";
        eventHandler.customEventData = JSON.stringify(customEventData)

        button.clickEvents.push(eventHandler);
    }
    // 根据行列的最大数生成n个点位
    getPosition(num: number, row: number, col: number) {
        // log(num, row, col)
        let posArr = []
        for (let i = 0; i < num; i++) {
            let x = Math.floor((Math.random() - 0.5) * col * 4)
            let y = Math.floor((Math.random() - 0.5) * row * 4)
            posArr.push({
                x,
                y
            })
        }
        return posArr
    }

    update(deltaTime: number) {

    }

    onItemClick(event, customEventData: string) {
        let curNode = event.currentTarget
        if (curNode.parent.name === "ThingStore") {
            return
        }
        log("点击了", curNode.getPosition())
        let name = curNode.name
        let status = curNode.getComponent(Sprite).grayscale
        log(name, status)
        if (!status) {
            // 计算当前摆放位置坐标
            //this.storeNode.addChild(curNode)
            let data: eventData = JSON.parse(customEventData)
            let endPos = this.calcPosInStore(data.itemIndex)

            // 移动到目标位置
            let t = tween(curNode)
            t.to(0.3, { position: endPos.postion }).call(() => {
                // 重新生成一个
                // let tempNode:Node = instantiate(this.items[data.itemIndex])
                // this.storeNode.addChild(curNode)
                // 从itemList中删除
                this.itemList = this.itemList.filter(item => item.id !== data.id)
                // 刷新状态
                this.setGrayNode(ITEM_WIDTH, ITEM_HEIGHT)
                // 从node里删除
                this.node.removeChild(curNode)
                this.storeNode.addChild(curNode)
                curNode.setPosition(new Vec3(endPos.postion.x, 0, 0)) // 注意这里改变坐标时是相对于
                curNode.setSiblingIndex(endPos.startIndex)
                this.updateStoreNode()
            }).start()
        }
    }

    // private getWorldPos():Vec2{
    //     return this.node.convertToWorldSpaceAR(Vec2.ZERO);
    // }
    // private setWorldPos(pos:Vec2){
    //     this.node.position = this.node.parent.convertToNodeSpaceAR(pos);
    // }

    // 计算当前摆放位置坐标时需要考虑移动其他物品使同类的摆放在一起
    calcPosInStore(itemIndex) {
        let item = this.items[itemIndex]
        let children = this.storeNode.children
        if (children.length >= 7) {
            log("游戏结束后")
            return
        }
        let startIndex = children.length
        for (let i = 0; i < children.length; i++) {
            let childName = children[i].name
            if (childName === item.name) {
                startIndex = i + 1 // 找到最后一个相同的位置
            }
        }
        // 如果startIndex == children.length, 说明放到最后的位置,否则startIndex右边的全部向右移动一个位置
        for (let i = startIndex; i < children.length; i++) {
            let child = children[i]
            let postion = child.getPosition()
            tween(child).to(0.3, { position: new Vec3(postion.x + 60, postion.y, 0) }).call(() => {
                child.setSiblingIndex(child.getSiblingIndex() + 1)
            }).start()
        }

        let worldPos = this.storeNode.getWorldPosition()
        return {
            postion: new Vec3(-180 + startIndex * (60), -1 * (worldPos.y + ITEM_HEIGHT - 2), 0),
            startIndex
        }
    }

    // 检查是否有三个可以消除的, 如果有消除并移动其他的位置
    updateStoreNode() {
        let children = this.storeNode.children
        let startIndex = 0
        let count = 1
        for (let i = 1; i < children.length; i++) {
            if (children[i].name === children[i - 1].name) {
                startIndex = i
                count++
            } else {
                count = 1
            }
            if (count === 3) {
                // 删除三个节点
                for (let j = i; j >= (i - 2); j--) {
                    this.storeNode.removeChild(children[j])
                }

                // 移动剩下的节点
                for (let j = i + 1; j < children.length; j++) {
                    let child = children[i]
                    let postion = child.getPosition()
                    tween(child).to(0.3, { position: new Vec3(postion.x - 60, postion.y, 0) }).call(() => {
                        child.setSiblingIndex(child.getSiblingIndex() - 3)
                    }).start()
                }
                break
            }
        }
    }
}

