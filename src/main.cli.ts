import 'reflect-metadata';
import {bootstrapCliRegistry} from './cli/bootstrap-CLI';

const registry = bootstrapCliRegistry();

await registry.processCommand(process.argv);
