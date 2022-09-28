import { _decorator, Component, Node, Sprite, Prefab, instantiate, Vec3, log, Button, Vec2 } from 'cc';
const { ccclass, property } = _decorator;



interface itemNode {
    node : Node
    postion : Vec3,
    id : number
}

interface eventData {
    id : number,
    itemIndex :number
}

const ITEM_WIDTH = 50
const ITEM_HEIGHT = 55

@ccclass('Layout')
export class Layout extends Component {

    @property({type:[Prefab]})
    private items: Prefab[]= []

    @property({type:Node})
    private storeNode: Node = null

    @property({type:Number})
    private itemNum = 3

    @property({type:Number})
    private layoutWidth = 450

    private itemList:itemNode[] = []


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
            let itemIndex:number =  i % 3
            let tempNode:Node = instantiate(this.items[itemIndex])
            // 随机产生一个值在 0 到 arrLen 中的数
            let posIndex = Math.floor(Math.random() * arrLen) 
            tempNode.setPosition(posArr[posIndex])
            this.addClickEvent(tempNode, {
                itemIndex:itemIndex,
                id:i
            })

            this.itemList.push({
                node:tempNode,
                postion:posArr[posIndex],
                id:i
            })
            this.node.addChild(tempNode)

        }
        // 计算是否被遮挡了
        this.setGrayNode(ITEM_WIDTH, ITEM_HEIGHT)
                
    }

    setGrayNode(itemWidth:number, itemHeight:number) {
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
    isReplicate( vec1: Vec3, vec2: Vec3, itemWidth:number, itemHeight:number) {
        return Math.abs(vec1.x - vec2.x) < itemWidth &&  Math.abs(vec1.y - vec2.y) < itemHeight
    }

    // 根据行数获取所有能放的位置
    getPosArray(rowNum : number, itemWidth:number, itemHeight:number) :Vec3[] {
        let res = []
        let length = 2 * rowNum - 1
        let mid = Math.floor(length / 2)
        for (let i= 0; i < length; i++) {
            // 每一行的高度是一样的
            let y = (mid - i) * itemHeight / 2
            for (let j= 0; j < length; j++) {
                let x = (j - mid) * itemWidth / 2 // 需要除2,可以重叠一半
                res.push(new Vec3(x, y, 0))
            }
        }
        return res
    }

    addClickEvent(node:Node, customEventData: eventData) {
        // log(node)
        let button= node.getComponent(Button);
		let eventHandler=new Component.EventHandler();
		eventHandler.target= this.node;
		eventHandler.component="Layout"; // 界面上不会显示绑定上了
		eventHandler.handler="onItemClick";
		eventHandler.customEventData=JSON.stringify(customEventData)
		
		button.clickEvents.push(eventHandler);
    }
    // 根据行列的最大数生成n个点位
    getPosition(num: number, row:number, col:number) {
        // log(num, row, col)
        let posArr = []
        for (let i = 0; i < num; i++) {
            let x = Math.floor((Math.random() - 0.5) * col * 4)
            let y = Math.floor((Math.random() - 0.5) * row * 4)
            posArr.push( {
                x,
                y
            })
        }
        return posArr
    }

    update(deltaTime: number) {
        
    }

    onItemClick(event, customEventData:string) {
        let curNode = event.currentTarget
        log("点击了", curNode.getPosition())
        let name = curNode.name
        let status = curNode.getComponent(Sprite).grayscale
        log(name, status)
        if (!status) {
            // 计算当前摆放位置坐标
            //this.storeNode.addChild(curNode)
            let data:eventData = JSON.parse(customEventData)
            this.calcPosInStore(data.itemIndex)

            // 从node里删除
            this.node.removeChild(curNode)
            // 从itemList中删除
            this.itemList = this.itemList.filter(item => item.id !== data.id)
            // 刷新状态
            this.setGrayNode(ITEM_WIDTH, ITEM_HEIGHT)
        }
    }

    calcPosInStore(itemIndex) {
        log(itemIndex)
        let children = this.storeNode.children
        let startPos = this.storeNode.getPosition()
        let worldPos = this.storeNode.getWorldPosition()
        let tempNode:Node = instantiate(this.items[itemIndex])
        tempNode.setPosition(new Vec3(-180 + children.length * (60), 0, 0)) // 相对父节点的位置
        if (children.length >= 7) {
            log("游戏结束后")
            return
        }
        this.storeNode.addChild(tempNode)
        log(startPos)
        log(worldPos)
    }
}

