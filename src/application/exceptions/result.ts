import { ResultError } from './result-error';
import { ResultSuccess } from './result-success';

export type IResult<S = undefined> = ResultError | ResultSuccess<S>;
