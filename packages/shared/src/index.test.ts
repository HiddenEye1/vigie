import { describe, expect, it } from 'vitest';

import { API_VERSION, APP_NAME } from './index.js';

describe('constantes partagées', () => {
  it('expose le nom du produit', () => {
    expect(APP_NAME).toBe('Vigie');
  });

  it('expose la version courante de l’API', () => {
    expect(API_VERSION).toBe('v1');
  });
});
