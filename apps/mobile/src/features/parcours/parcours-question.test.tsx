import { fireEvent, render } from '@testing-library/react-native';

import { ParcoursQuestionView } from './parcours-question';
import type { ParcoursQuestion } from './types';

const QUESTION: ParcoursQuestion = {
  id: 'qui',
  title: 'Qui vous demande ce code ?',
  options: [
    { id: 'banque', label: 'Ma banque', weight: 0 },
    { id: 'proche', label: 'Un proche', weight: 0 },
  ],
};

// RNTL v14 : render() est asynchrone.
describe('ParcoursQuestionView', () => {
  it('affiche la progression et le titre de la question', async () => {
    const view = await render(
      <ParcoursQuestionView question={QUESTION} index={1} total={5} onAnswer={jest.fn()} />,
    );
    expect(view.getByText('Question 2 sur 5')).toBeTruthy();
    expect(view.getByText('Qui vous demande ce code ?')).toBeTruthy();
  });

  it('appelle onAnswer avec l’identifiant de l’option pressée', async () => {
    const onAnswer = jest.fn();
    const view = await render(
      <ParcoursQuestionView question={QUESTION} index={0} total={5} onAnswer={onAnswer} />,
    );
    await fireEvent.press(view.getByLabelText('Un proche'));
    expect(onAnswer).toHaveBeenCalledWith('proche');
  });

  it('n’affiche pas de bouton « Précédent » sans onBack', async () => {
    const view = await render(
      <ParcoursQuestionView question={QUESTION} index={0} total={5} onAnswer={jest.fn()} />,
    );
    expect(view.queryByLabelText('Revenir à la question précédente')).toBeNull();
  });

  it('affiche « Précédent » et le déclenche quand onBack est fourni', async () => {
    const onBack = jest.fn();
    const view = await render(
      <ParcoursQuestionView
        question={QUESTION}
        index={2}
        total={5}
        onAnswer={jest.fn()}
        onBack={onBack}
      />,
    );
    await fireEvent.press(view.getByLabelText('Revenir à la question précédente'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

const HINT = 'Faites défiler pour voir les autres réponses';

describe('ParcoursQuestionView — repère de défilement', () => {
  function renderView(): ReturnType<typeof render> {
    return render(
      <ParcoursQuestionView question={QUESTION} index={0} total={5} onAnswer={jest.fn()} />,
    );
  }

  it('affiche le repère quand les réponses dépassent l’écran', async () => {
    const view = await renderView();
    const scroll = view.getByTestId('parcours-scroll');
    await fireEvent(scroll, 'layout', { nativeEvent: { layout: { height: 200, width: 0, x: 0, y: 0 } } });
    await fireEvent(scroll, 'contentSizeChange', 0, 800);
    expect(view.getByText(HINT)).toBeTruthy();
  });

  it('ne montre pas le repère quand tout tient à l’écran', async () => {
    const view = await renderView();
    const scroll = view.getByTestId('parcours-scroll');
    await fireEvent(scroll, 'layout', { nativeEvent: { layout: { height: 800, width: 0, x: 0, y: 0 } } });
    await fireEvent(scroll, 'contentSizeChange', 0, 300);
    expect(view.queryByText(HINT)).toBeNull();
  });

  it('masque le repère une fois arrivé en bas de liste', async () => {
    const view = await renderView();
    const scroll = view.getByTestId('parcours-scroll');
    await fireEvent(scroll, 'layout', { nativeEvent: { layout: { height: 200, width: 0, x: 0, y: 0 } } });
    await fireEvent(scroll, 'contentSizeChange', 0, 800);
    expect(view.getByText(HINT)).toBeTruthy();
    await fireEvent.scroll(scroll, {
      nativeEvent: {
        contentOffset: { y: 800 },
        contentSize: { height: 800 },
        layoutMeasurement: { height: 200 },
      },
    });
    expect(view.queryByText(HINT)).toBeNull();
  });
});
