// src/components/Headers.tsx
import styles from './Header.module.css';
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import Login from "../User/Login.tsx";
import Signup from "../User/Signup.tsx";


// 1. Header 라는 이름의 함수형 컴포넌트를 생성
export default function Header() {

    const nav = useNavigate();
    const location = useLocation(); // 현재 경로를 가져오기 위해 추가

    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 현재 페이지 확인 함수 (페이지 이름을 가져오는법)
    const getCurrentPage = () => {
        const path = location.pathname;
        if (path.includes('/posts')) return 'share';
        if (path.includes('/profit-graph')) return 'profit-graph';
        if (path.includes('/profit')) return 'profit';
        return '';
    };

    const currentPage = getCurrentPage();

    // 로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem("access_token"); // 토큰 삭제
        setIsLoggedIn(false);             // 상태도 false로 전환(로그아웃 UI)
        nav('/',{replace: true})
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
            <div className={styles.logoArea}>
                <Link to="/">
                    <img src="/MsLogo.png" alt="명성해운 로고" className={styles.logo}/>
                </Link>
            </div>

            <div className={styles.menuArea}>
                {!isLoggedIn ? (
                    <div className={styles.authButtons}>
                        <button className={styles.login} onClick={() => setIsLoginOpen(true)}>로그인</button>
                        <button className={styles.join} onClick={() => setIsSignupOpen(true)}>회원가입</button>
                    </div>
                ) : (
                    <div className={styles.loggedIn}>
                        <div className={styles.navButtons}>
                            <button 

                                onClick={()=>nav('/posts')}
                                // currentPage 는 /페이지이름 에 따라 active css 적용을 위함
                                className={`${styles.navBtn} ${currentPage === 'share' ? styles.active : ''}`}
                            >
                                공유 게시판
                            </button>
                            <button
                                className={`${styles.navBtn} ${currentPage === 'profit' ? styles.active : ''}`}
                                onClick={()=>nav('/profit')}
                            >
                                프로핏 게시판
                            </button>
                            <button
                                className={`${styles.navBtn} ${currentPage === 'profit-graph' ? styles.active : ''}`}
                                onClick={()=>nav('/profit-graph')}
                            >
                                프로핏 그래프 게시판
                            </button>
                        </div>
                        <button className={styles.logout} onClick={handleLogout}>로그아웃</button>
                    </div>
                )}
            </div>

            <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} setIsLoggedIn={setIsLoggedIn}/>
            <Signup isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)}/>
        </header>
    )
}