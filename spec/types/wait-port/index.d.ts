interface Params {
  port: number;
  host?: string;
  output?: string;
  timeout?: number;
}

declare function waitPort(params: Params): Promise<boolean>;

declare module 'wait-port' {
  export = waitPort;
}
