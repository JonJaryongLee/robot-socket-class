<script setup>
import { ref } from "vue";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const userCommand = ref("");

const socket = new WebSocket(SOCKET_URL);

// 로봇에 명령어를 보냄
// 반드시 JSON 이어야 함
function sendCommand() {
  try {
    const originObj = JSON.parse(userCommand.value);
    const parsedObj = {
      ...originObj,
      client_message: "true",
    };
    socket.send(JSON.stringify(parsedObj));
  } catch (error) {
    console.error(error);
    return; // 함수 종료
  }
}

socket.onopen = () => {
  console.log("Connected to the server");
};

// 서버에서 메시지를 받으면 출력
socket.onmessage = async (event) => {
  const text = await event.data.text();
  if (JSON.parse(text).client_message === "true") {
    // 내가 보낸 것
    console.log(`client_message: ${text}`);
  } else {
    // 로봇이 보낸 것
    console.log(text);
  }
};

socket.onclose = () => {
  console.log("Disconnected from the server");
};

socket.onerror = (event) => {
  console.error("WebSocket error:", event);
};
</script>

<template>
  <input
    type="text"
    v-model="userCommand"
    placeholder="명령어를 JSON 형식으로 입력하시오"
  />
  <button @click="sendCommand">소켓 서버로 보내기</button>
</template>