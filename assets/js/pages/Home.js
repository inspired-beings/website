function Carousel() {
  const slides = document.querySelectorAll('.HomeHero-Slide')
  const leftButton = document.querySelector('.HomeHero-LeftButton')
  const rightButton = document.querySelector('.HomeHero-RightButton')
  if (slides.length === 0 || !leftButton || !rightButton) {
    return
  }

  let currentIndex = 0
  let intervalId

  const updateSlides = index => {
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${-currentIndex * 100}%)`
    })

    clearInterval(intervalId)
    intervalId = setInterval(() => {
      currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0
      updateSlides(currentIndex)
    }, 30000)
  }

  leftButton.addEventListener('click', () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : slides.length - 1
    updateSlides(currentIndex)
  })

  rightButton.addEventListener('click', () => {
    currentIndex = currentIndex < slides.length - 1 ? currentIndex + 1 : 0
    updateSlides(currentIndex)
  })

  updateSlides(currentIndex)
}

export function Home() {
  Carousel()
}
