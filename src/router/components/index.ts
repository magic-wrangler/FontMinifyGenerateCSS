import router from '@/router'
import { ROUTE } from '@/router/constants'
import type { CompSchemaEnum } from '@/stores/use-compinents.store'

/** 跳转组件页 */
export const navigateToComp = (type?: CompSchemaEnum) => {
  const query = type ? { widget: type } : {}
  router.push({
    path: ROUTE.COMPONENTS,
    query,
  })
}
