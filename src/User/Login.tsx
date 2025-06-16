import React, {useState} from 'react' // React의 함수형 컴포넌트에서 상태 관리를 위해 useState를 import
import {publicAxios} from '../api/axios' // axios 인스턴스를 import, API 호출에 사용
import Modal from "../components/Modal";
import axios from "axios"; // 커스텀 Modal 컴포넌트 import

// Login 컴포넌트에서 사용할 props 타입 정의
interface LoginProps {
    isOpen: boolean; // 모달창 열림 여부(부모로부터 받음)
    onClose: () => void; // 모달창을 닫는 함수(부모로부터 받음)
    setIsLoggedIn: (isLoginOpen: boolean) => void; // 로그인 성공 시 부모의 로그인 상태 변경 함수
}

// 함수형 컴포넌트 Login 정의, props를 구조분해 할당하여 사용
export default function Login({isOpen, onClose, setIsLoggedIn}: LoginProps) {
    // 이메일 입력 상태 변수와 set 함수 (초기값: 빈 문자열)
    const [email, setEmail] = useState('');
    // 비밀번호 입력 상태 변수와 set 함수 (초기값: 빈 문자열)
    const [password, setPassword] = useState('');
    // 사용자명 입력 상태 변수와 set 함수 (초기값: 빈 문자열)
    const [username, setUsername] = useState('');
    // 로그인 결과 메시지 상태 변수와 set 함수 (초기값: 빈 문자열)
    const [message, setMessage] = useState('');

    // 로그인 폼 제출 시 실행되는 함수(비동기)
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // 폼 제출시 새로고침을 막음(React SPA 특성)

        // 비밀번호에 숫자가 포함되어 있는지 검사 (정규표현식)
        const hasNumber = /\d/.test(password);
        // 비밀번호에 영문자가 포함되어 있는지 검사 (정규표현식)
        const hasLetter = /[a-zA-Z]/.test(password);
        // 둘 다 만족하지 않으면 에러 메시지 표시 후 함수 종료
        if (!(hasNumber && hasLetter)) {
            setMessage("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
            return;
        }

        try {
            // API로 로그인 요청, username/email/password를 전송
            const res = await publicAxios.post('/login', {username: username, password: password, email: email});
            // 응답에서 access_token 추출(백엔드 응답 구조에 따라 다름)
            const token = res.data?.access_token;
            // 토큰이 정상적으로 존재할 경우(로그인 성공)
            if (token) {
                localStorage.setItem("access_token", token); // 브라우저 localStorage에 토큰 저장(자동 로그인/새로고침 유지 목적)
                setMessage(''); // 성공 메시지 표시
                setEmail(''); // 이메일 입력값 초기화(폼 클리어)
                setUsername(''); // 사용자명 입력값 초기화(폼 클리어)
                setPassword(''); // 비밀번호 입력값 초기화(폼 클리어)
                setIsLoggedIn(true); // 부모(Header)의 로그인 상태를 true로 변경(버튼 교체 등 UI 갱신)
                onClose();
                // setTimeout(() => onClose(), 1000); // 1초 후 모달 닫기(성공 메시지 잠깐 보여주기)
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setMessage(error.response?.data?.detail || error.message);
            } else if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage('Login failed: 알 수 없는 오류');
            }
        }
    };

    // 모달이 열리지 않은 상태라면 아무것도 렌더링하지 않음(null 반환)
    if (!isOpen) return null

    // 실제 렌더링되는 JSX
    return (
        <Modal isOpen={isOpen} onClose={onClose}> {/* 모달 열림/닫힘 제어 */}
            <form onSubmit={handleLogin}> {/* 폼 제출시 handleLogin 함수 실행 */}
                <h2>로그인</h2> {/* 모달 제목 */}

                <label htmlFor={'email'}>Email</label> {/* 이메일 입력 필드 라벨 */}
                <input
                    id="email" // 고유 id(라벨-필드 연결용)
                    type="email" // HTML5 이메일 입력
                    value={email} // 상태와 바인딩
                    onChange={(e) => setEmail(e.target.value)} // 입력값 변경시 상태 변경
                    placeholder={'Email'} // 입력창 안내문구
                    required={true} // 필수 입력
                    name={'email'} // 폼 제출시 key 값
                />

                <label htmlFor={'password'}>Password</label> {/* 비밀번호 입력 필드 라벨 */}
                <input
                    id="password" // 고유 id(라벨-필드 연결용)
                    type="password" // 비밀번호 입력(가림)
                    value={password} // 상태와 바인딩
                    onChange={(e) => setPassword(e.target.value)} // 입력값 변경시 상태 변경
                    placeholder={'숫자 영문 조합 8자리'} // 입력 안내문구
                    required={true} // 필수 입력
                    minLength={8} // 최소 8자
                    maxLength={20} // 최대 20자
                    name={'password'} // 폼 제출시 key 값
                />

                <button>로그인</button>
                {/* 폼 제출 버튼 */}

                <div>{message}</div>
                {/* 로그인 성공/실패 메시지 표시 */}
            </form>
        </Modal>
    )
}
