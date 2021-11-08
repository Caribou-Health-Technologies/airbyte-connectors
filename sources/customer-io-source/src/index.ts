import {AxiosInstance} from 'axios';
import {Command} from 'commander';
import {
  AirbyteConfig,
  AirbyteLogger,
  AirbyteSourceBase,
  AirbyteSourceRunner,
  AirbyteSpec,
  AirbyteStreamBase,
} from 'faros-airbyte-cdk';
import VError from 'verror';

import {CustomerIO, CustomerIOConfig} from './customer-io/customer-io';
import {CampaignActions, Campaigns, Newsletters} from './streams';

/** The main entry point. */
export function mainCommand(): Command {
  const logger = new AirbyteLogger();
  const source = new CustomerIOSource(logger);
  return new AirbyteSourceRunner(logger, source).mainCommand();
}

/** Customer.io source implementation. */
export class CustomerIOSource extends AirbyteSourceBase {
  constructor(logger: AirbyteLogger, private readonly axios?: AxiosInstance) {
    super(logger);
  }

  async spec(): Promise<AirbyteSpec> {
    return new AirbyteSpec(require('../resources/spec.json'));
  }

  async checkConnection(config: AirbyteConfig): Promise<[boolean, VError]> {
    try {
      const customerIO = CustomerIO.instance(
        config as CustomerIOConfig,
        this.axios
      );
      await customerIO.checkConnection();
    } catch (err: any) {
      return [false, err];
    }
    return [true, undefined];
  }

  streams(config: AirbyteConfig): AirbyteStreamBase[] {
    return [
      new Campaigns(this.logger, config as CustomerIOConfig, this.axios),
      new CampaignActions(this.logger, config as CustomerIOConfig, this.axios),
      new Newsletters(this.logger, config as CustomerIOConfig, this.axios),
    ];
  }
}
