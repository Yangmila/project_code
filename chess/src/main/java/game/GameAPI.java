package game;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;

// 通过这个类, 借助 websocket 和前端进行交互
@ServerEndpoint("/game/{userId}")
public class GameAPI {
    private int userId;
    private Gson gson = new GsonBuilder().create();

    @OnOpen
    public void onOpen(@PathParam("userId") String userId, Session session) throws IOException {
        this.userId = Integer.parseInt(userId);
        System.out.println("连接建立! userId: " + this.userId);

        if (OnlineUserManager.getInstance().getSession(this.userId) == null) {
            // 当前该用户未登录, 就直接插入到这个用户管理哈希表中
            OnlineUserManager.getInstance().online(this.userId, session);
        } else {
            // 当前用户已经登陆过了~~
            // 直接给用户返回一个数据, 表示你已经登陆过了!!!
            // 直接告诉浏览器, 你已经重复登陆了.
            session.getBasicRemote().sendText("duplicationLogin");
        }
    }

    @OnClose
    public void onClose() {
        System.out.println("连接关闭! userId: " + this.userId);

        OnlineUserManager.getInstance().offline(this.userId);
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.out.println("连接异常! userId: " + this.userId);
        error.printStackTrace();

        OnlineUserManager.getInstance().offline(this.userId);
    }

    @OnMessage
    public void onMessage(String message, Session session) throws InterruptedException, IOException {
        System.out.println("收到消息! message: " + message + ", userId: " + userId);
        // 把 message 按照 JSON 格式转换成对象
        Request request = gson.fromJson(message, Request.class);
        if ("startMatch".equals(request.getType())) {
            // 当前就要执行 "匹配" 的逻辑
            // 就是把当前的用户匹配的请求, 给插入到当前匹配队列中
            Matcher.getInstance().addMatchQueue(request);
        } else if ("putChess".equals(request.getType())) {
            // 当前就要执行 "落子" 的逻辑
            // 1. 先根据请求对象, 获取到当前请求所属的房间 id, 进一步的找到房间对象
            Room room = RoomManager.getInstance().getRoom(request.getRoomId());
            // 2. 进行具体的落子操作
            room.putChess(request);
        } else {
            System.out.println("当前的请求类型错误! type: " + request.getType());
        }
    }
}
