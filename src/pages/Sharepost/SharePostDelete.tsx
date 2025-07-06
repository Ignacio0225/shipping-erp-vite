// 게시글 삭제 버튼 클릭 시 실행되는 함수 (이 파일 전체가 게시글 삭제용 컴포넌트임)
import type {Post} from "../../types/post.ts"; // Post 타입(게시글 데이터 구조) 임포트(실제로는 삭제에는 잘 안 쓰이지만, 타입 안정성용)
import privateAxios from "../../api/axios.ts"; // 로그인 필요(인증토큰) 전용 axios 인스턴스 import
import axios from "axios"; // axios 패키지(에러 판별용)
import {useState} from "react"; // 리액트 상태 관리 훅
import {useNavigate} from "react-router-dom"; // 페이지 이동용 훅

// 부모 컴포넌트가 전달해야 하는 프롭 타입 정의
type Props = {
    post_id: number; // 삭제할 게시글 id(숫자, 부모가 반드시 넘겨야 함)
    onDeleted?: () => void; // 삭제 성공 후 실행할 콜백 함수(부모가 필요하면 넘김, 생략 가능)
}


// 게시글 삭제 버튼 컴포넌트(기본 내보내기)
export default function SharePostDelete({post_id, onDeleted}: Props) {
    const nav = useNavigate(); // 페이지 이동용 함수 생성(라우터 훅)
    const [error, setError] = useState<string | null>(null); // 에러 메시지 상태(초기값 null)

    // 삭제 처리 함수(버튼에서 호출)
    const handleDelete = async () => {
        const ok = window.confirm('정말 삭제하시겠습니까?'); // 사용자에게 삭제 확인창 띄움
        if (!ok) return; // 취소 버튼 클릭 시 함수 종료(아무 동작 안함)

        try {
            // DELETE 요청: 실제 게시글 삭제(서버에 ship_id를 보내서 삭제함)
            await privateAxios.delete<Post>(`api/posts/posts/${post_id}`);
            // 삭제 성공 시 분기
            if (onDeleted) {
                onDeleted(); // 부모가 콜백 넘겼으면 콜백 함수 실행(예: 목록 새로고침, 모달 닫기 등) -><SharePostDelete post_id={post.id} obDeleted(nav('/posts', {replace: true})) 이렇게도 가능 />
            } else {
                nav('/posts', {replace: true}); // 콜백 없으면 기본 동작: 게시글 목록으로 이동(뒤로가기 히스토리도 막음)
            }
        } catch (error) {
            // 에러 상황별로 분기 처리
            if (axios.isAxiosError(error)) {
                // 서버에서 내려준 detail 메시지 있으면 사용, 없으면 기본 메시지
                setError(error.response?.data?.detail || error.message);
            } else if (error instanceof Error) {
                // 일반 JS 에러라면 메시지 저장
                setError(error.message);
            } else {
                // 완전히 예상 밖의 에러라면 이 메시지 표시
                setError("알 수 없는 오류");
            }
        }
    };

    return (
        <>
            {/* 삭제 버튼, 클릭 시 handleDelete 함수 실행 */}
            <button type="button" onClick={handleDelete}>삭제</button>
            {/* 에러 발생 시 에러 메시지 출력 */}
            {error && <div>{error}</div>}
        </>
    );
}
