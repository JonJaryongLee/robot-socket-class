<script setup>
import { ref } from "vue";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const message = ref("");

const socket = new WebSocket(SOCKET_URL);

socket.onopen = () => {
  console.log("Connected to the server");
};

// 서버에서 메시지를 받으면 출력
socket.onmessage = async (event) => {
  const text = await event.data.text();
  console.log(text);
};

socket.onclose = () => {
  console.log("Disconnected from the server");
};

socket.onerror = (event) => {
  console.error("WebSocket error:", event);
};

function sendMessage() {
  try {
    socket.send(message.value);
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <input type="text" v-model="message" />
  <button @click="sendMessage">보내기</button>
</template>