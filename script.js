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

  // ... (방명록, 탭 메뉴 등 다른 코드는 그대로) ...
});
