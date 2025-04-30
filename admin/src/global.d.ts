import axios from "axios";

declare module "*.less" {
  const style: any;
  export default style;
}
declare module "*.scss" {
  const style: any;
  export default style;
}

declare module "*.css";
declare module "*.less";
declare module "*.sass";
declare module "*.svg";
declare module "*.webp";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";
declare module "faker";

declare module "axios" {
  interface IAxios<D = null> {
    code: string;
    success: boolean;
    message: string;
    extra: D;
  }
  export interface AxiosResponse<T = any> extends IAxios<D> {}
}
