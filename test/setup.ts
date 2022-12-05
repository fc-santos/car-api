import { rm } from 'fs/promises';
import { join } from 'path';
import { getConnectionManager } from 'typeorm';

global.beforeEach(async () => {
  try {
    await rm(join(__dirname, '..', 'test.sqlite'));
  } catch (error) {}
});

global.afterEach(async () => {
  const connManager = getConnectionManager();
  if (connManager.has('default')) {
    await connManager.get().close();
  }
});
