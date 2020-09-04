export interface ResponseObject {
    rtn: number;
    errMsg?: string;
    data?: object;

}

export class CommonError implements ResponseObject{

    rtn: number;
    errMsg?: string;
    data?: object;
    constructor(code: ErrorCode, msg: string) {
        this.rtn = code;
        this.errMsg = msg;
        this.data = null;
    }


}

export enum ErrorCode {
    ERROR_INVALID_PARAM = 10000,
    ERROR_INVALID_CODE = 10001,
    ERROR_INVALID_USER = 10002,
    ERROR_INVALID_PASS = 10003
}
