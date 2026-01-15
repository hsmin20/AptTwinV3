let CURRENT_USER_ID = null;
let searchAptName = ''; // To use in callback function

// 페이지 로드시 먼저 로그인 유저 가져오기 후 지도 초기화
async function initPage() {
    await fetchCurrentUser(); // CURRENT_USER_ID 세팅
    initKakaoMap();           // 지도 초기화
}

initPage();

// 로그인 유저 가져오기
async function fetchCurrentUser() {
    try {
        const res = await fetch('./member/php/check_login.php');
        const data = await res.json();
        if (data.logged_in) {
            CURRENT_USER_ID = data.userid;
        } else {
            alert('로그인 상태가 아닙니다.');
        }
    } catch (err) {
        console.error('로그인 유저 가져오기 실패', err);
    }
}

// main_js/new_project.js
async function initKakaoMap() {
    const mapContainer = document.getElementById('map');
    const mapOption = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 5 };
    const map = new kakao.maps.Map(mapContainer, mapOption);
    const ps = new kakao.maps.services.Places();
    const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('aptSearch');

    let markers = [];
    let modelCache = {}; // 단일 조회용 캐시

    async function checkAptData(aptName) {
        try {
            const res = await fetch('./check_apt.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apt_name: aptName })
            });
            const data = await res.json();

            return data;
        } catch (err) {
            console.error(err);
            alert('모델 캐시 로드 중 오류 발생');
            return {};
        }
    }

    async function fetchAptData(aptName, sizem2, atype) {
        try {
            const res = await fetch('./get_aptmodel.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apt_name: aptName, size_m2: sizem2, type: atype })
            });
            const data = await res.json();
            const cache = {};
            if (data.exists) {
                cache[aptName] = { model_id: data.model_id, model_json: data.model_json, size_m2: data.size_m2, type: data.type };
            }
            return cache;
        } catch (err) {
            console.error(err);
            alert('모델 캐시 로드 중 오류 발생');
            return {};
        }
    }

    function removeMarkers() {
        markers.forEach(marker => marker.setMap(null));
        markers = [];
    }

    function addMarker(position) {
        const marker = new kakao.maps.Marker({ position, map });
        return marker;
    }

    function filterApartments(data) {
        const blockWords = ['경로당', '관리사무소', '상가', '주유소', '공원', '노인정', '충전소'];
        return data.filter(place => {
            const name = place.place_name || '';
            const isBlocked = blockWords.some(word => name.includes(word));
            const isAptCategory = place.category_group_code === 'APT';
            const isAptName = name.includes('아파트') && name.includes(searchAptName);
            return !isBlocked && (isAptCategory || isAptName);
        });
    }

    async function displayPlaces(places) {
        const bounds = new kakao.maps.LatLngBounds();
        removeMarkers();

        places.forEach(place => {
            const position = new kakao.maps.LatLng(place.y, place.x);
            const marker = addMarker(position);
            markers.push(marker);

            kakao.maps.event.addListener(marker, 'click', () => {
                const content = document.createElement('div');
                content.style.padding = '10px';
                content.style.fontSize = '14px';

                const nameElem = document.createElement('b');
                nameElem.textContent = place.place_name;
                content.appendChild(nameElem);
                content.appendChild(document.createElement('br'));

                const addrElem = document.createElement('span');
                addrElem.textContent = place.road_address_name || place.address_name;
                content.appendChild(addrElem);
                content.appendChild(document.createElement('br'));

                const selectBtn = document.createElement('button');
                selectBtn.textContent = '이 아파트 선택';
                selectBtn.style.marginTop = '6px';
                selectBtn.style.padding = '5px 8px';
                selectBtn.style.background = '#f5f1e6';
                selectBtn.style.color = '#5a4b3b';
                selectBtn.style.border = '1px solid #d8c9a7';
                selectBtn.style.borderRadius = '4px';
                selectBtn.style.cursor = 'pointer';
                content.appendChild(selectBtn);

                infowindow.setContent(content);
                infowindow.open(map, marker);

                selectBtn.onclick = async () => {
                    let aptName = place.place_name.trim();
                    if (aptName.endsWith("아파트")) aptName = aptName.slice(0, -3);

                    const modelinfo = await checkAptData(aptName);
                    if (modelinfo.length == 0) {
                        alert(`"${aptName}"은(는) 아직 모델이 준비 중입니다.`);
                        return;
                    }

                    const selectElement = document.getElementById("size_type");
                    selectElement.innerHTML = '';
                    for(let i=0; i<modelinfo.length; i++) {
                        const newSizeType = document.createElement("option");
                        let size = modelinfo[i].size_m2;
                        let txt = (Number.isInteger(size) ? size : size.toFixed(1)) + " m²";
                        if(modelinfo[i].type.length > 0)
                            txt += ", type " + modelinfo[i].type;
                        newSizeType.value = modelinfo[i].size_m2 + "," + modelinfo[i].type;
                        newSizeType.textContent = txt;
                        selectElement.appendChild(newSizeType);
                    }

                    const modal = document.getElementById('uploadModal');
                    const overlay = document.getElementById('modalOverlay');
                    modal.style.display = 'block';
                    overlay.style.display = 'block';

                    document.getElementById('uploadCancelBtn').onclick = () => {
                        modal.style.display = 'none';
                        overlay.style.display = 'none';
                    };

                    document.getElementById('uploadConfirmBtn').onclick = async () => {
                        if (!CURRENT_USER_ID) {
                            alert('유저 정보가 아직 로드되지 않았습니다.');
                            return;
                        }

                        const houseName = document.getElementById('house_name').value;
                        const comment = document.getElementById('comment').value;
                        const selectedSize = document.getElementById('size_type').value;
                        const sizeArray = selectedSize.split(",");
                        const size_m2 = sizeArray[0];
                        const type = sizeArray[1];

                        modelCache = await fetchAptData(aptName, size_m2, type);
                        modelData = modelCache[aptName];
                        
                        // console.log(modelData.size_m2 + ', ' + modelData.type);

                        const payload = {
                            house_id: null,
                            // house_size: houseSize,
                            nickName: houseName,
                            data: modelData.model_json,
                            comment2: comment,
                            model_id: modelData.model_id,
                            userId: CURRENT_USER_ID
                        };

                        try {
                            const res = await fetch('./upload_houses.php', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });

                            const newHouseId = await res.text();
                            // alert(`업로드 완료: ${newHouseId}`);
                            modal.style.display = 'none';
                            overlay.style.display = 'none';

                            window.location.href = 'house_project.html';
                        } catch (err) {
                            console.error(err);
                            alert('업로드 중 오류 발생');
                        }
                    };
                };
            });

            bounds.extend(position);
        });

        map.setBounds(bounds);
    }

    function placesSearchCB(data, status) {
        if (status === kakao.maps.services.Status.OK) {
            const apartments = filterApartments(data);
            if (apartments.length === 0) 
                alert('검색 결과 중 아파트가 없습니다.');
            else 
                displayPlaces(apartments);
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
            alert('검색 결과가 없습니다.');
        } else {
            alert('검색 중 오류가 발생했습니다.');
        }
    }

    searchBtn.addEventListener('click', () => {
        const aptName = searchInput.value.trim();
        if (!aptName) 
            return alert('검색어를 입력해주세요.');

        searchAptName = aptName;

        ps.keywordSearch(aptName, placesSearchCB);
    });

    searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') searchBtn.click();
    });

    console.log('카카오 지도 로드 완료');
}
