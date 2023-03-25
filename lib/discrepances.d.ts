export type Opts = {
    showContext: boolean
    duckTyping: boolean
}
export class DiscrepancesTester<T>{}
export function showAndThrow<T>(obtained:T, expected:T, opts?: object):void
export function nestedObject<T>(obtained:T, expected:T, opts?: object):object
export function flatten     <T>(obtained:T, expected:T, opts?: object):object
export function test<T>(testFun:(value:T)=>boolean): DiscrepancesTester<T>

