import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'

export function useSectionNavigation({ sectionCount, isBlocked }) {
  const currentSection = ref(0)
  const isTransitioning = ref(false)
  const touchStart = ref(null)
  const sectionRefs = []

  let transitionTimeline
  let introTween
  let wheelLockTimer

  function setSectionRef(element, index) {
    if (element) sectionRefs[index] = element
  }

  function goToSection(index, direction = index > currentSection.value ? 1 : -1) {
    const nextIndex = Math.max(0, Math.min(sectionCount - 1, index))
    if (nextIndex === currentSection.value || isTransitioning.value || isBlocked()) return

    const incoming = sectionRefs[nextIndex]
    const outgoing = sectionRefs[currentSection.value]
    if (!incoming || !outgoing) return

    isTransitioning.value = true
    gsap.set(incoming, { yPercent: direction * 100, autoAlpha: 1 })
    transitionTimeline = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power3.inOut' },
      onComplete: () => {
        currentSection.value = nextIndex
        isTransitioning.value = false
      },
    })
      .to(outgoing, { yPercent: direction * -100, autoAlpha: 0 }, 0)
      .to(incoming, { yPercent: 0, autoAlpha: 1 }, 0)
  }

  function onWheel(event) {
    if (isBlocked() || isTransitioning.value) return
    event.preventDefault()
    if (wheelLockTimer || Math.abs(event.deltaY) < 12) return

    wheelLockTimer = window.setTimeout(() => { wheelLockTimer = null }, 900)
    const direction = event.deltaY > 0 ? 1 : -1
    goToSection(currentSection.value + direction, direction)
  }

  function onTouchStart(event) {
    if (event.touches.length !== 1 || isBlocked()) {
      touchStart.value = null
      return
    }

    const section = sectionRefs[currentSection.value]
    const maxScrollTop = Math.max(0, (section?.scrollHeight ?? 0) - (section?.clientHeight ?? 0))
    const scrollTop = section?.scrollTop ?? 0
    touchStart.value = {
      clientY: event.touches[0].clientY,
      canGoUp: scrollTop <= 1,
      canGoDown: maxScrollTop <= 1 || scrollTop >= maxScrollTop - 1,
    }
  }

  function onTouchEnd(event) {
    if (!touchStart.value || isBlocked()) return
    const start = touchStart.value
    touchStart.value = null
    const delta = start.clientY - event.changedTouches[0].clientY
    if (Math.abs(delta) < 45) return

    const direction = delta > 0 ? 1 : -1
    if ((direction > 0 && !start.canGoDown) || (direction < 0 && !start.canGoUp)) return
    goToSection(currentSection.value + direction, direction)
  }

  function onKeydown(event) {
    if (isBlocked()) return
    if (event.key === 'ArrowDown' || event.key === 'PageDown') goToSection(currentSection.value + 1, 1)
    if (event.key === 'ArrowUp' || event.key === 'PageUp') goToSection(currentSection.value - 1, -1)
  }

  onMounted(() => {
    sectionRefs.forEach((section, index) => {
      gsap.set(section, { yPercent: index === 0 ? 0 : 100, autoAlpha: index === 0 ? 1 : 0 })
    })
    introTween = gsap.from('.hero-copy > *', {
      y: 32,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.1,
      delay: 0.25,
      ease: 'power3.out',
    })
    window.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    if (wheelLockTimer) window.clearTimeout(wheelLockTimer)
    transitionTimeline?.kill()
    introTween?.kill()
    gsap.killTweensOf(sectionRefs)
  })

  return {
    currentSection,
    goToSection,
    onTouchCancel: () => { touchStart.value = null },
    onTouchEnd,
    onTouchStart,
    onWheel,
    setSectionRef,
  }
}
