declare module 'discrepances'{
    function showAndThrow<T>(obtained:T, expected:T, opts?: object):void
    function nestedObject<T>(obtained:T, expected:T, opts?: object):object
    function flatten     <T>(obtained:T, expected:T, opts?: object):object
}

