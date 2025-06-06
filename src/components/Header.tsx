// src/components/Headers.tsx

import styles from './Header.module.css';


// 1. Header 라는 이름의 함수형 컴포넌트를 생성
export default function Header() {
     // 2. 실제 화면에 렌더링될 JSX(HTML 과 비슷한 React 문법)를 반환
    return (
        // 3. <header> 태그는 시멘틱 웹에서 '페이지의 헤더'임을 나타냄
        <header className={styles.header}>
            <h1>Shipping ERP</h1>
        </header>
    )
}