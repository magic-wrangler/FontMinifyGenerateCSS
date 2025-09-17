import type { App, Directive, DirectiveBinding } from 'vue';

export const biReport = (path: string, params?: Record<string, any>) => {
  console.log(`### bi_report ### ${path}`, params || {});
};

/**
 * 写入指令 v-report 上报事件
 *
 * 类型
 * v-report.brow 页面曝光
 * v-report.click 点击事件
 * @param path 事件路径
 * @param params 事件参数
 *
 */

/**
 * Report directive value interface
 */
interface ReportDirectiveValue {
  path: string;
  params?: Record<string, any>;
}

// 定义指令
const reportDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, modifiers } = binding;

    // 处理不同类型的值
    const getReportData = (
      value: string | ReportDirectiveValue
    ): { path: string; params?: Record<string, any> } => {
      if (typeof value === 'string') {
        return { path: value };
      } else {
        return value as ReportDirectiveValue;
      }
    };

    // 页面曝光时上报
    if (modifiers.brow) {
      // 页面曝光时上报
      const { path, params } = getReportData(value);
      biReport(
        path,
        Object.assign(params || {}, {
          report_type: 'brow',
        })
      );
    }

    // 点击事件上报
    if (modifiers.click) {
      // 点击事件上报
      el.addEventListener('click', () => {
        const { path, params } = getReportData(value);
        biReport(
          path,
          Object.assign(params || {}, {
            report_type: 'click',
          })
        );
      });
    }
  },
};

// 导出指令注册函数
export const setupReportDirective = (app: App): void => {
  app.directive('report', reportDirective);
};
