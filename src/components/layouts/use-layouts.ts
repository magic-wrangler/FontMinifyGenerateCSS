import { LayoutsApi } from '@/data-source'
import { useI18n } from 'vue-i18n'
import { Lang } from '@/constant/enums'
import { type Props, MenuType } from './layouts.interface'
import { template } from 'lodash-es'
import { ROUTE } from '@/router/constants'

export const useLayouts = (props?: Props) => {
  const { locale } = useI18n()

  const layoutInfo = ref<Layout.RootObject>()

  const setLayoutInfo = async () => {
    const data = await LayoutsApi.getLayoutData()
    layoutInfo.value = data
  }
  const header = computed<Layout.Header>(() => layoutInfo.value?.header as unknown as Layout.Header)

  const footer = computed<Layout.Footer>(() => layoutInfo.value?.footer as unknown as Layout.Footer)

  const isCn = computed(() => locale.value === Lang.CN)

  const route = useRoute()

  const router = useRouter()

  const path = computed(() => {
    const arr = route.path.split('/')
    return arr[arr.length - 1]
  })


  const excludePage = computed(() => props?.exclude?.includes(path.value))

  const templateVal = (text: string) => {
    const compiled = template(text)
    return compiled({ year: new Date().getFullYear() })
  }

  const handleMenuClick = (item: Layout.Menu) => {
    switch (item.type) {
      case MenuType.JUMP:
        router.push(item.url as ROUTE)
        break
      case MenuType.LINK:
        window.open(item.url as string, '_blank')
        break
      case MenuType.CURRENT_LINK:
        window.location.href = item.url as string
        break
      default:
        window.open(item.url as string, '_blank')
        break
    }
  }

  onMounted(async () => {
    await setLayoutInfo()
  })

  return {
    header,
    footer,
    isCn,
    excludePage,
    templateVal,
    handleMenuClick,
  }
}
