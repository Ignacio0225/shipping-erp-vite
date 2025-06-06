// src/pages/ShipmentsList.tsx

// 1. React의 useEffect, useState 훅을 불러옴
import {useEffect, useState} from "react";

// 2. 만들어놓은 axios 인스턴스를 import 함.
import axios from "../api/axios.ts";

// 3. 타입 정의를 불러와서 아래에서 사용할 수 있게 함.
import type {Shipment} from "../types/shipment.ts";

// 부모 컴포넌트에서 받아오는 프로퍼티가 없기 때문에 ShipmentsList()의 () 안에는 아무것도 줄 필요가 없음)
export default function ShipmentsList() {
    // 4. 선적 목록 데이터를 담을 상태(state) 변수. 처음엔 빈 배열. 이 useState는 반드시 Shipment 배열을 따름, 시작은 빈 배열
    const [shipments, setShipments] = useState<Shipment[]>([]);
    // 5. 컴포넌트가 처음 '마운트' 될때, 한 번만 실행되는 비동기 데이터 로딩 (uesEffect)
    useEffect(() => {
        // 6. /shipments/ 엔드포인트에서 선적 목록을 받아옴
        async function fetchData() {
            try {
                // 6. /shipments/ 엔드포인트에서 선적 목록을 받아옴
                const response = await axios.get<Shipment[]>('/api/posts/shipments');
                // 7. 받아온 데이터를 상태에 저장
                setShipments(response.data);
            } catch (error) {
                // 8. 에러 발생 시 콘솔에 출력(실제 서비스에선 사용자한테 알림 필요)
                console.error(error);
            }
        }
        fetchData(); // 함수 실행
    }, []); // 두 번째 인자가 []이므로, 한 번만 실행


    // 9. 실제 렌더링: 선적 목록을 <ul><li> 리스트로 표시
    return (
    <div>
        <h2>선적 목록</h2>
        <ul>
            <li>
                {/* 10. shipments 배열의 각 항목을 li로 출력, key는 id로 고유성 보장 */}
                {shipments.map((shipment) => (
                    <li key={shipment.id}>{shipment.title}</li>
                ))}
            </li>
        </ul>
    </div>
    )
    }