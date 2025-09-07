import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  transformerDirectives,
} from 'unocss'
// import presetUno from '@unocss/preset-uno'
// import presetWind3 from '@unocss/preset-wind3';

export default defineConfig({
  presets: [
    presetWind3(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  transformers: [transformerDirectives()],
  shortcuts: {
    'title1-sem': 'text-32px lh-34px Semibold',
    'title2-sem': 'text-28px lh-36px Semibold',
    'title3-sem': 'text-24px lh-32px Semibold',
    'title4-sem': 'text-20px lh-28px Semibold',
    'text1-reg': 'text-28px lh-36px Regular',
    'text2-reg': 'text-24px lh-32px Regular',
    'text3-reg': 'text-20px lh-28px Regular',
    'text4-reg': 'text-18px lh-26px Regular',
    'text5-reg': 'text-16px lh-24px Regular',
    'text4-sem': 'text-18px lh-26px Semibold',
    'text5-sem': 'text-16px lh-24px Semibold',
    'text6-reg': 'text-14px lh-22px Regular',
    'text6-sem': 'text-14px lh-22px Semibold',
    'caption1-sem': 'text-12px lh-16px Semibold',
    'caption2-sem': 'text-10px lh-12px Semibold',
    'caption1-reg': 'text-12px lh-16px Regular',
    'caption2-reg': 'text-10px lh-12px Regular',
    // 模块容器的左右响应式边距
    'section-container': 'px-32px <xl:(px-16px)',
    // 模块容器的上下响应式边距
    'section-inner': 'py-120px <lg:py-60px',
  },
  rules: [
    ['Semibold', { 'font-weight': '600' }],
    ['Regular', { 'font-weight': '400' }],
    ['Medium', { 'font-weight': '500' }],
    ['shadow-20', { 'box-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.02)' }],
    ['shadow-80', { 'box-shadow': '0px 0px 8px 0px rgba(0, 0, 0, 0.08)' }],
    ['shadow-success-50', { 'box-shadow': '0px 0px 8px 0px rgba(12, 189, 106, 0.5)' }],
    ['shadow-error-50', { 'box-shadow': '0px 0px 8px 0px rgba(245, 69, 69, 0.5)' }],
    [/^text-black-(\d+)$/, ([, d]) => ({ color: `rgba(0, 0, 0, ${Number(d) / 100})` })],
    [/^text-white-(\d+)$/, ([, d]) => ({ color: `rgba(255, 255, 255, ${Number(d) / 100})` })],
    [/^op-(\d+)$/, ([, d]) => ({ opacity: `${Number(d) / 100}` })],
  ],
  theme: {
    fontFamily: {
      Space_Grotesk: 'Space Grotesk',
    },
    colors: {
      offgray: 'rgba(75 83 97, 1)', // border 颜色
      accent: {
        blue: '#0056ea', // 可点击/标题颜色
      },
      primary: {
        normal: 'var(--ncform-pro-color-primary)',
        press: '#089659',
        disable: '#BBF0D0',
        success: '#EBFFF2',
        gray: '#fafbfc',
      },
      state: {
        success: '#0CBD6A',
        alert: '#FFA338',
        info: '#3089F0',
        error: '#F54545',
        disable: 'rgba(0,0,0,0.24)',
        inactive: 'rgba(0,0,0,0.08)',
      },
      line: {
        divider: 'rgba(0,0,0,0.08)',
        border: 'rgba(0,0,0,0.16)',
        activate: 'rgba(0,0,0,0.88)',
      },
      icon: {
        schematic: 'rgba(0,0,0,0.24)',
        function: 'rgba(0,0,0,0.64)',
        primary: 'rgba(0,0,0,0.88)',
        'white-schematic': 'rgba(0,0,0,0.4)',
        'white-function': 'rgba(255, 255, 255, 0.64)',
        'white-primary': 'rgba(0,0,0,0.24)',
      },
      bg: {
        white: '#FFFFFF',
        grey: '#F5F5F5',
        mask: 'rgba(0,0,0,0.72)',
        alert: '#FFFAED',
        error: '#FFF4F2',
        success: '#EBFFF2',
      },
      text: {
        main: 'var(--docs-color-text-primary)',
        dark: 'var(--color-text-dark-main)',
        disable: 'rgba(0,0,0,0.24)',
        auxiliary: 'rgba(0,0,0,0.4)',
        docsPrimary: 'var(--docs-color-text-primary)',
        docsTitle: 'var(--docs-color-text-title)',
        'white-info': 'rgba(0,0,0,0.4)',
        'white-auxiliary': 'rgba(255,255,255,0.64)',
        'white-title': '#FFFFFF',
      },
      fixed: {
        white: '#FFFFFF',
      },
      fill: {
        press: 'rgba(0,0,0,0.08)',
        'press-bt': 'rgba(0,0,0,0.16)',
      },
    },
  },
})
