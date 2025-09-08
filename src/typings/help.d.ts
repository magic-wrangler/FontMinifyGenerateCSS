declare namespace Help {
  export interface RootObject {
    title: string;
    gettingStarted: GettingStarted;
    stepByStepGuide: StepByStepGuide;
    additionalResources: AdditionalResources;
  }

  export interface GettingStarted {
    title: string;
    desc: string;
  }

  export interface StepByStepGuide {
    title: string;
    stepList: StepList[];
  }

  export interface StepList {
    svg: string;
    title: string;
    desc: string;
  }

  export interface AdditionalResources {
    title: string;
    desc: string;
    stepList: StepList2[];
  }

  export interface StepList2 {
    svg: string;
    title: string;
  }
}
