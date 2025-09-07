export interface Props {
  exclude?: string[]
}

/**
 * 菜单类型
 */
export enum MenuType {
  /** 跳转 */
  JUMP = 'jump',
  /** 链接 */
  LINK = 'link',
  /** 当前页面打开链接 */
  CURRENT_LINK = 'current_link',
}
