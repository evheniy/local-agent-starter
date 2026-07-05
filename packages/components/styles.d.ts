declare module '*.scss';
declare module '*.scss?inline' {
  const css: string;
  export default css;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
