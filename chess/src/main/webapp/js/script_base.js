// 几个重要参数的解释:
// userId: 用户登陆时获取到的. (测试阶段可以先写死)
// roomId: 当前这局游戏的房间号. 通过匹配结果获取到
// isWhite: 当前这局游戏是否是白子. 通过匹配结果获取到
// 这三个属性包裹到一个 gameInfo 对象中

// 这个数字应该是登陆后从服务器获取的, 目前在页面写死

gameInfo = {
    userId: myUserId,
    roomId: null,
    isWhite: true,
}

//////////////////////////////////////////////////
// 设定界面显示相关操作
//////////////////////////////////////////////////
function onClick(userId) {
    startMatch(userId);
    // 将按钮设置为不可点击, 并修改文本
    $("#matchButton").attr('disabled', true);
    $("#matchButton").text("匹配中...");
}

function hideMatchButton() {
    $("#matchButton").hide();
}

function setScreenText(me) {
    if (me) {
        $("#screen").text("轮到你落子了!")
    } else {
        $("#screen").text("轮到对方落子了!")
    }
}

//////////////////////////////////////////////////
// 初始化 websocket
//////////////////////////////////////////////////
var websocket = new WebSocket('ws://127.0.0.1:8080/chess/game/' + gameInfo.userId);

websocket.onopen = function () {
    console.log("建立连接!");
}

websocket.onclose = function () {
    console.log("断开连接!");
}

websocket.onerror = function () {
    console.log("连接异常!");
}

// 一会要在不同的流程中进行不同的处理
// 匹配流程和落子流程处理方式不一样
websocket.onmessage = function (event) {
    var message = event.data
    if (message == 'duplicationLogin') {
        // 该用户已经登陆过
        alert("您的账号已经被登陆过了!");
        // window.location.reload();
        $("#matchButton").attr('disabled', true);
        $("#screen").text("您的账号已经被登陆过了!")
    }
}

window.onbeforeunload = function () {
    // 页面关闭之前, 先主动关闭 websocket
    websocket.close();
}

//////////////////////////////////////////////////
// 实现匹配逻辑
//////////////////////////////////////////////////

// 用户点击 "开始匹配按钮", 就会开始进行匹配
// 这个函数就是在匹配按钮的点击回调中进行调用的. 
function startMatch(userId) {
    var message = {
        // 在 JS 中操作 JSON 是不需要给 key 加上引号的
        type: "startMatch",
        userId: userId
    };
    // 通过下面的这个函数来处理服务器返回的匹配响应
    websocket.onmessage = handlerStartMatch;
    // JSON.stringify 把一个 JS 对象转成 JSON 格式的字符串.
    websocket.send(JSON.stringify(message));
}

// 这个函数用来处理匹配响应. 当客户端收到服务器的返回结果的时候
// 就会自动被调用 websocket.onmessage = handlerStartMatch; 相关
function handlerStartMatch(event) {
    // 1. 先把服务器响应的数据给取出并解析成 JS 对象
    console.log("handlerStartMatch: " + event.data);
    var response = JSON.parse(event.data);
    if (response.type != 'startMatch') {
        console.log("handlerStartMatch: 无效的响应! type: " + response.type);
        return;
    }
    // 2. 从响应中得到了一些信息. 房间id和是否是先手
    gameInfo.isWhite = response.isWhite;
    gameInfo.roomId = response.roomId;
    gameInfo.otherUserId = response.otherUserId;
    // 3. 隐藏匹配按钮
    hideMatchButton();
    // 4. 设置提示信息(提示当前是轮到谁落子)
    setScreenText(gameInfo.isWhite);
    // 5. 初始化棋盘
    initGame();
}

//////////////////////////////////////////////////
// 匹配成功, 则初始化一局游戏
//////////////////////////////////////////////////
function initGame() {
    // 是我下还是对方下. 根据服务器分配的先后手情况决定
    var me = gameInfo.isWhite;
    // 游戏是否结束
    var over = false;
    var chessBoard = [];
    //初始化chessBord数组(表示棋盘的数组)
    for (var i = 0; i < 15; i++) {
        chessBoard[i] = [];
        for (var j = 0; j < 15; j++) {
            chessBoard[i][j] = 0;
        }
    }
    var chess = document.getElementById('chess');
    var context = chess.getContext('2d');
    context.strokeStyle = "#BFBFBF";
    // 背景图片
    var logo = new Image();
    logo.src = "images/sky.jpeg";
    logo.onload = function () {
        context.drawImage(logo, 0, 0, 450, 450);
        initChessBoard();
    }

    // 绘制棋盘网格
    function initChessBoard() {
        for (var i = 0; i < 15; i++) {
            context.moveTo(15 + i * 30, 15);
            context.lineTo(15 + i * 30, 430);
            context.stroke();
            context.moveTo(15, 15 + i * 30);
            context.lineTo(435, 15 + i * 30);
            context.stroke();
        }
    }

    // 绘制一个棋子, me 为 true
    // i 表示列, j 表示行
    function oneStep(i, j, isWhite) {
        context.beginPath();
        context.arc(15 + i * 30, 15 + j * 30, 13, 0, 2 * Math.PI);
        context.closePath();
        var gradient = context.createRadialGradient(15 + i * 30 + 2, 15 + j * 30 - 2, 13, 15 + i * 30 + 2, 15 + j * 30 - 2, 0);
        if (!isWhite) {
            gradient.addColorStop(0, "#0A0A0A");
            gradient.addColorStop(1, "#636766");
        } else {
            gradient.addColorStop(0, "#D1D1D1");
            gradient.addColorStop(1, "#F9F9F9");
        }
        context.fillStyle = gradient;
        context.fill();
    }

    chess.onclick = function (e) {
        if (over) {
            return;
        }
        if (!me) {
            return;
        }
        var x = e.offsetX;
        var y = e.offsetY;
        // 注意, 横坐标是列, 纵坐标是行
        var col = Math.floor(x / 30);
        var row = Math.floor(y / 30);
        if (chessBoard[row][col] == 0) {
            // TODO 新增发送数据给服务器的逻辑
            send(row, col);

            // oneStep(col, row, gameInfo.isWhite);
            // chessBoard[row][col] = 1;
            // 通过这个语句控制落子轮次
            // me = !me;
        }
    }

    // 发送落子的请求
    function send(row, col) {
        console.log("send: " + row + "," + col);
        // 构造一个落子请求对象
        var request = {
            type: "putChess",
            userId: gameInfo.userId,
            roomId: gameInfo.roomId,
            row: row,
            col: col,
        };
        websocket.send(JSON.stringify(request));
    }

    // 新增处理服务器返回数据的请求
    // 并绘制棋子, 以及判定胜负
    function handlerPutChess(event) {
        console.log("handlerPutChess: " + event.data);
        // 1. 把收到的响应数据转成 JS 对象
        var response = JSON.parse(event.data);
        if (response.type != "putChess") {
            console.log("handlerChess: 无效的响应类型! type: " + response.type);
            return;
        }
        // 2. 根据响应对象中 userId 字段来判定一下这个棋子是自己落的还是对方落的
        if (response.userId == gameInfo.userId) {
            // 自己落的子
            // 当前玩家自己的黑白子的情况在 gameInfo.isWhite 中记录呢
            oneStep(response.col, response.row, gameInfo.isWhite);
        } else {
            // 对方落的子
            oneStep(response.col, response.row, !gameInfo.isWhite);
        }
        // 3. 给本地的棋盘设置一个标记, 防止同一个位置出现重复落子的情况
        //    本地的棋盘不需要关注 "胜负", 胜负是服务器计算的
        //    本地棋盘只需要防止同一个位置被重复落子即可
        //    就简单约定, 已经有子的地方设为 1, 未落子的地方设为 0
        chessBoard[response.row][response.col] = 1;
        // 4. 切换双方的落子顺序
        me = !me;
        // 5. 更新界面, 提示由谁来落子
        setScreenText(me);
        // 6. 判定游戏是否结束. 服务器已经计算好了, 已经返回给浏览器了
        if (response.winner != 0) {
            // 胜负已分. 
            if (response.winner == gameInfo.userId) {
                // 自己获胜了
                alert("你赢了!");
            } else {
                // 对方获胜了
                alert("你输了!");
            }
            // 就要开始下一局游戏了
            // 此处使用一种偷懒的方式来实现, 直接刷新页面
            window.location.reload();
        }
    }

    websocket.onmessage = handlerPutChess;
}

// initGame();
