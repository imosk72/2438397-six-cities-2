import 'reflect-metadata';
import {bootstrapCliRegistry} from './cli/bootstrap-CLI.js';

const registry = bootstrapCliRegistry();

await registry.processCommand(process.argv);
