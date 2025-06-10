// src/components/Headers.tsx
import styles from './Header.module.css';
import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import Login from "../User/Login.tsx";
import Signup from "../User/Signup.tsx";


// 1. Header 라는 이름의 함수형 컴포넌트를 생성
export default function Header() {

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem("token"); // 토큰 삭제
        setIsLoggedIn(false);             // 상태도 false로 전환(로그아웃 UI)
    };

    // 처음 렌더링 될때나 새로고침 했을때 사용하는 용도
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        setIsLoggedIn(!!token)
    }, []);

    // 2. 실제 화면에 렌더링될 JSX(HTML 과 비슷한 React 문법)를 반환
    return (

        // 3. <header> 태그는 시멘틱 웹에서 '페이지의 헤더'임을 나타냄
        <header className={styles.header}>
            <div className={styles["board-group"]}>
                <Link to={"/"}>
                    <img src="/MsLogo_2.png" alt="명성해운 로고" id="MsLogo"/>
                </Link>
            </div>

            <div className={styles["board-group"]}>
                {!isLoggedIn ? (
                    <div className={styles["board-group"]}>
                        <button type={'button'} className={styles.login} onClick={() => setIsLoginOpen(true)}>
                            로그인
                        </button>
                        <button type={'button'} className={styles.join} onClick={() => setIsSignupOpen(true)}>
                            회원가입
                        </button>
                    </div>
                ) : (
                    <div className={styles["board-group"]}>
                        <div className={styles["button-group"]}>
                            <button type={'button'} className={styles["header-btn"]}>
                                <Link to={'/post'}>공유 게시판</Link>
                            </button>
                            <button type={'button'} className={styles["header-btn"]}>프로핏 게시판</button>
                            <button type={'button'} className={styles["header-btn"]}>프로핏 그래프 게시판</button>
                        </div>
                        <div className={styles["button-group"]}>
                            <button type={'button'} className={styles.logout} onClick={handleLogout}>로그아웃</button>
                        </div>
                    </div>

                )
                }
            </div>

            {/* 로그인 모달은 필요할 때만 렌더 */}
            <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} setIsLoggedIn={setIsLoggedIn}/>
            <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}/>
        </header>
    )
}