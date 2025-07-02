// src/type/shipments.ts

// 1.선적(Shipments) 객체가 가져야 하는 데이터 구조를 인터페이스로 정의함.
import type {PageData} from "../components/Pagination.tsx";


export type Shipment = {
    id: number; // shipment 게시글의 id(고유번호)
    title: string; // 게시글을 문자열로 받아옴
    description?: string; // 게시글 내용 문자열로 받아옴 (선택적임 fastAPI 모델의 nullable = True 와 동일)
    // → description이라는 속성이 있어도 되고, 없어도 됨
    // 있으면 string(문자열) 타입이어야 함
    // 안 보내도 에러 안 남
    file_paths?: string[] | null; // 파일의 경로를 문자열로 받아옴 (선택적임 fastAPI 모델의 nullable = True 와 동일)
    created_at: string; // 생성일시를 문자열(ISO 문자열)로 받아옴
    updated_at: string;
    // updated_at 추가 예정
    creator?: {
        id: number;
        username: string;
        email: string;
        role: string;
    }; // 작성자 id를 숫자로 받아옴 (선택적임 fastAPI 모델의 nullable = True 와 동일)
    type_category?: {
        id: string;
        title: string;
    };
    region_category?: {
        id: string;
        title: string;
    };
}



export type ShipmentPageOut = PageData<Shipment>;
