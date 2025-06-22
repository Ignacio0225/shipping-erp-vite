// src/components/SharePostFileDownload.tsx

import axios from "axios";

import privateAxios from "../../api/axios.ts";
// privateAxios: JWT 토큰 자동 포함하는 axios 인스턴스. 인증이 필요한 API 요청에 사용.
import styles from "./SharePostFileDownload.module.css";
import {useNavigate} from "react-router-dom";
import {useState} from "react";


// CSS 모듈 import. styles 객체를 통해 CSS 클래스명을 안전하게 사용 가능.

interface SharePostFilePathProps {
    ship_id: number;  // 게시글 ID (선적 ID)
    filePaths: string[] | null | undefined;
    // 게시글에 첨부된 파일 경로 리스트 (문자열 배열)
    // 없을 수도 있으므로 null 또는 undefined 허용
}


export default function SharePostFileDownload({ship_id, filePaths}: SharePostFilePathProps) {
    // React 컴포넌트 정의
    // props로 ship_id, filePaths를 받음


    const nav = useNavigate();

    const [error,setError]=useState<string|null>(null);

    if (!filePaths || filePaths.length === 0) {
        // filePaths가 없거나 길이가 0이면 (첨부된 파일이 하나도 없으면)
        return <p className={styles.noFiles}>첨부된 파일이 없습니다.</p>;
        // 사용자에게 안내 문구 출력 후 컴포넌트 종료
    }

    // 경로에서 파일명만 추출하는 함수 정의
    const getFileName = (path: string) => {
        // 문자열 path를 '/' 기준으로 나누고, 마지막 부분(파일명)을 반환, 만약 마지막 부분이 없으면 "unknown_file" 반환 (안전망)
        const fullName = path.split("/").pop() || "unknown_file"; // 전체 파일명 추출
        // '_'를 기준으로 나누고, 그 뒤의 부분(원래 파일명)만 반환
        const parts = fullName.split("_");
        return parts.length > 1 ? parts.slice(1).join("_") : fullName;
        //parts는 fullName.split("_") 결과로 나온 배열입니다.
        // 예를 들어,
        // "cba39ed6-d8df-48cb-9ce6-26543e1dc814_스크린샷.png" 라면
        // parts = ["cba39ed6-d8df-48cb-9ce6-26543e1dc814", "스크린샷.png"]
        //
        // parts.length > 1 은 "언더스코어('_')로 분할한 배열의 길이가 2 이상인가?" 를 체크합니다.
        // 즉, 파일명에 _가 포함되어 있고 분할된 조각이 2개 이상인지 확인하는 조건입니다.
        //
        // 만약 조건이 참(true)이면 parts.slice(1).join("_") 를 반환합니다.
        //
        // slice(1)은 배열의 1번 인덱스부터 끝까지 잘라서 새 배열을 만듭니다.
        // 위 예시에서 ["스크린샷.png"]
        //
        // join("_")은 그 잘린 배열을 다시 언더스코어(_)로 연결해서 문자열로 만듭니다.
        // 결국 "스크린샷.png" 가 됩니다.
        // 즉, UUID 부분을 떼고 나머지 원래 파일명만 반환하는 것입니다.
        //
        // 만약 조건이 거짓(false)이면, fullName 을 그대로 반환합니다.
        // 즉, _ 가 포함되어 있지 않아서 UUID가 없거나 분할이 안 된 상태라면, 전체 파일명을 그대로 보여주는 겁니다.
    };

    // 파일 다운로드 함수 (privateAxios 사용, JWT 인증 포함)
    const handleDownload = async (file_index: number) => {
        try {
            // 서버에 파일 다운로드 요청 보내기
            // responseType: "blob" → 바이너리 데이터(파일 데이터) 받기 위해 설정
            const res = await privateAxios.get(
                `/api/posts/shipments/${ship_id}/files/${file_index}/download`,
                {responseType: "blob"}
            );

            // 받은 바이너리 데이터를 브라우저 Blob 객체로 만듦
            const url = window.URL.createObjectURL(new Blob([res.data]));
            //서버에서 받은 바이너리 데이터(res.data)를 Blob 객체로 감쌈.
            // Blob은 파일과 유사한 데이터 객체.
            // createObjectURL은 이 Blob을 가리키는 임시 URL을 만듦
            // 이 URL을 통해 브라우저가 메모리에 있는 데이터에 접근할 수 있게 됨

            // 다운로드를 위해 임시 <a> 태그 생성, 다운로드를 트리거하기 위한 링크(a 태그)를 동적으로 만듭니다.
            const link = document.createElement("a");

            // 다운로드 링크 설정 (blob URL)
            link.href = url;

            // 다운로드 시 파일명 지정 (파일 경로에서 이름만 추출)
            link.setAttribute("download", getFileName(filePaths[file_index]));

            // 문서 body에 임시로 추가, 이 <a> 태그를 실제 DOM에 추가해야 클릭 이벤트가 정상 작동.
            document.body.appendChild(link);

            // 다운로드 자동 트리거 (사용자 클릭 없이)
            link.click();

            // 임시 링크 제거 (클린업)
            link.remove();

            // Blob URL 해제 (메모리 낭비 방지)
            window.URL.revokeObjectURL(url);


        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    nav('/404', {replace: true});
                } else {
                    setError('에러 :' + (error.response?.data?.detail || error.message)); //detail이 없으면 일반적인 JavaScript 에러 메시지인 error.message를 보여줌
                }
            } else if (error instanceof Error) {
                setError('에러 :' + (error.message)); // Axios 에러가 아닌 일반적인 JavaScript 에러일 경우
            } else {
                // Axios 에러가 아닐 때 일반 오류 처리
                setError("파일 다운로드 중 알 수 없는 오류가 발생했습니다.");
            }
        }
    };
    if (error) return <div>{error}</div>;

    return (
        // 파일 리스트 및 다운로드 버튼 UI 렌더링
        <div className={styles.fileListContainer}>
            <h4 className={styles.fileListTitle}>첨부 파일</h4>
            <ul className={styles.fileList}>
                {/*// 파일 경로 배열을 map으로 순회하면서 각각 리스트 아이템 생성 index 번호도 같이 가져옴*/}
                {filePaths.map((filePath, index) => (
                    // 파일 경로 배열을 map으로 순회하면서 각각 리스트 아이템 생성
                    <li key={index} className={styles.fileListItem}>
                        {/* 파일명만 화면에 표시 */}
                        <span className={styles.fileName}>{getFileName(filePath)}</span>

                        {/* 다운로드 버튼 */}
                        <button
                            type="button"
                            className={styles.downloadBtn}
                            onClick={() => handleDownload(index)} // 클릭 시 해당 인덱스 파일 다운로드 실행
                        >
                            다운로드
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
