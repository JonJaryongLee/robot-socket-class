<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const userCommand = ref("");
const robotStatus = ref({});

const chartRef = ref(null);
let chartInstance = null;

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
// 로봇으로부터 JSON 전달되며, 이것으로 그래프를 그림
socket.onmessage = async (event) => {
  const text = await event.data.text();
  if (JSON.parse(text).client_message === "true") {
    // 내가 보낸 것. 소켓 로그 출력용
    console.log(`client_message: ${text}`);
  } else {
    // 로봇이 보낸 것. 차트 그리는 용도
    robotStatus.value = JSON.parse(text);
  }
};

socket.onclose = () => {
  console.log("Disconnected from the server");
};

socket.onerror = (event) => {
  console.error("WebSocket error:", event);
};

function normalizeAngle() {
  let val = 0;
  if (robotStatus.value.speed !== undefined)
    val = Number(robotStatus.value.speed);
  return ((val - 0) / (100 - 0)) * 100;
}

function createDoughnutChart() {
  const ctx = chartRef.value.getContext("2d");
  const normalizedAngle = normalizeAngle();
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [normalizedAngle, 100 - normalizedAngle],
          backgroundColor: [
            "rgba(70, 130, 180, 0.7)",
            "rgba(230, 230, 230, 0.5)",
          ],
          borderColor: ["rgba(70, 130, 180, 1)", "rgba(230, 230, 230, 1)"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false, // 범례를 표시하지 않음
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              let val = 0;
              if (robotStatus.value.speed !== undefined)
                val = Number(robotStatus.value.speed);
              const index = context.dataIndex;
              if (index === 0) return `${String(val)}`;
              return `${String(100 - val)}`;
            },
          },
        },
      },
      cutout: "70%", // 도넛 차트 내부를 비워줌
    },
  });
}

function updateChart() {
  const normalizedAngle = normalizeAngle();
  chartInstance.data.datasets[0].data[0] = normalizedAngle;
  chartInstance.data.datasets[0].data[1] = 100 - normalizedAngle;
  chartInstance.update();
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = createDoughnutChart();
  }
});

watch(
  () => robotStatus.value.speed,
  () => {
    if (chartInstance && robotStatus.value.speed !== undefined) {
      updateChart();
    }
  }
);
</script>

<template>
  <input
    type="text"
    v-model="userCommand"
    placeholder="명령어를 JSON 형식으로 입력하시오"
  />
  <button @click="sendCommand">소켓 서버로 보내기</button>

  <div class="chart-wrapper">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 200px;
  width: 200px;
}
</style>