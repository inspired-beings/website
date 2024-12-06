export function TopBar() {
  const $topBarMenu = document.querySelector('.TopBarMenu')
  const $i18nMenu = document.querySelector('.I18nMenu')

  const $listButton = document.querySelector('.TopBarMenu-Button_list')
  const $closeButton = document.querySelector('.TopBarMenu-Button_close')
  const $globeButton = document.querySelector('.TopBarMenu-Button_globe')
  if (!$topBarMenu || !$i18nMenu || !$listButton || !$closeButton || !$globeButton) {
    return
  }

  const closeTopBarMenu = () => {
    $listButton.classList.remove('hidden')
    $closeButton.classList.add('hidden')
    $topBarMenu.classList.add('hidden-down-xl')

    document.body.style.overflow = 'auto'
  }

  const closeI18nMenu = () => {
    $i18nMenu.classList.add('hidden')

    document.body.style.overflow = 'auto'
  }

  const openTopBarMenu = () => {
    $listButton.classList.add('hidden')
    $closeButton.classList.remove('hidden')
    $topBarMenu.classList.remove('hidden-down-xl')

    document.body.style.overflow = 'hidden'

    $closeButton.setAttribute('aria-label', 'Close main menu')
    $closeButton.addEventListener('click', closeTopBarMenu, { once: true })
  }

  const openI18nMenu = () => {
    $i18nMenu.classList.remove('hidden')

    document.body.style.overflow = 'hidden'

    $closeButton.setAttribute('aria-label', 'Close country and language selection')
    $closeButton.addEventListener('click', closeI18nMenu, { once: true })
  }

  $listButton.addEventListener('click', openTopBarMenu)
  $globeButton.addEventListener('click', openI18nMenu)
}
