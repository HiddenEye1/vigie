import { useSeniorMode } from './senior-mode.store';

/** Le mode simplifié doit être opt-in et réversible à tout moment. */
describe('useSeniorMode — mode simplifié', () => {
  afterEach(() => {
    useSeniorMode.setState({ simpleMode: false });
  });

  it('est désactivé par défaut', () => {
    expect(useSeniorMode.getState().simpleMode).toBe(false);
  });

  it('bascule normal → simplifié → normal', () => {
    useSeniorMode.getState().setSimpleMode(true);
    expect(useSeniorMode.getState().simpleMode).toBe(true);

    useSeniorMode.getState().setSimpleMode(false);
    expect(useSeniorMode.getState().simpleMode).toBe(false);
  });
});
