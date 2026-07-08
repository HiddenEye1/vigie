import { useSettings } from './settings';

/** Le mode simplifié doit être opt-in et réversible à tout moment. */
describe('useSettings — mode simplifié', () => {
  afterEach(() => {
    useSettings.setState({ simpleMode: false });
  });

  it('est désactivé par défaut', () => {
    expect(useSettings.getState().simpleMode).toBe(false);
  });

  it('bascule normal → simplifié → normal', () => {
    useSettings.getState().setSimpleMode(true);
    expect(useSettings.getState().simpleMode).toBe(true);

    useSettings.getState().setSimpleMode(false);
    expect(useSettings.getState().simpleMode).toBe(false);
  });
});
