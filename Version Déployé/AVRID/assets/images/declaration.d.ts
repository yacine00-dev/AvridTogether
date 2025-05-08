declare module "*.png";

declare module '*.jpg' {
  const content: any;
  export default content;
}