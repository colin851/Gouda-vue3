import { onBeforeUnmount, onMounted, ref } from 'vue'
import { gsap } from 'gsap'

// 集中管理全屏页面的滚轮、触摸、键盘输入和 GSAP 位移动画。
// isBlocked 由调用方提供，使详情弹层等上层 UI 可以临时冻结底层导航。
export function useSectionNavigation({ sectionCount, isBlocked }) {
  const currentSection = ref(0)
  const isTransitioning = ref(false)
  const touchStart = ref(null)
  // sectionRefs 的数组索引与 currentSection 完全一致，动画时无需查询 DOM。
  const sectionRefs = []

  let transitionTimeline
  let introTween
  let wheelLockTimer

  function setSectionRef(element, index) {
    if (element) sectionRefs[index] = element
  }

  function goToSection(index, direction = index > currentSection.value ? 1 : -1) {
    // 所有入口都在这里裁剪索引并检查动画锁，防止并发时间线争用同一节点。
    const nextIndex = Math.max(0, Math.min(sectionCount - 1, index))
    if (nextIndex === currentSection.value || isTransitioning.value || isBlocked()) return

    const incoming = sectionRefs[nextIndex]
    const outgoing = sectionRefs[currentSection.value]
    if (!incoming || !outgoing) return

    isTransitioning.value = true
    // 新页面先放到移动方向的视口外，再与旧页面同步交叉移动。
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
    // 忽略触控板的微小惯性，并在一次手势后锁定 900ms，避免连续翻过多页。
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

    // 手势开始时记录当前滚动边界，避免页面刚滚到底就被同一次手势切走。
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
    // 小于阈值的移动视为点击或轻扫，不触发整页切换。
    if (Math.abs(delta) < 45) return

    const direction = delta > 0 ? 1 : -1
    if ((direction > 0 && !start.canGoDown) || (direction < 0 && !start.canGoUp)) return
    goToSection(currentSection.value + direction, direction)
  }

  function onKeydown(event) {
    // 弹层打开时由弹层接管键盘；底层只响应上下方向和翻页键。
    if (isBlocked()) return
    if (event.key === 'ArrowDown' || event.key === 'PageDown') goToSection(currentSection.value + 1, 1)
    if (event.key === 'ArrowUp' || event.key === 'PageUp') goToSection(currentSection.value - 1, -1)
  }

  onMounted(() => {
    // 初次挂载只显示首页，其余页面预先放在下方等待进入。
    sectionRefs.forEach((section, index) => {
      gsap.set(section, { yPercent: index === 0 ? 0 : 100, autoAlpha: index === 0 ? 1 : 0 })
    })
    // 首屏文案只执行一次入场，不参与之后的整页切换时间线。
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
    // 清除所有全局副作用，确保热更新和组件重新挂载不会重复注册。
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
