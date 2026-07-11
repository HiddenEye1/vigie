import { getTextRecognizer, OcrUnavailableError, unavailableRecognizer } from './text-recognizer';

describe('text-recognizer', () => {
  it('le fournisseur indisponible signale qu’il ne l’est pas', () => {
    expect(unavailableRecognizer.available).toBe(false);
  });

  it('le fournisseur indisponible rejette explicitement la reconnaissance', async () => {
    await expect(unavailableRecognizer.recognize({ uri: 'file://x.jpg' })).rejects.toBeInstanceOf(
      OcrUnavailableError,
    );
  });

  it('getTextRecognizer renvoie un fournisseur indisponible pour l’instant', () => {
    expect(getTextRecognizer().available).toBe(false);
  });
});
