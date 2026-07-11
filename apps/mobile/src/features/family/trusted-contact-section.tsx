import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { fonts, palette, radius, spacing, type } from '@/lib/theme';

import { useTrustedContact } from './contact.store';
import { detectChannel } from './messages';

interface TrustedContactSectionProps {
  /**
   * Lance l'assistant guidé de première configuration. Fourni par l'écran (qui
   * possède la navigation). Si absent, on retombe sur le formulaire inline —
   * rétro-compatibilité pour tout appelant qui ne câble pas d'assistant.
   */
  readonly onConfigure?: () => void;
}

/**
 * « Mon proche de confiance » (Bouclier famille).
 * Un seul contact, enregistré par le senior lui-même, stocké sur ce téléphone
 * uniquement, modifiable et supprimable à tout moment (consentement révocable).
 *
 * Sans proche : propose l'assistant guidé (`onConfigure`) plutôt que le
 * formulaire brut. Avec un proche : la carte + édition inline (Modifier/Retirer).
 */
export function TrustedContactSection({ onConfigure }: TrustedContactSectionProps = {}): ReactElement {
  const contact = useTrustedContact((state) => state.contact);
  const save = useTrustedContact((state) => state.save);
  const clear = useTrustedContact((state) => state.clear);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const channel = detectChannel(value);
  const canSave = name.trim().length > 0 && channel !== null;
  // Entrée guidée quand aucun proche n'est enregistré et qu'un assistant est câblé.
  const guidedEntry = contact === null && onConfigure !== undefined;
  const showForm = editing || (contact === null && onConfigure === undefined);

  const startEditing = (): void => {
    setName(contact?.name ?? '');
    setValue(contact?.value ?? '');
    setEditing(true);
  };

  const submit = (): void => {
    if (channel === null) {
      return;
    }
    save({ name: name.trim(), channel, value: value.trim() });
    setEditing(false);
    setName('');
    setValue('');
  };

  const confirmRemove = (): void => {
    Alert.alert(
      'Retirer ce proche ?',
      'Vigie ne proposera plus de lui envoyer vos vérifications. Vous pourrez l’enregistrer à nouveau quand vous voudrez.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            clear();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mon proche de confiance</Text>
      <Text style={styles.cardText}>
        Choisissez une personne en qui vous avez confiance. Depuis un résultat, vous pourrez lui
        envoyer l’avis de Vigie en un geste, pour lui demander ce qu’elle en pense.
      </Text>
      <Text style={styles.privacyNote}>
        Ce contact reste sur ce téléphone : il n’est jamais envoyé à nos serveurs. Rien ne part sans
        que vous l’envoyiez vous-même. Vous pouvez le retirer à tout moment.
      </Text>

      {guidedEntry ? (
        <PrimaryButton
          label="Configurer mon proche de confiance"
          icon="person-add"
          onPress={() => {
            onConfigure();
          }}
        />
      ) : showForm ? (
        <>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Son prénom (ex. Marie)"
            placeholderTextColor={palette.texteMuet}
            accessibilityLabel="Prénom du proche de confiance"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder="Son numéro ou son e-mail"
            placeholderTextColor={palette.texteMuet}
            accessibilityLabel="Numéro de téléphone ou adresse e-mail du proche"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="text"
          />
          <PrimaryButton
            label="Enregistrer ce proche"
            icon="person-add"
            disabled={!canSave}
            onPress={submit}
          />
          {contact !== null ? (
            <PrimaryButton
              label="Annuler"
              icon="close"
              variant="secondary"
              onPress={() => {
                setEditing(false);
              }}
            />
          ) : null}
        </>
      ) : contact !== null ? (
        <>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons
                name={contact.channel === 'email' ? 'mail-outline' : 'call-outline'}
                size={22}
                color={palette.laiton}
              />
            </View>
            <View style={styles.contactText}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactValue}>{contact.value}</Text>
            </View>
          </View>
          <PrimaryButton
            label="Modifier ce proche"
            icon="create"
            variant="secondary"
            onPress={startEditing}
          />
          <PrimaryButton
            label="Retirer ce proche"
            icon="person-remove"
            variant="secondary"
            onPress={confirmRemove}
          />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  cardTitle: {
    ...type.sectionTitle,
  },
  cardText: {
    ...type.body,
    color: palette.texteDoux,
  },
  privacyNote: {
    ...type.bodySecondary,
    color: palette.texteMuet,
  },
  input: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: palette.bordure,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    ...type.body,
    backgroundColor: palette.ardoiseHaute,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  contactValue: {
    ...type.bodySecondary,
    color: palette.texteDoux,
  },
});
