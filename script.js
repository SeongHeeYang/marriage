document.addEventListener('DOMContentLoaded', function () {
  // ... (카카오 지도 API 등 다른 코드는 그대로) ...

  // --- 갤러리 슬라이더 로직 (수정된 부분) ---
  const galleryContainer = document.querySelector('.gallery-container');
  const track = document.querySelector('.gallery-track');

  if (galleryContainer && track) {
    const images = Array.from(track.children);
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');

    if (images.length > 0) {
      let isDragging = false,
        startPos = 0,
        currentTranslate = 0,
        prevTranslate = 0,
        currentIndex = 0;
      const slideWidth = images[0].getBoundingClientRect().width;

      images.forEach((img) =>
        img.addEventListener('dragstart', (e) => e.preventDefault()),
      );

      galleryContainer.addEventListener('mousedown', dragStart);
      galleryContainer.addEventListener('touchstart', dragStart, {
        passive: true,
      });
      galleryContainer.addEventListener('mousemove', dragMove);
      galleryContainer.addEventListener('touchmove', dragMove, {
        passive: true,
      });
      galleryContainer.addEventListener('mouseup', dragEnd);
      galleryContainer.addEventListener('touchend', dragEnd);
      galleryContainer.addEventListener('mouseleave', dragEnd);

      nextButton.addEventListener('click', () => slideTo(currentIndex + 1));
      prevButton.addEventListener('click', () => slideTo(currentIndex - 1));

      function dragStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        track.classList.add('grabbing');
        track.style.transition = 'none';
      }
      function dragMove(event) {
        if (isDragging) {
          const currentPosition = getPositionX(event);
          currentTranslate = prevTranslate + currentPosition - startPos;
          setSliderPosition();
        }
      }
      function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('grabbing');
        track.style.transition = 'transform 0.4s ease-out';
        const movedBy = currentTranslate - prevTranslate;
        if (movedBy < -slideWidth * 0.2 && currentIndex < images.length - 1)
          currentIndex++;
        if (movedBy > slideWidth * 0.2 && currentIndex > 0) currentIndex--;
        slideTo(currentIndex);
      }
      function getPositionX(event) {
        return event.type.includes('mouse')
          ? event.pageX
          : event.touches[0].clientX;
      }
      function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
      }

      // ★★★★★ 핵심 수정 부분 ★★★★★
      function slideTo(slideIndex) {
        if (slideIndex < 0) slideIndex = 0;
        else if (slideIndex >= images.length) slideIndex = images.length - 1;

        currentIndex = slideIndex;
        currentTranslate = currentIndex * -slideWidth;
        prevTranslate = currentTranslate;
        setSliderPosition();

        // 현재 활성화된 이미지의 높이를 가져와 컨테이너 높이를 설정하는 함수
        const activeImage = images[currentIndex];

        function adjustContainerHeight() {
          // offsetHeight는 요소의 실제 렌더링된 높이를 가져옵니다.
          const imageHeight = activeImage.offsetHeight;
          if (imageHeight > 0) {
            galleryContainer.style.height = `${imageHeight}px`;
          }
        }

        // 이미지가 이미 로드되었는지 확인
        if (activeImage.complete) {
          // 로드 완료되었으면 바로 높이 조절
          adjustContainerHeight();
        } else {
          // 아직 로드되지 않았다면, 로드가 끝났을 때 한 번만 높이 조절
          activeImage.addEventListener('load', adjustContainerHeight, {
            once: true,
          });
        }
      }

      // 페이지가 처음 로드될 때 첫 번째 이미지 높이에 맞춰 초기화
      window.addEventListener('load', () => slideTo(0));
      if (document.readyState === 'complete') {
        slideTo(0);
      }
    }
  }

  // ... (방명록, 탭 메뉴 등 다른 코드는 그대로) ... // ... (기존에 갤러리, 지도 탭 등의 코드가 있다면 여기에 그대로 둡니다) ...

  // --- 방문록 기능 ---
  const scriptURL =
    'https://script.google.com/macros/s/AKfycbzjA3BrLeRsy1f8FwsdZ-s6T450JaoOjZS3mClDxexfdGPI_IuygD3dH2OJ28CipLztDQ/exec';
  const form = document.getElementById('guestbook-form');
  const entriesContainer = document.getElementById('guestbook-entries');

  // HTML 태그를 문자로 변환하는 함수 (보안 강화)
  const escapeHTML = (str) => {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (match) => {
      const escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escape[match];
    });
  };

  // 방문록 글 불러오기 (GET 방식이므로 action 파라미터 없이 호출)
  const loadEntries = async () => {
    try {
      const response = await fetch(scriptURL);
      const entries = await response.json();
      entriesContainer.innerHTML = '';

      if (entries.length === 0) {
        entriesContainer.innerHTML =
          '<p class="no-entries">아직 등록된 축하 메시지가 없습니다.</p>';
        return;
      }

      entries.data.forEach((entry) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry';
        const entryDate = new Date(entry.timestamp).toLocaleDateString('ko-KR');

        entryDiv.innerHTML = `
                    <div class="entry-header">
                        <span class="entry-name">${escapeHTML(
                          entry.name,
                        )}</span>
                        <span class="entry-date">${entryDate}</span>
                    </div>
                    <p class="entry-message">${escapeHTML(
                      entry.message,
                    ).replace(/\n/g, '<br>')}</p>
                    <button class="btn-delete" data-row="${
                      entry.row
                    }">삭제</button>
                `;
        entriesContainer.appendChild(entryDiv);
      });
    } catch (error) {
      console.error('방명록 로딩 실패:', error);
      entriesContainer.innerHTML =
        '<p class="no-entries">방명록을 불러오는 데 실패했습니다.</p>';
    }
  };

  // 폼 제출 처리 (새 글 등록 - GET 방식)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = '등록 중...';

    const name = document.getElementById('guest-name').value;
    const password = document.getElementById('guest-password').value;
    const message = document.getElementById('guest-message').value;

    // URL에 쿼리 파라미터로 데이터 추가
    const params = new URLSearchParams({
      action: 'add',
      name: name,
      password: password,
      message: message,
    });
    const fetchURL = `${scriptURL}?${params.toString()}`;

    try {
      const response = await fetch(fetchURL);
      const result = await response.json();
      if (result.result !== 'success') {
        throw new Error(result.message || '알 수 없는 오류');
      }
      form.reset();
      await loadEntries(); // 목록 새로고침
    } catch (error) {
      console.error('글 등록 실패:', error);
      alert('글 등록에 실패했습니다: ' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '글 남기기';
    }
  });

  // 삭제 버튼 클릭 처리 (GET 방식)
  entriesContainer.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const row = e.target.dataset.row;
      const password = prompt('글 작성 시 입력했던 비밀번호를 입력하세요.');

      if (password === null || password.trim() === '') return;

      // URL에 쿼리 파라미터로 데이터 추가
      const params = new URLSearchParams({
        action: 'delete',
        row: row,
        password: password,
      });
      const fetchURL = `${scriptURL}?${params.toString()}`;

      try {
        const response = await fetch(fetchURL);
        const result = await response.json();
        alert(result.message);
        if (result.result === 'success') {
          await loadEntries(); // 목록 새로고침
        }
      } catch (error) {
        console.error('삭제 처리 실패:', error);
        alert('삭제 요청 중 오류가 발생했습니다.');
      }
    }
  });

  // 페이지가 처음 로드될 때 방문록 글 불러오기
  loadEntries();
});
