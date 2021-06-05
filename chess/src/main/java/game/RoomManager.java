package game;

import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

// 通过这个类来管理多个房间对象
public class RoomManager {
    // 仍然使用一个 HashMap 来存储房间信息
    // key 就是 roomId, value room 对象本身
    private ConcurrentHashMap<String, Room> rooms = new ConcurrentHashMap<>();

    // 把房间放到房间管理器中
    public void addRoom(Room room) {
        rooms.put(room.getRoomId(), room);
    }

    // 把房间从房间管理器中移除
    public void removeRoom(String roomId) {
        rooms.remove(roomId);
    }

    // 根据房间 id 查找对应的房间
    public Room getRoom(String roomId) {
        return rooms.get(roomId);
    }

    private RoomManager() {}
    private static RoomManager roomManager = new RoomManager();
    public static RoomManager getInstance() {
        return roomManager;
    }
}
