export default class JsonResponse {
  private constructor(
    public readonly retcode: number,
    public readonly errMsg: string,
    public readonly data: any,
  ) {}

  static ok(data?: any) {
    return new JsonResponse(0, '', data);
  }

  static fail(retcode: number, errMsg = '') {
    return new JsonResponse(retcode, errMsg, null);
  }

  toJSON() {
    const { retcode, errMsg, data } = this;
    return JSON.stringify({
      retcode,
      errMsg,
      data,
    });
  }
}
