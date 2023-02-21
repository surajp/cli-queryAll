import { expect, test } from '@salesforce/command/lib/test';
import { ensureJsonMap, ensureString } from '@salesforce/ts-types';

describe('queryAll', () => {
  test
    .withOrg({ username: 'test@org.com' }, true)
    .withConnectionRequest((request) => {
      const requestMap = ensureJsonMap(request);
      if (/queryAll/.exec(ensureString(requestMap.url))) {
        return Promise.resolve({
          records: [
            {
              Name: 'Super Awesome Org',
              TrialExpirationDate: '2018-03-20T23:24:11.000+0000',
            },
          ],
        });
      }
      return Promise.resolve({ records: [] });
    })
    .stdout()
    .command(['queryAll', '--targetusername', 'test@org.com','--resultformat','csv'])
    .it('runs queryAll --targetusername test@org.com --resultformat csv', (ctx) => {
      expect(ctx.stdout).to.contain(
        '"Super Awesome Org","2018-03-20T23:24:11.000+0000"'
      );
    });
});
