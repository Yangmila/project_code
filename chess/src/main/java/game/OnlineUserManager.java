package game;

import javax.websocket.Session;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

// 通过这个类来管理用户的在线状态
// 为了管理这个服务器上所有的用户, 其实只要有这么一份 hashMap 就可以了.
// 像现在这个代码里面, 如果我们 new 了多个 OnlineUserManager 实例, 其实就
// 相当于搞出了多份这样的 hash 表~~
// 我们希望 OnlineUserManager 这样的类只能有唯一的一个实例!!
// "单例模式"
public class OnlineUserManager {
    // 此处为了解决这个 "线程安全" 问题, 不能直接使用 HashMap
    // 而可以使用替代的线程安全的 HashMap 版本
    // Concurrent 英文原义 "并发"
    private ConcurrentHashMap<Integer, Session> users = new ConcurrentHashMap<>();

    // 用户上线
    public void online(int userId, Session session) {
        users.put(userId, session);
    }

    // 用户下线
    public void offline(int userId) {
        users.remove(userId);
    }

    // 根据用户 id 获取到用户的 session 对象
    public Session getSession(int userId) {
        return users.get(userId);
    }

    // 一旦该类的构造方法变成私有的, 在类的外面就不能 new 了
    private OnlineUserManager() {}
    // 此时如果外面想使用这个实例, 就直接在类内部把实例给 new 好
    // 直接返回这个现成的实例.
    // 这个实例通过一个 static 的引用来指向.
    // 同时 static 保证了这个 new 操作只能被执行一次
    private static OnlineUserManager onlineUserManager = new OnlineUserManager();

    // 外面的代码要想使用 OnlineUserManager 这个唯一的实例, 就通过下面的 getInstance 来获取即可
    public static OnlineUserManager getInstance() {
        return onlineUserManager;
    }
}
