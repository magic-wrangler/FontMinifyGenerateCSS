// 转换地址： https://tooltt.com/json2typescript/
declare namespace Layout {
  /** 菜单 */
  interface Menu {
    /** 菜单名称 */
    name: string
    /** url */
    url?: string
    subMenu?: SubMenu[]
    type?: 'jump' | 'link' | string
  }
  /** nav信息 */
  interface Header {
    /** logo地址 */
    logoUrl: string
    /** 菜单 */
    menu: Menu[]
  }
  /** 子菜单 */
  interface SubMenu {
    /** 菜单名称 */
    name: string
    /** url */
    url: string
    /** 类型 */
    type?: 'jump' | 'link' | string
  }

  /** 底部信息 */
  interface Footer {
    /** logo地址 */
    logoUrl: string
    /** 菜单 */
    menu: Menu[]
    /** 版权信息 */
    copyright: string
  }

  interface RootObject {
    /** 导航栏信息 */
    header: Header
    /** 底部信息 */
    footer: Footer
  }
}
