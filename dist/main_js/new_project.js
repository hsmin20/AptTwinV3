function initKakaoMap() {
  console.log('kakao.maps 객체:', kakao.maps); // ✅ 여기서 찍어야 실제 객체 나옴
  const mapContainer = document.getElementById('map');
  const mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
  const map = new kakao.maps.Map(mapContainer, mapOption);
}