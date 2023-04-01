import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponseTransformer,
  GenericAbortSignal,
} from "axios";

abstract class __AxiosRequestBuilder<C extends __AxiosRequestBuilder<any>> {
  constructor(
    private axios: AxiosInstance,
    private urlComponents: string[] = [],
    private requestConfig: AxiosRequestConfig = {}
  ) {}

  getAxios() {
    return this.axios;
  }

  getUrl() {
    return this.urlComponents.join("/");
  }

  getConfig() {
    return this.requestConfig;
  }

  $(component: string | number | Array<string | number>) {
    return new (this.constructor as { new (...args: any[]): C })(
      this.axios,
      [
        ...this.urlComponents,
        ...(Array.isArray(component) ? component.map(String) : [component.toString()]),
      ],
      this.requestConfig
    );
  }

  config(conf: AxiosRequestConfig) {
    this.requestConfig = { ...this.requestConfig, ...conf };
    return this;
  }

  headers(h: AxiosRequestConfig["headers"]) {
    return this.config({
      headers: h,
    });
  }

  params(p: object) {
    return this.config({
      params: p,
    });
  }

  transform(t: AxiosResponseTransformer) {
    return this.config({
      transformResponse: t,
    });
  }

  signal(s: GenericAbortSignal) {
    return this.config({
      signal: s,
    });
  }

  createSignal() {
    const controller = new AbortController();
    this.signal(controller.signal);
    return controller;
  }

  get<T>(params?: object) {
    return this.axios.get<T>(this.getUrl(), { ...this.requestConfig, params });
  }

  post<T>(data: unknown, params?: object) {
    return this.axios.post<T>(this.getUrl(), data, {
      ...this.requestConfig,
      params,
    });
  }

  put<T>(data: unknown, params?: object) {
    return this.axios.put<T>(this.getUrl(), data, {
      ...this.requestConfig,
      params,
    });
  }

  patch<T>(data: unknown, params?: object) {
    return this.axios.patch<T>(this.getUrl(), data, {
      ...this.requestConfig,
      params,
    });
  }

  delete<T>(params?: object) {
    return this.axios.delete<T>(this.getUrl(), {
      ...this.requestConfig,
      params,
    });
  }
}

const AxiosRequestBuilderProxy: ProxyHandler<AxiosRequestBuilder> = {
  get(target, prop, receiver) {
    if (prop in target) {
      return Reflect.get(target, prop, receiver);
    }
    if (typeof prop !== "string") {
      throw new TypeError("Property must be a string");
    }
    return target.$(prop);
  },
};

export class AxiosRequestBuilder extends __AxiosRequestBuilder<AxiosRequestBuilder> {
  /** @ts-ignore */
  [key: string]: AxiosRequestBuilder;

  constructor(
    axios: AxiosInstance,
    urlComponents: string[] = [],
    requestConfig: AxiosRequestConfig = {}
  ) {
    super(axios, urlComponents, requestConfig);
    return new Proxy(this, AxiosRequestBuilderProxy);
  }
}

export default AxiosRequestBuilder;
