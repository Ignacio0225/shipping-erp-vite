// css, scss, sass 등 확장자별로 모듈 타입 정의

// 이걸 정의 하지 않으면 ###.module.css 를 적용하고 있는 .tsx 파일에 빨간 밑줄 생김(작동은됨)


declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}
