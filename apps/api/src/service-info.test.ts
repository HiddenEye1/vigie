import { describe, expect, it } from 'vitest';

import { getServiceInfo } from './service-info.js';

describe('getServiceInfo', () => {
  it('retourne les informations du service depuis le package partagé', () => {
    expect(getServiceInfo()).toEqual({ name: 'Vigie', apiVersion: 'v1' });
  });
});
