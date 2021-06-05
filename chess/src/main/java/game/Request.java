package game;

// 通过这个类既能够表示 匹配请求, 又能够表示 落子请求
public class Request {
    private String type;
    private int userId;
    // 下面的这三个字段仅在 type 为 "putChess" 的时候使用
    private String roomId;
    private int row;
    private int col;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getRoomId() {
        return roomId;
    }

    public void setRoomId(String roomId) {
        this.roomId = roomId;
    }

    public int getRow() {
        return row;
    }

    public void setRow(int row) {
        this.row = row;
    }

    public int getCol() {
        return col;
    }

    public void setCol(int col) {
        this.col = col;
    }

    @Override
    public String toString() {
        return "Request{" +
                "type='" + type + '\'' +
                ", userId=" + userId +
                ", roomId='" + roomId + '\'' +
                ", row=" + row +
                ", col=" + col +
                '}';
    }
}

