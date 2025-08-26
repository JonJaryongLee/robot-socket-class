import { WebSocketServer } from "ws";
import net from "net";

const TCP_SOCKET_PORT = 10000;
const WEB_SOCKET_PORT = 11000;

const wss = new WebSocketServer({ port: WEB_SOCKET_PORT });
console.log(`Web Socket server listening on port ${WEB_SOCKET_PORT}`);

let tcpSocketClients = [];
let webSocketClients = [];

// TCP Socket 서버 설정
const tcpSocketServer = net.createServer((socket) => {
  console.log("TCP Socket client connected");

  tcpSocketClients.push(socket);

  socket.on("data", (data) => {
    webSocketClients.forEach((webSocketClient) => {
      webSocketClient.send(data);
    });
  });

  // 에러 처리 추가
  socket.on("error", (err) => {
    console.error("TCP socket error:", err.message);
    // 필요하다면 소켓을 tcpSocketClients 배열에서 제거하거나
    // 다른 로직을 수행할 수도 있음
  });

  socket.on("end", () => {
    console.log("TCP client disconnected");
    tcpSocketClients = tcpSocketClients.filter(
      (tcpSocketClient) => tcpSocketClient !== socket
    );
  });
});

// Web Socket 서버 설정
wss.on("connection", (ws) => {
  console.log("Web Socket client connected");

  // WebSocket 클라이언트 목록에 추가
  webSocketClients.push(ws);

  ws.on("message", (message) => {
    // console.log("Received from Web Socket client: ", message.toString());

    webSocketClients.forEach((webSocketClient) => {
      if (webSocketClient !== ws) {
        webSocketClient.send(message);
      }
    });
  });

  ws.on("close", () => {
    console.log("Web Socket client disconnected");
    // Web Socket 클라이언트 목록에서 제거
    webSocketClients = webSocketClients.filter(
      (webSocketClient) => webSocketClient !== ws
    );
  });
});

// TCP Socket 서버 시작
tcpSocketServer.listen(TCP_SOCKET_PORT, () => {
  console.log(`TCP Socket server listening on port ${TCP_SOCKET_PORT}`);
});