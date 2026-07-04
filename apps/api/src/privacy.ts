/**
 * Politique de confidentialité (§9.5) — page statique servie par GET /privacy,
 * rédigée en français clair, sans jargon juridique inutile.
 */
export const PRIVACY_POLICY_HTML = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Vigie — Politique de confidentialité</title>
  <style>
    body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #0f172a;
           background: #ffffff; max-width: 720px; margin: 0 auto; padding: 24px; line-height: 1.7;
           font-size: 18px; }
    h1 { color: #1d4ed8; font-size: 28px; }
    h2 { font-size: 21px; margin-top: 32px; }
    ul { padding-left: 22px; }
    footer { margin-top: 40px; font-size: 15px; color: #334155; }
  </style>
</head>
<body>
  <h1>Politique de confidentialité de Vigie</h1>
  <p>
    Vigie est une application gratuite qui vous aide à repérer les arnaques en ligne.
    Elle a été conçue selon un principe simple : <strong>collecter le moins de données
    possible</strong>. Cette page explique, en français courant, ce que nous faisons
    — et surtout ce que nous ne faisons pas — avec vos informations.
  </p>

  <h2>Aucun compte, aucune identité</h2>
  <p>
    Vigie ne demande ni nom, ni adresse, ni numéro de téléphone, ni création de compte.
    Le seul identifiant utilisé est un numéro aléatoire et anonyme, créé sur votre
    téléphone à l'installation. Il ne permet pas de savoir qui vous êtes.
  </p>

  <h2>Les contenus que vous faites vérifier</h2>
  <p>
    Lorsque vous soumettez un message, une capture d'écran ou un lien, ce contenu est
    envoyé à notre serveur uniquement pour être analysé, puis <strong>immédiatement
    oublié</strong> :
  </p>
  <ul>
    <li>il n'est jamais enregistré dans une base de données ;</li>
    <li>les images sont traitées en mémoire et jamais écrites sur disque ;</li>
    <li>nos journaux techniques ne contiennent jamais le contenu analysé.</li>
  </ul>
  <p>
    L'analyse fait appel à un service d'intelligence artificielle (Anthropic), auquel le
    contenu est transmis dans le seul but de produire le verdict.
  </p>

  <h2>Votre historique reste sur votre téléphone</h2>
  <p>
    L'historique de vos vérifications est stocké uniquement sur votre appareil. Nous n'y
    avons pas accès. Vous pouvez l'effacer à tout moment depuis l'application
    (« Historique » → « Tout effacer », ou « Réglages » → « Supprimer toutes mes données »).
  </p>

  <h2>Ce que nous conservons</h2>
  <ul>
    <li>
      <strong>Statistiques anonymes</strong> : pour chaque analyse, nous gardons le type
      de contenu (texte, image ou lien), le verdict rendu, la catégorie détectée et le
      temps de réponse — jamais le contenu lui-même.
    </li>
    <li>
      <strong>Liste d'attente « Bouclier famille »</strong> : si vous laissez votre
      adresse e-mail, nous la conservons avec la date de votre consentement, uniquement
      pour vous prévenir du lancement. Vous pouvez demander sa suppression à tout moment.
    </li>
  </ul>

  <h2>Ce que nous ne faisons jamais</h2>
  <ul>
    <li>pas de revente ni de partage de données à des fins publicitaires ;</li>
    <li>pas d'outil de mesure d'audience tiers dans l'application ;</li>
    <li>pas d'accès à vos contacts, à votre position ou à votre micro ;</li>
    <li>accès à vos photos uniquement lorsque vous choisissez vous-même une capture à vérifier.</li>
  </ul>

  <h2>Vos droits</h2>
  <p>
    Conformément au Règlement général sur la protection des données (RGPD), vous pouvez
    demander l'accès, la rectification ou la suppression des données qui vous concernent
    (en pratique : votre e-mail de liste d'attente, seule donnée nominative que nous
    puissions détenir). Vous pouvez aussi saisir la CNIL (cnil.fr) si vous estimez que
    vos droits ne sont pas respectés.
  </p>

  <h2>Un doute, une question ?</h2>
  <p>
    Vigie est une aide à la décision, pas une garantie. En cas de doute sur un paiement,
    contactez directement votre banque. Pour toute question sur vos données, contactez
    l'éditeur de l'application via la fiche de l'app sur votre magasin d'applications.
  </p>

  <footer>Dernière mise à jour : juillet 2026 — Vigie v1</footer>
</body>
</html>`;
