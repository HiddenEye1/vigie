# VISION — Vigie

## Le système nerveux anti-arnaque des familles

Document de vision produit. Ce n'est pas une spécification technique : c'est la destination. Le cahier des charges v1 décrit le premier pas ; ce document décrit où mène le chemin. Il sert de boussole (ne pas se disperser), de récit (jury, partenaires, entretiens) et de mémoire (capturer l'idée avant qu'elle s'évapore).

---

## 1\. Le constat qui change tout

Toutes les solutions anti-arnaque existantes — antivirus, filtres, et Vigie v1 elle-même — partagent le même angle mort : **elles attendent que la victime ait un doute.**

Or le drame de l'arnaque est exactement là : la victime n'a pas de doute au bon moment. Une personne âgée qui reçoit un faux SMS de sa banque ne se dit pas « je vais vérifier » — elle y croit, et elle clique. Le doute est un luxe de gens déjà méfiants. Une app qui attend le doute rate précisément ceux qu'elle veut sauver : ceux qui ne doutent pas.

C'est le plafond de verre de tout produit anti-arnaque « solo ».

## 2\. Le renversement

On ne peut pas donner du doute à quelqu'un qui n'en a pas. Mais on peut **déporter le doute vers quelqu'un qui, lui, en aurait eu.**

Dans chaque famille, il existe déjà cette personne : l'enfant, le petit-enfant, le proche « qui s'y connaît ». Aujourd'hui, ce rôle se joue informellement — « papa m'envoie une capture d'écran et me demande si c'est vrai ». Vigie n'invente pas ce comportement : **elle l'industrialise.**

La grande idée tient en une phrase : **Vigie n'attend plus que la victime doute — elle alerte le proche qui, lui, aurait douté.**

## 3\. Le produit à son paroxysme

**Vigie devient le système nerveux anti-arnaque d'une famille.** Pas une app qu'on ouvre. Un fil de vigilance invisible entre les générations.

On installe Vigie une fois chez un parent. À partir de là, quand un contenu suspect l'atteint — un message d'une campagne de phishing en cours, un appel d'un numéro signalé, un lien piégé — le proche désigné reçoit une alerte discrète : « Un message suspect est arrivé chez ton père. Il n'a rien fait pour l'instant. » Le proche peut appeler avant que le clic ait lieu. Il devient un pare-feu humain, à distance, sans avoir à être présent.

### Les deux côtés du fil

**Côté protégé (le senior)** — l'expérience reste celle de la v1, simple et rassurante, plus une présence bienveillante : « Léa veille avec vous. » Rien d'anxiogène, rien d'infantilisant. Le senior garde la main : il voit ce qui est partagé, il peut couper le fil à tout moment. **Ce n'est pas de la surveillance, c'est de la veille consentie.**

**Côté proche (l'aidant)** — un tableau de bord calme, silencieux la plupart du temps. Il ne montre PAS le contenu privé des messages (ce serait de l'espionnage) : il signale uniquement les événements à risque — « une campagne d'arnaque Ameli touche votre région, et votre mère y est potentiellement exposée », « un appel d'un numéro signalé frauduleux a eu lieu ». L'aidant agit en amont, humainement : un coup de fil, un mot.

### La ligne rouge, non négociable

Le fil entre « veiller sur un proche » (amour) et « surveiller un proche » (violation) est mince. Tout le design doit être obsédé par : le **consentement explicite et révocable** du senior ; la **transparence totale** (le protégé voit toujours ce que l'aidant voit) ; le **minimum d'intrusion** (des signaux de risque, jamais le contenu intime). Une seule dérive vers l'espionnage détruit la confiance, qui est le seul actif réel d'une app anti-arnaque. Ce principe prime sur toute fonctionnalité.

## 4\. Pourquoi c'est un banger, pas une feature

**Ça résout le vrai problème.** Le transfert de vigilance intergénérationnel s'attaque à la cause (l'absence de doute chez la cible), pas au symptôme.

**Ça retourne la logique d'installation.** Aujourd'hui, pour protéger un senior, il faut qu'un senior installe, comprenne et pense à ouvrir l'app — trois obstacles énormes. Ici, celui qui installe (le proche, à l'aise, motivé par l'amour et l'inquiétude) n'est pas celui qui est protégé. Les trois obstacles tombent d'un coup.

**Le moteur émotionnel change de nature.** Plus « protège-toi » (personne ne se croit vulnérable), mais « protège ta mère ». Ça se partage tout seul dans les groupes familiaux. Chaque installation en déclenche d'autres : « installe-le aussi chez tes parents ».

**Ça crée un fossé infranchissable.** Une app de vérification, n'importe qui la recopie demain. Un réseau familial de vigilance — avec la confiance et les habitudes installées dans des milliers de foyers — est increvable. Plus il y a de familles connectées, plus les campagnes émergentes sont détectées vite (« 200 familles ont signalé ce faux SMS ce matin »), meilleure est la protection, plus les gens restent. **C'est l'effet réseau — le seul vrai rempart contre les copieurs.**

## 5\. La séquence (le solo est le cheval de Troie)

Le vérificateur solo de la v1 **n'est pas le produit final — c'est la porte d'entrée.**

- **Le hameçon** : le vérificateur solo, gratuit, viral, sans friction. Il fait entrer des « proches inquiets » qui l'utilisent d'abord pour eux. Alimenté par du contenu (vidéos de décorticage d'arnaques réelles) et le partage des verdicts.  
- **La bascule** : une fois l'utilisateur à l'intérieur et convaincu — « et si vous protégiez votre mère avec ça ? ». C'est la waitlist « Bouclier famille » qui existe DÉJÀ dans la v1 : elle n'était pas une feature secondaire, elle était la première marche vers le cœur du produit.  
- **Le cœur** : le réseau familial. Ce qui crée l'attachement, la rétention, l'effet réseau.  
- **L'infrastructure** : à grande échelle, le flux de signalements en temps réel devient une donnée précieuse pour les banques, assureurs, opérateurs (modèle B2B2C), et un partenariat possible avec les institutions (cybermalveillance.gouv.fr, France Victimes, associations de seniors). L'app grand public devient le capteur ; la donnée agrégée devient le produit.

## 6\. Les obstacles, assumés

Une vision honnête nomme son prix.

- **Technique** : capter « un message suspect est arrivé » sur le téléphone d'un tiers se heurte aux restrictions fortes d'iOS et d'Android sur l'accès aux SMS, appels et mails. C'est le mur qui décourage les autres — donc celui qui protège Vigie si elle le franchit, même partiellement (extensions de filtrage, transfert à l'initiative du protégé, etc.).  
- **Éthique** : la ligne veille/surveillance (§3). Design consentement-first, ou rien.  
- **Confiance** : ironie d'une app anti-arnaque, elle doit être irréprochable — RGPD exemplaire, traitement local au maximum, transparence radicale. La confiance se gagne lentement et se perd en une fois.  
- **Maturité** : le familial n'a de sens qu'APRÈS que le solo ait prouvé sa valeur auprès de vrais utilisateurs. Construire le familial sur une v1 non validée serait bâtir un étage sur des fondations jamais inspectées.

## 7\. Ce que ça valide, tout de suite, sur le terrain

Cette vision n'est pas déconnectée du travail immédiat — elle lui donne un sens. Les trois prochaines actions réelles la nourrissent directement :

- **Dev build EAS** → l'app devient réelle, testable dans la main.  
- **Corpus élargi de vraies arnaques** → le moteur de détection, socle de tout, devient fiable.  
- **Test avec un vrai senior** → LE test qui validera ou tuera le pari familial. Observer un proche utiliser l'app, sans aide, dira si le fil intergénérationnel est une intuition juste ou un fantasme de développeur. **La vision se nourrit du terrain, elle ne le remplace pas.**

---

## En une phrase

**Vigie protège les familles contre l'arnaque — en commençant par un vérificateur que chacun installe pour soi, pour finir par un fil de vigilance qui relie les générations.**  
