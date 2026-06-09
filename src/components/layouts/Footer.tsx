import { useLocation } from "react-router";

/**
 * Footer (페이지 하단 영역)
 * - 현재는 홈에서만 표시되는 자리표시자(placeholder) 수준
 * - App 에서도 홈 여부로 렌더를 거르지만, 여기서도 경로를 한 번 더 확인해 홈에서만 출력
 */
export default function Footer () {
  const location = useLocation()

  const isHome = location.pathname === "/"   // 홈에서만 푸터 노출

  return (
    <>
      {isHome && <h1>Footer Component</h1>}
    </>
  );
}