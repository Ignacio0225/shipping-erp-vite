// src/NotFound.tsx

export default function NotFound() {
    console.log("NotFound 렌더됨")
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404</h1>
            <p>페이지를 찾을 수 없습니다</p>
        </div>
    );
}
