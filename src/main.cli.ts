import {bootstrapCliRegistry} from './cli/bootstrapCli.js';

const registry = bootstrapCliRegistry();

await registry.processCommand(process.argv);
