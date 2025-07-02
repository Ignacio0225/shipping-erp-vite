// 사용자 정보를 가져와서 상태로 관리하는 커스텀 훅
import { useEffect, useState } from "react"; // 리액트 훅 임포트 (상태, 생명주기)
import privateAxios from "../api/axios.ts"; // 인증된 axios 인스턴스 불러옴 (JWT 포함 요청용)
import type {User} from "../types/user.ts"; // User 타입 선언(타입스크립트)
import axios from "axios"; // 일반 axios 에러 객체 체크용(axios.isAxiosError)

// 커스텀 훅: 현재 로그인 유저 정보를 가져오는 역할
export function useCurrentUser() {
    // user 상태: 현재 로그인한 사용자 정보 (없으면 null)
    const [user, setUser] = useState<User | null>(null);

    // loading 상태: 요청(비동기)이 진행 중인지 여부
    const [loading, setLoading] = useState(true);

    // error 상태: 에러 메시지 문자열(없으면 null)
    const [error, setError] = useState<string|null>(null);

    // 컴포넌트 mount 시에(처음 렌더링 또는 새로고침 등) 딱 1번 실행됨
    useEffect(() => {
        // 내부에서 async 함수로 실제 요청 보냄
        async function fetchMe() {
            try {
                // 백엔드로 GET /me 요청 (로그인한 유저 정보 반환, JWT 필요)
                const res = await privateAxios.get<User>("/me");
                // 성공시 user 상태에 저장
                setUser(res.data);
            } catch (error) {
                // 실패시 user를 null로(로그인 안됨 등)
                setUser(null);
                // axios 에러와 일반 에러 구분해서 에러 메시지 저장
                if (axios.isAxiosError(error)) {
                    setError('에러 : ' + (error.response?.data?.detail || error.message));
                } else if (error instanceof Error) {
                    setError('에러 : ' + (error.message));
                } else {
                    setError('에러 : 알 수 없는 오류');
                }
            } finally {
                // 로딩은 무조건 false(성공/실패 상관없이)
                setLoading(false);  // 로딩 종료
            }
        }
        // 비동기 함수 호출 (즉시 실행)
        void fetchMe();
    }, []); // []: 처음 1번만 실행

    // user, loading, error 3가지를 반환
    // → {user, loading, error} 형태로 여러 컴포넌트에서 사용 가능
    return { user, loading, error };
}
