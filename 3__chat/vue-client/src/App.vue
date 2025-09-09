<script setup>
import { ref } from "vue";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const nickname = ref("");
const isNicknameInputDisabled = ref(false);
const inputMessage = ref("");

const nextId = ref(1);
// {
//   id: 1,
//   nickname: "jony",
//   text: "안녕?",
// }
const messages = ref([]);

const socket = new WebSocket(SOCKET_URL);

socket.onopen = () => {
  console.log("Connected to the server");
};

// 서버에서 메시지를 받으면 출력
socket.onmessage = async (event) => {
  const text = await event.data.text();
  const message = JSON.parse(text);
  message.id = ++nextId.value;
  messages.value.push(message);
};

socket.onclose = () => {
  console.log("Disconnected from the server");
};

socket.onerror = (event) => {
  console.error("WebSocket error:", event);
};

function sendMessage() {
  if (nickname.value === "" || nickname.value.trim() === "") {
    return;
  }
  if (inputMessage.value === "" || inputMessage.value.trim() === "") {
    inputMessage.value = "";
    return;
  }
  const message = {
    nickname: nickname.value,
    text: inputMessage.value,
  };
  try {
    socket.send(JSON.stringify(message));
  } catch (error) {
    console.error(error);
  }
  message.id = ++nextId.value;
  messages.value.push(message);
  inputMessage.value = "";
}

function setNicknameInputDisabled() {
  if (nickname.value === "" || nickname.value.trim() === "") {
    alert("닉네임을 입력하세요");
    nickname.value = "";
    return;
  }
  nickname.value = nickname.value.trim();
  isNicknameInputDisabled.value = true;
}
</script>

<template>
  <div class="nickname-wrapper">
    <input
      type="text"
      placeholder="닉네임을 입력하세요"
      v-model="nickname"
      :disabled="isNicknameInputDisabled"
      @keyup.enter="setNicknameInputDisabled"
    />
    <button @click="setNicknameInputDisabled">확정</button>
  </div>

  <div class="message-wrapper">
    <input
      type="text"
      placeholder="메세지를 입력하세요"
      v-model="inputMessage"
      @keyup.enter="sendMessage"
    />
    <button @click="sendMessage">보내기</button>
  </div>

  <ul class="message-ul">
    <li v-for="message in messages" :key="message.id">
      <span class="nickname">[{{ message.nickname }}]</span>
      <span class="message">{{ message.text }}</span>
    </li>
  </ul>
</template>

<style scoped>
.message-ul {
  padding: 0;
}
.message-ul > li {
  list-style: none;
}
</style>
