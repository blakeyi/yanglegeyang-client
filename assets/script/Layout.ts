import { _decorator, Component, Node, Sprite, Prefab, instantiate, Vec3, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout')
export class Layout extends Component {

    @property({type:[Prefab]})
    private items: Prefab[]= []

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
        const ITEM_WIDTH = 53, ITEM_HEIGHT = 58
        const ROW_NUM = this.layoutHeight / ITEM_HEIGHT / 2
        const COL_NUM = this.layoutWidth / ITEM_WIDTH / 2

        let arr = this.getPosition(this.itemNum, ROW_NUM, COL_NUM)
        log(arr)
        for (let i = 0; i < this.itemNum; i++) {
            const curPos = arr[i]
            let tempNode:Node = instantiate(this.items[i % 3])
            let vec = new Vec3(oriPos.x + curPos.x * ITEM_WIDTH / 2, oriPos.y + curPos.y  * ITEM_HEIGHT / 2, oriPos.z)
            tempNode.setPosition(vec)
            this.node.addChild(tempNode)
        }
        
    }
    // 根据行列的最大数生成n个点位
    getPosition(num: number, row:number, col:number) {
        log(num, row, col)
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
}

