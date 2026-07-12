import { fireEvent, render } from '@testing-library/react-native';

import { CheckupHomeCard } from './checkup-home-card';

describe('CheckupHomeCard', () => {
  it('variante « never » : invite à faire le point, sans jauge chiffrée', async () => {
    const screen = await render(
      <CheckupHomeCard reminder="never" inPlaceCount={0} total={4} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Faites le point sur votre protection')).toBeTruthy();
    expect(screen.queryByText(/protection en place sur/)).toBeNull();
  });

  it('variante « recent » : montre l’avancement', async () => {
    const screen = await render(
      <CheckupHomeCard reminder="recent" inPlaceCount={2} total={4} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Votre bouclier')).toBeTruthy();
    expect(screen.getByText('2 protections en place sur 4')).toBeTruthy();
  });

  it('variante « due » : propose de refaire le point', async () => {
    const screen = await render(
      <CheckupHomeCard reminder="due" inPlaceCount={1} total={4} onPress={jest.fn()} />,
    );
    expect(screen.getByText('Envie de refaire le point ?')).toBeTruthy();
    expect(screen.getByText('1 protection en place sur 4')).toBeTruthy();
  });

  it('n’affiche jamais de pourcentage ni le mot « score »', async () => {
    const screen = await render(
      <CheckupHomeCard reminder="recent" inPlaceCount={3} total={4} onPress={jest.fn()} />,
    );
    expect(screen.queryByText(/%/)).toBeNull();
    expect(screen.queryByText(/score/i)).toBeNull();
  });

  it('ouvre le bilan au tap', async () => {
    const onPress = jest.fn();
    const screen = await render(
      <CheckupHomeCard reminder="never" inPlaceCount={0} total={4} onPress={onPress} />,
    );
    await fireEvent.press(screen.getByLabelText('Check-up sécurité'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
