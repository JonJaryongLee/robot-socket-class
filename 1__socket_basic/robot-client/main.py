import socket
import threading
import json
import time

HOST = "localhost"
PORT = 10000

robot_status = {
    # on/off
    "power": "on",
    # eng/kor
    "language": "eng",
    # up/down/left/right
    "cur_dir": "up",
    # 0 - 100
    "speed": "30",
    # client flag
    "client_message": "false",
}

# 멀티쓰레드 1
# TCP로 메세지 들어옴(JSON 명령 형태이지만 buffer 이므로 JSON 으로 변환 필요)
# 만약 robot_status 에 존재하는 키 값이고,
# 적합한 데이터 형태라면
# robot_status 변경 후, 아래 문구 출력
# robot_status is changed successfully.
# 이후, robot_status 를 잘 볼 수 있도록 터미널에 출력
# 만약 적합하지 않은 데이터 형태라면 예외처리
def set_robot_status(client_socket):
    while True:
        try:
            data = client_socket.recv(1024)
            if not data:
                break

            message = json.loads(data.decode("utf-8"))
            if isinstance(message, dict):
                for key, value in message.items():
                    if key not in robot_status:
                        raise KeyError(f"Invalid key: {key}. Key not found in robot_status.")
                    if key == "power" and value not in ["on", "off"]:
                        raise ValueError("Invalid power value. Must be 'on' or 'off'.")
                    elif key == "language" and value not in ["eng", "kor"]:
                        raise ValueError("Invalid language value. Must be 'eng' or 'kor'.")
                    elif key == "cur_dir" and value not in ["up", "down", "left", "right"]:
                        raise ValueError("Invalid cur_dir value. Must be 'up', 'down', 'left', or 'right'.")
                    elif key == "speed":
                        try:
                            speed_int = int(value)  # Convert string to integer
                            if not (0 <= speed_int <= 100):
                                raise ValueError("Invalid speed value. Must be between 0 and 100.")
                            robot_status[key] = str(speed_int)  # Store as string
                        except ValueError:
                            raise ValueError("Invalid speed value. Must be a string representing an integer between 0 and 100.")
                    else:
                        robot_status[key] = value
                print("robot_status is changed successfully.")
                print(json.dumps(robot_status, indent=4))
            else:
                print("Invalid data format received.")
        except json.JSONDecodeError:
            print("Received invalid JSON data.")
        except KeyError as ke:
            print(f"Key error: {ke}")
        except ValueError as ve:
            print(f"Value error: {ve}")
        except Exception as e:
            print(f"Error in set_robot_status: {e}")
            

# 멀티쓰레드 2
# 1초에 한번씩 TCP 서버에 현재 딕셔너리 값을 buffer 로 전송함
def send_robot_status(client_socket):
    while True:
        try:
            time.sleep(1)
            robot_status["client_message"] = "false"
            message = json.dumps(robot_status)
            client_socket.sendall(message.encode("utf-8"))
        except Exception as e:
            print(f"Error in send_robot_status: {e}")
            break

# 서버 소켓 접속 함수
def connect_to_server():
    try:
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client_socket.connect((HOST, PORT))
        print(f"Connected to {HOST}:{PORT}")

        thread1 = threading.Thread(target=set_robot_status, args=(client_socket,))
        thread2 = threading.Thread(target=send_robot_status, args=(client_socket,))

        thread1.start()
        thread2.start()

        thread1.join()
        thread2.join()
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    connect_to_server()
