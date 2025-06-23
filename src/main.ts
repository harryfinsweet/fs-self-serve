import { SelfServe } from "./lib/selfServe";

export let selfServeInstance: SelfServe | null = null;

export async function init() {
  selfServeInstance = new SelfServe();
  console.log(selfServeInstance);
}
