import { fireEvent, render } from '@testing-library/react-native';
import { Share } from 'react-native';

import { buildMoneyReminderMessage, useCheckup } from '@/features/checkup';
import { useSeniorMode, useTrustedContact } from '@/features/family';

import CheckupScreen from '../app/checkup';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { useRouter } = require('expo-router') as { useRouter: jest.Mock };

beforeEach(() => {
  jest.clearAllMocks();
  useRouter.mockReturnValue({ push: mockPush });
  useCheckup.getState().reset();
  useTrustedContact.getState().clear();
  useSeniorMode.getState().setSimpleMode(false);
});

describe('CheckupScreen', () => {
  it('affiche l’intro, le bandeau et les 5 items essentiels', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText(/Faisons le point/)).toBeTruthy();
    expect(screen.getByText('Premiers pas')).toBeTruthy();
    expect(screen.getByText(/Ai-je un proche de confiance/)).toBeTruthy();
    expect(screen.getByText(/donner un code reçu par SMS/)).toBeTruthy();
    expect(screen.getByText(/appel « banque » urgent/)).toBeTruthy();
    expect(screen.getByText(/vrais numéros de ma banque/)).toBeTruthy();
    expect(screen.getByText(/Mes proches savent-ils/)).toBeTruthy();
  });

  it('n’affiche jamais de pourcentage ni le mot « score »', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.queryByText(/score/i)).toBeNull();
  });

  it('date le passage (markReviewed) au montage', async () => {
    expect(useCheckup.getState().lastReviewedAt).toBeNull();
    await render(<CheckupScreen />);
    expect(useCheckup.getState().lastReviewedAt).not.toBeNull();
  });

  it('compte les protections en place sans proche configuré', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('0 protection en place sur 5')).toBeTruthy();
    expect(screen.getByLabelText('Configurer mon proche')).toBeTruthy();
  });

  it('reflète le proche configuré (item auto en place) dans le décompte', async () => {
    useTrustedContact.getState().save({ name: 'Adam', channel: 'phone', value: '0600000000' });
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('1 protection en place sur 5')).toBeTruthy();
    expect(screen.queryByLabelText('Configurer mon proche')).toBeNull();
  });

  it('monte le niveau quand des items déclaratifs sont confirmés', async () => {
    useTrustedContact.getState().save({ name: 'Adam', channel: 'phone', value: '0600000000' });
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().confirm('appel-urgent');
    useCheckup.getState().confirm('numeros-officiels');
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('4 protections en place sur 5')).toBeTruthy();
    expect(screen.getByText('Bien protégé')).toBeTruthy();
  });

  it('partage le rappel générique via la feuille système, sans cocher l’item', async () => {
    const shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    const screen = await render(<CheckupScreen />);
    await fireEvent.press(screen.getByLabelText('Leur envoyer un rappel'));
    expect(shareSpy).toHaveBeenCalledWith({ message: buildMoneyReminderMessage() });
    // Le partage ne coche pas l'item : il reste « à renforcer ».
    expect(useCheckup.getState().confirmed['proches-argent']).toBeUndefined();
    shareSpy.mockRestore();
  });
});
