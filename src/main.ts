import { SelfServe } from "./lib/selfServe";

export let selfServeInstance: SelfServe | null = null;

export async function init() {
  window.Webflow ||= [];
  window.Webflow.push(() => {
    selfServeInstance = new SelfServe();
  });
}

declare global {
  interface Window {
    Webflow: any[];
  }
}
