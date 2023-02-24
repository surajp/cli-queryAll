/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfError } from '@salesforce/core';
import { AsyncParser } from '@json2csv/node';
import { AnyJson } from '@salesforce/ts-types';
import { flatten } from 'flat';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('queryAll', 'queryAll');

export default class Org extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  public static args = [{ name: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    query: flags.string({
      char: 'q',
      description: messages.getMessage('queryFlagDescription')
    }),
    resultformat: flags.string({
      char: 'r',
      description: messages.getMessage('resultFormatDescription')
    })
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const query = (this.flags.query || 'world') as string;

    // this.org is guaranteed because requiresUsername=true, as opposed to supportsUsername
    const conn = this.org.getConnection();
    // const query = 'Select Name, TrialExpirationDate from Organization';

    const result = await conn.query(query, { autoFetch: true, scanAll: true });

    // Organization will always return one result, but this is an example of throwing an error
    // The output and --json will automatically be handled for you.
    if (!result.records || result.records.length <= 0) {
      throw new SfError(messages.getMessage('errorNoOrgResults', [this.org.getOrgId()]));
    }

    if (this.flags.resultformat === 'csv') {
      let records = result.records.map((r) =>
        Object.fromEntries(Object.entries(flatten(r)).filter((e) => !e[1] || e[0].indexOf('attributes')==-1))
      );
      const opts = {includeEmptyRows: true};
      const transformOpts = {};
      const asyncOpts = {};
      const parser = new AsyncParser(opts, transformOpts, asyncOpts);
      // parser.parse(records).pipe(process.stdout);
      this.ux.log(await parser.parse(records).promise());
    } else {
      this.ux.log(JSON.stringify(result.records));
    }

    // Organization always only returns one result

    // this.ux.log(result.records);

    // Return an object to be displayed with --json
    return result;
  }

}
