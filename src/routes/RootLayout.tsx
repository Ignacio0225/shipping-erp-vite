// 칠드런 패스를 받아오지 못하기때문에 핋요함
// 중첩된 라우트가 가진 실제 콘텐츠가 렌더링되고 삽입되어야 할 위치에 사용됨
import {Outlet} from 'react-router-dom'
import Header from "../components/Header";



export default function RootLayout(){
    return <>
    {/*헤더 부분을 계속 사용하기위해 사용(계속 출력 해주기 위함)*/}
    <Header/>
        <Outlet/>
    </>
}