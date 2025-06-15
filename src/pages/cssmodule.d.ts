// css, scss, sass 등 확장자별로 모듈 타입 정의

// 이렇게 하면 TypeScript가 "모든 .css 파일은 import 가능하다"고 이해해서 빨간 밑줄이 사라집니다.


// global.d.ts
declare module '*.css';
