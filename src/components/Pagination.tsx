// Pagination 컴포넌트의 Props(매개변수) 타입 정의

import type {ShipmentPageOut} from "../types/shipment.ts";

interface Props {
    currentPage: number; // 현재 활성화된 페이지 번호
    totalPages: number;  // 전체 페이지 수
    onPageChange: (page: number) => void; // 페이지 버튼을 클릭했을 때 호출할 함수 (부모가 넘겨줌)
    maxButtons?: number; // 한 번에 보여줄 페이지 버튼 수 (생략 가능)
    posts:ShipmentPageOut
}

// Pagination 컴포넌트 정의, 위에서 정의한 Props 타입을 구조 분해 할당으로 받음
export default function Pagination({
    currentPage,       // 현재 페이지 번호
    totalPages,        // 전체 페이지 수
    onPageChange,      // 페이지 변경 함수
    maxButtons = 10,   // 최대 보여줄 페이지 버튼 수 (기본은 10이지만 부모에 서 20을 주면 20으로 적용됨)
    posts
    }: Props) {

    // 페이지 버튼에 표시할 번호 범위를 계산하는 함수
    const getPageRange = () => {
        const half = Math.floor(maxButtons / 2); // 현재 페이지 기준 앞뒤로 몇 개를 보여줄지 계산 (예: 10이면 앞뒤 5개씩)

        // 시작 페이지: 최소 1 이상이어야 하고, currentPage에서 half만큼 빼서 시작
        let start = Math.max(1, currentPage - half);

        // 끝 페이지: start부터 maxButtons 개수만큼 확보
        let end = start + maxButtons - 1;

        // 끝 페이지가 전체 페이지 수를 초과하면 조정
        if (end > totalPages) {
            end = totalPages; // 끝 페이지는 totalPages 이상 넘지 않도록 제한
            // 끝이 줄었으니 start도 다시 계산 (최소값 1 보장)
            start = Math.max(1, end - maxButtons + 1);
        }

        // start부터 end까지 숫자 배열 생성 (예: [3, 4, 5, 6, 7])
        const range = [];
        for (let i = start; i <= end; i++) { // i는 start부터 end까지 1씩 증가( i라는 숫자변수를 start값(예: 3)으로 처음에 세팅,  i가 end값(예: 7)보다 작거나 같을 때까지 반복,  한 번 돌 때마다 i를 1씩 증가)
            range.push(i); // range는 [3], [3,4], [3,4,5], ... 점점 길어짐
        }
        return range; // 계산된 페이지 번호 목록 반환
    };

    // 실제로 렌더링할 부분
    return (
        <div>
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}  // 1페이지일 경우 비활성화
            >
                이전
            </button>
            {/* 계산된 페이지 번호 배열을 기반으로 버튼 렌더링 */}
            {getPageRange().map((pageNum) => (
                <button
                    key={pageNum}                      // 리액트가 리스트를 인식하기 위한 고유 key
                    onClick={() => onPageChange(pageNum)} // 버튼 클릭 시 부모에게서 받은 함수를 인수를 적용시켜 작동함
                    disabled={pageNum === currentPage}     // 현재 페이지인 경우 비활성화
                >
                    {pageNum} {/*버튼에 표시할 페이지 번호*/}
                </button>
            ))}
            <button
                onClick={() =>
                    onPageChange(
                        posts && currentPage < Math.ceil(posts.total / 10)
                            ? currentPage + 1
                            : currentPage
                    )
                }
                disabled={posts ? currentPage >= Math.ceil(posts.total / 10) : true} // 마지막 페이지이면 비활성화
            >
                다음
            </button>
        </div>
    );
}


//🔧 작동 방식 요약
// currentPage 기준으로 앞뒤로 maxButtons / 2 개씩 버튼을 계산합니다.
// 예: currentPage = 6, maxButtons = 10 → 2~11번 버튼 출력
//
// 버튼 리스트는 getPageRange() 함수에서 계산합니다.
//
// 범위가 1보다 작으면 1로 고정, totalPages보다 크면 줄입니다.
//
// 계산된 페이지 번호 리스트를 .map()으로 돌려서 <button>을 만들고, 클릭 시 onPageChange() 함수로 해당 번호를 부모에게 전달합니다.
//
// 현재 페이지 번호와 같은 버튼은 disabled 상태로 비활성화됩니다.