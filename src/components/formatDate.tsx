export default function formatDate(isoString: string)
{
    const utcDate = new Date(isoString);  // UTC 기준 Date 객체 생성
    // 9시간 = 9 * 60 * 60 * 1000 밀리초
    const kstDate = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // 9시간 더해줌(시간,밀리초 계산해야함)
    // 한국어 포맷(yyyy-mm-dd hh:mm)으로 변환하고, 구분자 일부 치환
    return kstDate.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Seoul',
    }).replace(/\. /g, '-').replace('.', '');  // "2025. 06. 21. 09:30" → "2025-06-21 09:30"
}
;