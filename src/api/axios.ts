// src/api/axios.ts

// 1. axios 라이브러리 불러옴
import axios from 'axios';



// 유저 인증이 없는 상태의 AXIOS
export const publicAxios=axios.create({
    baseURL:'http://localhost:8000',
    timeout:5000,
    headers:{'Content-Type': 'application/x-www-form-urlencoded'},
})







// 유저 인증이 포함된 AXIOS
// 2. axios의 create 메서드로 '나만의 인스턴스' 를 만듬
export const privateAxios = axios.create({
    // 3. baseURL: 앞으로 모든 API 요청이 이 주소를 기준으로 보냄.
    //    (FastApi 서버 주소/포트에 맞춰야함. 예: http://localhost:8000)
    baseURL: 'http://localhost:8000',
    // 4. timeout: 요청이 너무 오래 걸릴 경우(5초 넘으면) 자동으로 중단
    timeout: 5000,
    // 5. headers: 모든 요청에 'Content-Type: applications/json' 헤더를 붙임.
    headers: {'Content-Type': 'application/json'}
});

// 6. interceptors.request.use()는
//    - axios에서 "모든 요청이 서버로 날아가기 직전"에 호출되는 함수
//    - 여기서 요청 객체(config)를 수정하면, 실제 서버로 나갈 때 그 변경이 반영됨
// 모든 요청에 JWT 토큰을 자동으로 실어주는코드.
privateAxios.interceptors.request.use(
    (config) => {
        // 7. localStorage에서 access_token이라는 값을 꺼냄
        //    - localStorage: 브라우저가 제공하는 "영구 저장소"(사용자가 새로고침해도 값이 남음)
        //    - access_token: 로그인 시 FastAPI 백엔드에서 받은 JWT 토큰을 저장해두는 키(문자열)
        const token = localStorage.getItem('access_token');
        // 8. 만약 토큰이 존재하면(=로그인한 사용자라면)
        //    - Authorization이라는 HTTP 헤더를 "Bearer {토큰값}" 형태로 추가함
        //    - "Bearer"는 토큰 인증 방식에서 표준적으로 붙이는 접두어(서버가 요구)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // 9. 최종적으로 config(요청 객체)를 반환
        //    - 이 config는 axios가 실제로 서버에 요청을 보낼 때 사용됨.
        return config;
    },
    // 10. 만약 인터셉터(혹은 이전 단계)에서 에러가 나면
    //     - 그 에러를 Promise.reject(error)로 넘겨서, catch문 등에서 처리할 수 있게 함
    (error) => Promise.reject(error)
);

privateAxios.interceptors.response.use(
    response => response,
    async error => {
        // access_token 만료로 401이 왔을 때
        if (error.response && error.response.status === 401) {
            // 1. /refresh로 새 access_token 요청
            try {
                // refresh_token은 쿠키에 있으므로 credentials 필요
                const res = await publicAxios.post('/refresh', {}, {withCredentials: true});
                const newAccessToken = res.data.access_token;

                // 2. 새 access_token을 localStorage에 저장
                localStorage.setItem('access_token', newAccessToken);

                // 3. 원래 요청을 access_token만 바꿔서 다시 보냄
                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return privateAxios.request(error.config); // 재시도
            } catch (refreshError) {
                // 4. 만약 refresh마저 실패하면 (refresh_token도 만료 or 위조)
                localStorage.removeItem('access_token');
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        // 401이 아닌 다른 에러는 그대로 처리
        return Promise.reject(error);
    }
);


// 11. 만들어진 axios 인스턴스를 기본값으로 내보냄.
// (다른 파일에서 import 해서 사용)


export const privateMultiAxios = axios.create({

    // 3. baseURL: 앞으로 모든 API 요청이 이 주소를 기준으로 보냄.
    //    (FastApi 서버 주소/포트에 맞춰야함. 예: http://localhost:8000)
    baseURL: 'http://localhost:8000',
    // 4. timeout: 요청이 너무 오래 걸릴 경우(5초 넘으면) 자동으로 중단
    timeout: 5000,
    // 5. headers: 모든 요청에 'Content-Type: applications/json' 헤더를 붙임.
    headers: {'Content-Type': 'multipart/form-data'}
});

// 6. interceptors.request.use()는
//    - axios에서 "모든 요청이 서버로 날아가기 직전"에 호출되는 함수
//    - 여기서 요청 객체(config)를 수정하면, 실제 서버로 나갈 때 그 변경이 반영됨
// 모든 요청에 JWT 토큰을 자동으로 실어주는코드.
privateMultiAxios.interceptors.request.use(
    (config) => {
        // 7. localStorage에서 access_token이라는 값을 꺼냄
        //    - localStorage: 브라우저가 제공하는 "영구 저장소"(사용자가 새로고침해도 값이 남음)
        //    - access_token: 로그인 시 FastAPI 백엔드에서 받은 JWT 토큰을 저장해두는 키(문자열)
        const token = localStorage.getItem('access_token');
        // 8. 만약 토큰이 존재하면(=로그인한 사용자라면)
        //    - Authorization이라는 HTTP 헤더를 "Bearer {토큰값}" 형태로 추가함
        //    - "Bearer"는 토큰 인증 방식에서 표준적으로 붙이는 접두어(서버가 요구)
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // 9. 최종적으로 config(요청 객체)를 반환
        //    - 이 config는 axios가 실제로 서버에 요청을 보낼 때 사용됨.
        return config;
    },
    // 10. 만약 인터셉터(혹은 이전 단계)에서 에러가 나면
    //     - 그 에러를 Promise.reject(error)로 넘겨서, catch문 등에서 처리할 수 있게 함
    (error) => Promise.reject(error)
);

privateMultiAxios.interceptors.response.use(
    response => response,
    async error => {
        // access_token 만료로 401이 왔을 때
        if (error.response && error.response.status === 401) {
            // 1. /refresh로 새 access_token 요청
            try {
                // refresh_token은 쿠키에 있으므로 credentials 필요
                const res = await publicAxios.post('/refresh', {}, {withCredentials: true});
                const newAccessToken = res.data.access_token;

                // 2. 새 access_token을 localStorage에 저장
                localStorage.setItem('access_token', newAccessToken);

                // 3. 원래 요청을 access_token만 바꿔서 다시 보냄
                error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return privateMultiAxios.request(error.config); // 재시도
            } catch (refreshError) {
                // 4. 만약 refresh마저 실패하면 (refresh_token도 만료 or 위조)
                localStorage.removeItem('access_token');
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        // 401이 아닌 다른 에러는 그대로 처리
        return Promise.reject(error);
    }
);


export default privateAxios;


// export default 가 실행 되기전, 즉. 다른 컴포넌트에서 이 컴포넌트가 import 될때 instance만 실행되는게 아니라 이 컴포넌트의 모든게 실행됨
// 그래서 import 까지 가기전에 interceptors 해서 유저 인증을 먼저 해주는것
