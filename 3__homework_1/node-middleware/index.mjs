import { WebSocketServer } from "ws";

const WEB_SOCKET_PORT = 11000;

const wss = new WebSocketServer({ port: WEB_SOCKET_PORT });
console.log(`Web Socket server listening on port ${WEB_SOCKET_PORT}`);

let webSocketClients = []; // Web Socket 클라이언트를 저장할 배열

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