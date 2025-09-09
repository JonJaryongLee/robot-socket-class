import net from 'net';

const client = new net.Socket();

const PORT = 10000;
const HOST = '127.0.0.1';  // 실제 서버 주소에 맞춰서 수정하세요

// 2025년 3월 1일 00시 00분 00초를 기준으로 시작
let currentTime = new Date('2025-03-01T00:00:00Z');
let messageId = 1; // id: 1부터 시작

client.connect(PORT, HOST, () => {
  console.log(`Connected to TCP server at ${HOST}:${PORT}`);

  // 1초 간격으로 데이터 전송
  setInterval(() => {
    const speed = Math.floor(Math.random() * 101); // 0 ~ 100 사이의 난수
    const message = {
      id: messageId,
      speed: speed.toString(),             // 속도. 문자열로 변환
      date_time: currentTime.toISOString() // ISO 표준 시간 형식
    };

    // JSON 문자열로 변환하여 전송
    client.write(JSON.stringify(message));

    // 다음 전송을 위해 값 업데이트
    messageId++;
    currentTime.setSeconds(currentTime.getSeconds() + 1);
  }, 1000);
});

client.on('error', (err) => {
  console.error('Error:', err);
});