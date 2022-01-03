export type AwaitedFunction<T extends (...args: any) => any> = Awaited<ReturnType<T>>
