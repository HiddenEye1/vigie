import { renderHook, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { useAdviceRequests, useTrustedContact } from '@/features/family';

import { useAskContact } from './use-ask-contact';

afterEach(() => {
  useTrustedContact.setState({ contact: null });
  useAdviceRequests.setState({ entries: [] });
  jest.restoreAllMocks();
});

describe('useAskContact', () => {
  it('enregistre une demande d’aide (sans verdict) après ouverture réussie du compositeur', async () => {
    useTrustedContact.setState({
      contact: { name: 'Adam', channel: 'phone', value: '0612345678' },
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    const { result } = await renderHook(() => useAskContact());
    result.current();

    await waitFor(() => {
      expect(useAdviceRequests.getState().entries).toHaveLength(1);
    });
    const entry = useAdviceRequests.getState().entries[0];
    expect(entry?.situation).toBe('aide');
    expect(entry?.contactFirstName).toBe('Adam');
    expect(entry?.verdict).toBeUndefined();
  });
});
