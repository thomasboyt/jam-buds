// XXX: This fixes an incompatibility with expect@24 and mocha, since expect now
// includes jest types which conflict with mocha's. Theoretically there is
// supposed to be a fix for this in expect@24.9.0 but it doesn't seem to be
// working, so I've copied this fix from
// https://stackoverflow.com/questions/56181799/how-to-use-mocha-and-jest-with-typescript-without-conflicts
import * as mocha from 'mocha';

declare module '@jest/types/build/Global' {
  interface DescribeBase extends mocha.SuiteFunction {}
  interface ItBase extends mocha.TestFunction {}
}
