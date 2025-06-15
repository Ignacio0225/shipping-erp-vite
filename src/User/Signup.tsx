import {useState} from 'react'
import {publicAxios} from '../api/axios'
import Modal from "../components/Modal.tsx";


interface LoginProps {
    isOpen: boolean;
    onClose: () => void;
}


export default function Signup({isOpen, onClose}: LoginProps) // 3. Signup이라는 이름의 React 함수형 컴포넌트를 만듭니다.
{
    // 4. 입력값(상태) 관리: 각 input 값과, 메시지(상태) 변수들을 생성합니다.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checkPassword, setCheckPassword] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');

    // 5. 폼 제출 시 실행되는 함수: 회원가입 비동기 함수입니다.
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault(); // 6. 폼이 새로고침되는 기본 동작을 막습니다.

        // 7. (첫 번째 검증) 비밀번호와 확인값이 일치하지 않으면 경고 메시지 출력 후 함수 종료
        if (password !== checkPassword) {
            setMessage("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 8. (두 번째 검증) 비밀번호에 영문·숫자가 모두 포함됐는지 체크 (정규표현식)
        const hasNumber = /\d/.test(password); // 숫자(\d)가 포함되어 있나?
        const hasLetter = /[a-zA-Z]/.test(password); // 영문자가 포함되어 있나?
        if (!(hasNumber && hasLetter)) { // 둘 다 만족해야 통과
            setMessage("비밀번호는 영문과 숫자를 모두 포함해야 합니다.");
            return;
        }


        try {
            // 3./auth/signup 엔드포인트에 이메일,비밀번호,이름 전달
            await publicAxios.post('/signup', {username: username, password: password, email: email});
            setMessage('Signup successful');
            setEmail('');
            setUsername('');
            setPassword('');
            setCheckPassword('');
            setTimeout(() =>onClose(),1000)
        } catch (error: any) {
            setMessage(error.response?.data?.detail || error.message);
        }
    };


    return (
        <Modal onClose={onClose} isOpen={isOpen}>
            <form onSubmit={handleSignup}> {/* 14. 폼 제출시 handleSignup 함수 실행 */}
                <h2>회원가입</h2>

                <label htmlFor={'email'}>Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={'Email'}
                    required={true}
                    name={'email'}
                />

                <label htmlFor={'username'}>Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={'이름'}
                    required={true}
                    maxLength={15}
                    name={'username'}
                />

                <label htmlFor={'password'}>Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={'숫자 영문 조합 8자리'}
                    required={true}
                    minLength={8}
                    maxLength={20}
                    name={'password'}
                />
                <label htmlFor={'checkPassword'}>Check Password</label>
                <input
                    id="checkPassword"
                    type="password"
                    value={checkPassword}
                    onChange={e => setCheckPassword(e.target.value)}
                    placeholder={'숫자 영문 조합 8자리'}
                    required={true}
                    minLength={8}
                    maxLength={20}
                    name={'checkPassword'}
                />

                <button type={'submit'}>가입하기</button>
                <div>{message}</div>
            </form>
        </Modal>
    )
}