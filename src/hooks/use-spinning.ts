export const useSpinning = () => {
  const spinning = ref(false)

  const showSpinning = () => (spinning.value = true)

  const hideSpinning = () => (spinning.value = false)

  return {
    spinning,
    showSpinning,
    hideSpinning,
  }
}
