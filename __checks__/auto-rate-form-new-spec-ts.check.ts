/**
* This is a Checkly CLI BrowserCheck construct. To learn more, visit:
* - https://www.checklyhq.com/docs/cli/
* - https://www.checklyhq.com/docs/cli/constructs-reference/#browsercheck
*/

import { BrowserCheck, Frequency, RetryStrategyBuilder } from 'checkly/constructs'

new BrowserCheck('auto-rate-form-new-spec-ts', {
  name: 'auto_rate_form_new.spec.ts',
  activated: true,
  muted: false,
  shouldFail: false,
  runParallel: false,
  runtimeId: '2024.02',
  locations: ['us-east-1', 'eu-west-1'],
  tags: ['mac'],
  frequency: Frequency.EVERY_10M,
  environmentVariables: [],
  code: {
    entrypoint: './auto-rate-form-new-spec-ts.spec.ts',
  },
  retryStrategy: RetryStrategyBuilder.fixedStrategy({
    baseBackoffSeconds: 0,
    maxRetries: 1,
    maxDurationSeconds: 600,
    sameRegion: false,
  }),
})
