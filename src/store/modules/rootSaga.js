import { all } from 'redux-saga/effects';

import recipe from './recipe/sagas';

export default function* rootSaga() {
  return yield all([recipe]);
}
