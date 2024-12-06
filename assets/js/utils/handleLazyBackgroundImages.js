export function handleLazyBackgroundImages() {
  const lazyBackgroundImages = document.querySelectorAll('.lazy-background-image')
  if (lazyBackgroundImages.length === 0) {
    return
  }

  setTimeout(() => {
    lazyBackgroundImages.forEach(lazyBackgroundImage => {
      lazyBackgroundImage.style.backgroundImage = `url(${lazyBackgroundImage.dataset.backgroundImage})`
    })
  }, 1000)
}
