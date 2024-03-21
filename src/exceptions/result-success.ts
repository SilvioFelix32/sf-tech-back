import { ResultStatus } from './result-status-enum';

export class ResultSuccess<T> {
  public readonly data: T;

  public readonly status: ResultStatus.SUCCESS = ResultStatus.SUCCESS;

  public constructor(result: T) {
    this.data = result;
  }
}
