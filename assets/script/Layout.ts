import { _decorator, Component, Node, Sprite, Prefab, instantiate, Vec3, log, Button } from 'cc';
const { ccclass, property } = _decorator;

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

    @property({type:Number})
    private layoutHeight = 300

    start() {

    }
    // 所有的方块都需要在layout的范围内,
    onLoad() {
        let oriPos = this.node.getPosition();
        log(oriPos)
        const ITEM_WIDTH = 50, ITEM_HEIGHT = 55
        const ROW_NUM = this.layoutHeight / ITEM_HEIGHT / 2
        const COL_NUM = this.layoutWidth / ITEM_WIDTH / 2

        let arr = this.getPosition(this.itemNum, ROW_NUM, COL_NUM)
        log(arr)
        for (let i = 0; i < this.itemNum; i++) {
            const curPos = arr[i]
            let itemIndex:number =  i % 3
            let tempNode:Node = instantiate(this.items[itemIndex])
            let vec = new Vec3(oriPos.x + curPos.x * ITEM_WIDTH / 2, oriPos.y + curPos.y  * ITEM_HEIGHT / 2, oriPos.z)
            log(vec)
            tempNode.setPosition(vec)
            this.addClickEvent(tempNode, itemIndex)
            // tempNode.getComponent(Sprite).grayscale = true
            this.node.addChild(tempNode)
        }
        
    }

    addClickEvent(node:Node, itemIndex:number) {
        // log(node)
        let button= node.getComponent(Button);
		let eventHandler=new Component.EventHandler();
		eventHandler.target= this.node;
		eventHandler.component="Layout"; // 界面上不会显示绑定上了
		eventHandler.handler="onItemClick";
		eventHandler.customEventData=itemIndex.toString();
		
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

    onItemClick(event, customEventData) {
        let curNode = event.currentTarget
        log("点击了", curNode.getPosition())
        let name = curNode.name
        let status = curNode.getComponent(Sprite).grayscale
        log(name, status)
        if (!status) {
            // 计算当前摆放位置坐标
            //this.storeNode.addChild(curNode)
            this.calcPosInStore(parseInt(customEventData))
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

