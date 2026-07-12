import { render } from '@testing-library/react-native';

import { useCheckup } from '@/features/checkup';
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
  it('affiche l’intro, le bandeau et les 4 items essentiels', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText(/Faisons le point/)).toBeTruthy();
    expect(screen.getByText('Premiers pas')).toBeTruthy();
    expect(screen.getByText(/Ai-je un proche de confiance/)).toBeTruthy();
    expect(screen.getByText(/donner un code reçu par SMS/)).toBeTruthy();
    expect(screen.getByText(/appel « banque » urgent/)).toBeTruthy();
    expect(screen.getByText(/vrais numéros de ma banque/)).toBeTruthy();
  });

  it('n’affiche jamais de pourcentage ni le mot « score »', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.queryByText(/score/i)).toBeNull();
  });

  it('compte les protections en place sans proche configuré', async () => {
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('0 protection en place sur 4')).toBeTruthy();
    expect(screen.getByLabelText('Configurer mon proche')).toBeTruthy();
  });

  it('reflète le proche configuré (item auto en place) dans le décompte', async () => {
    useTrustedContact.getState().save({ name: 'Adam', channel: 'phone', value: '0600000000' });
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('1 protection en place sur 4')).toBeTruthy();
    expect(screen.queryByLabelText('Configurer mon proche')).toBeNull();
  });

  it('monte le niveau quand des items déclaratifs sont confirmés', async () => {
    useTrustedContact.getState().save({ name: 'Adam', channel: 'phone', value: '0600000000' });
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().confirm('appel-urgent');
    const screen = await render(<CheckupScreen />);
    expect(screen.getByText('3 protections en place sur 4')).toBeTruthy();
    expect(screen.getByText('Bien protégé')).toBeTruthy();
  });
});
