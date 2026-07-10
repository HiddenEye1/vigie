import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { Pressable, Text } from 'react-native';

import type { RequestState } from './use-request';
import { useRequest } from './use-request';

function label(state: RequestState<number, string>): string {
  switch (state.status) {
    case 'idle':
      return 'idle';
    case 'loading':
      return 'loading';
    case 'success':
      return `success:${String(state.data)}`;
    case 'error':
      return `error:${state.error}`;
  }
}

function Harness({
  task,
  onSuccess,
}: {
  readonly task: () => Promise<number>;
  readonly onSuccess?: (data: number) => void;
}): ReactElement {
  const { state, run, reset } = useRequest<number, string, []>(task, {
    mapError: (error) => (error as Error).message,
    onSuccess,
  });
  return (
    <>
      <Text>{label(state)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="run"
        onPress={() => {
          void run();
        }}
      >
        <Text>Lancer</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="reset" onPress={reset}>
        <Text>Réinitialiser</Text>
      </Pressable>
    </>
  );
}

describe('useRequest', () => {
  it('démarre à idle', async () => {
    const view = await render(<Harness task={() => Promise.resolve(1)} />);
    expect(view.getByText('idle')).toBeTruthy();
  });

  it('passe par success et déclenche onSuccess', async () => {
    const onSuccess = jest.fn();
    const view = await render(<Harness task={() => Promise.resolve(42)} onSuccess={onSuccess} />);
    await fireEvent.press(view.getByLabelText('run'));
    await waitFor(() => {
      expect(view.getByText('success:42')).toBeTruthy();
    });
    expect(onSuccess).toHaveBeenCalledWith(42);
  });

  it('mappe l’erreur en cas d’échec', async () => {
    const onSuccess = jest.fn();
    const view = await render(
      <Harness task={() => Promise.reject(new Error('boom'))} onSuccess={onSuccess} />,
    );
    await fireEvent.press(view.getByLabelText('run'));
    await waitFor(() => {
      expect(view.getByText('error:boom')).toBeTruthy();
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('reset ramène à idle', async () => {
    const view = await render(<Harness task={() => Promise.resolve(1)} />);
    await fireEvent.press(view.getByLabelText('run'));
    await waitFor(() => {
      expect(view.getByText('success:1')).toBeTruthy();
    });
    await fireEvent.press(view.getByLabelText('reset'));
    expect(view.getByText('idle')).toBeTruthy();
  });
});
