// Learn TypeScript:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class Basketball extends cc.Component {

    @property(cc.Node)
    basketballNode: cc.Node = null;
    @property(cc.Node)
    randRect: cc.Node = null;
    @property(cc.Node)
    basketRect: cc.Node = null;
    @property(cc.Node)
    resultNode: cc.Node = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;
    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    gameDes:cc.Label = null;

    _isBallTouch: boolean = false;
    //得分距离
    _getScoreDis: number = 50;
    _score: number = 0;
    _runtime: number = 0;
    //当前关卡
    _nowBoss: number = 0;

    //游戏状态
    _gameResult: boolean = false;
    _oldPos: cc.Vec2 = null;
    //场景大小
    // windowSize: cc.Size = cc.director.getWinSize()

    _basketBallConfig: any[] = [
        {"ballNum": 10, "time": 30, "des": "第一关:30秒进10个球获胜"},
        {"ballNum": 8, "time": 20, "des": "第二关:20秒进8个球获胜"},
        {"ballNum": 5, "time": 10, "des": "第三关:10秒进5个球获胜"}
    ]
    // LIFE-CYCLE CALLBACKS:
    
    onLoad () {
        this._oldPos = this.node.getPosition();
        this.initTouchEvent();
        this.resetGame();
    }

    randomBasketBallPos(){
        // 随机出现在屏幕上指定球场区域内
        const x = this.randRect.width * (Math.random() - .5);
        const y = this.randRect.height * (Math.random() - .5);
        let pos = this.basketballNode.parent.convertToNodeSpaceAR(this.randRect.convertToWorldSpaceAR(cc.v2(x, y)));
        this.basketballNode.setPosition(pos);
    }

    //重新开始
    resetGame(){
        this._gameResult = false;
        this.resultNode.active = false;
        let data = this._basketBallConfig[this._nowBoss];
        if (data) {
            this._score = 0;
            this._runtime = data.time;
            this.gameDes.string = data.des;
            this.setScoreLabel(0)
            this.setTimeLable(data.time);
            this.randomBasketBallPos();
            this.setUiShow(true);
        }
    }

    setUiShow(isshow:boolean){
        this.scoreLabel.node.active = isshow;
        this.timeLabel.node.active = isshow;
        this.gameDes.node.active = isshow;
    }

    initTouchEvent(){
        this.basketballNode.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.basketballNode.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.basketballNode.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.basketballNode.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }

    touchStart(event:cc.Event.EventTouch){
        this._isBallTouch = true;
    }

    touchMove(event:cc.Event.EventTouch) {
        if (this._isBallTouch) {
            this.basketballNode.setPosition(this.basketballNode.parent.convertTouchToNodeSpaceAR(event.touch));
        }
    }

    touchEnd(event:cc.Event.EventTouch) {
        this._isBallTouch = false;
        if (this.getDistance(this.basketballNode, this.basketRect) < this._getScoreDis) {
            this.getScore();
            this.randomBasketBallPos();
        }
    }

    touchCancel(event:cc.Event.EventTouch) {
        this._isBallTouch = false;
    }
    // start () {}

    getDistance(node1:cc.Node, node2:cc.Node){
        let pos1 = node1.getPosition();
        let pos2 = node2.getPosition();
        let distance = cc.pDistance(pos1, pos2);
        return distance;
    }

    getScore(){
        this._score = this._score + 1;
        this.setScoreLabel(this._score);
        if (this._score >= this._basketBallConfig[this._nowBoss].ballNum) {
            this.gameResult(1);
        }
    }

    setTimeLable(time:number){
        this.timeLabel.string = (time >= 0) ? "剩余时间:" + time.toFixed(1) : "剩余时间:0";
    }

    setScoreLabel(score:number){
        this.scoreLabel.string = "得分:" + score;
    }

    update (dt) {
        if (!this._gameResult) {
            this._runtime = this._runtime - dt;
            this.setTimeLable(this._runtime);
        }

        if (this._runtime < 0) {
            this.gameResult();
        }
    }

    //type 1 胜利 2 失败
    gameResult(type:number = 2){
        this._gameResult = true;
        let des:string = "";
        if (type === 1) {
            des = "恭喜你获得了胜利";
        }else{
            des = "你失败了,请再接再厉不要放弃!";
        }
        this.resultNode.getChildByName("des").getComponent(cc.Label).string = des;
        this.resultNode.getChildByName("btn_next").getComponent(cc.Button).interactable = (type === 1) && (this._nowBoss < this._basketBallConfig.length);
        this.resultNode.active = true;
    }

    onBtnNext(){
        this._nowBoss = this._nowBoss + 1;
        if (this._nowBoss >= this._basketBallConfig.length) {
            //最后关直接前往第一关
            this._nowBoss = 0;
        }
        this.runAnimaToNextLevel();
    }

    onBtnReGame(){
        this.resetGame();
    }

    runAnimaToNextLevel(){
        this.setUiShow(false);
        this.resultNode.active = false;
        let width = this.node.getContentSize().width;
        this.node.runAction(cc.sequence(
            cc.moveBy(2, cc.p(-width, 0)),
            cc.callFunc(this.runOverCallBack, this)
        ))
    }

    runOverCallBack(){
        this.node.setPosition(this._oldPos);
        this.resetGame();
    }
}
