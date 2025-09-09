<script setup>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

// {
//   id: 1,
//   speed: 속도. 문자열로 변환
//   date_time: ISO 표준 시간 형식
// };
const obj = ref({});

const chartRef = ref(null);
let chartInstance = null;

const socket = new WebSocket(SOCKET_URL);

socket.onopen = () => {
  console.log("Connected to the server");
};

// 서버에서 메시지를 받으면 출력
socket.onmessage = async (event) => {
  const text = await event.data.text();
  obj.value = JSON.parse(text);
};

socket.onclose = () => {
  console.log("Disconnected from the server");
};

socket.onerror = (event) => {
  console.error("WebSocket error:", event);
};

function createChart() {
  const ctx = chartRef.value.getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Robot Speed",
          data: [],
          fill: false,
          borderColor: `rgb(75, 192, 192)`,
          tension: 0.1,
        },
      ],
    },
  });
}

function updateChart() {
  chartInstance.data.datasets[0].data.push(obj.value.speed);
  chartInstance.data.labels.push(obj.value.date_time);
  chartInstance.update();
}

onMounted(() => {
  if (chartRef.value) {
    chartInstance = createChart();
  }
});

watch(
  () => obj.value.date_time,
  () => {
    if (chartInstance && obj.value.date_time !== undefined) {
      updateChart();
    }
  }
);
</script>

<template>
  <div class="chart-wrapper">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<style scoped>
.chart-wrapper {
  height: 600px;
  width: 800px;
}
</style>