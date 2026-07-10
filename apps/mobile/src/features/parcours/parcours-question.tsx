import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '@/lib/theme';

import type { ParcoursOption, ParcoursQuestion } from './types';

interface ParcoursQuestionViewProps {
  readonly question: ParcoursQuestion;
  readonly index: number;
  readonly total: number;
  readonly onAnswer: (optionId: string) => void;
}

/**
 * Une question du parcours : une seule question à l'écran, de grandes réponses
 * faciles à toucher, un fil d'avancement discret. Pensé pour être utilisable
 * sans savoir qu'on est face à une arnaque.
 */
export function ParcoursQuestionView({
  question,
  index,
  total,
  onAnswer,
}: ParcoursQuestionViewProps): ReactElement {
  return (
    <ScrollView
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
      accessibilityLabel={`Question ${String(index + 1)} sur ${String(total)}`}
    >
      <Text style={styles.progress}>
        Question {index + 1} sur {total}
      </Text>
      <Text style={styles.title}>{question.title}</Text>
      {question.help !== undefined ? <Text style={styles.help}>{question.help}</Text> : null}

      <View style={styles.options}>
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            onPress={() => {
              onAnswer(option.id);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function OptionButton({
  option,
  onPress,
}: {
  readonly option: ParcoursOption;
  readonly onPress: () => void;
}): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={option.label}
      onPress={onPress}
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
    >
      {option.icon !== undefined ? (
        <View style={styles.optionIcon}>
          <Ionicons name={option.icon} size={22} color={palette.laiton} />
        </View>
      ) : null}
      <Text style={styles.optionLabel}>{option.label}</Text>
      <Ionicons name="chevron-forward" size={20} color={palette.texteMuet} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  progress: {
    ...type.label,
    color: palette.laiton,
  },
  title: {
    ...type.screenTitle,
    fontSize: 26,
    lineHeight: 36,
  },
  help: {
    ...type.bodySecondary,
  },
  options: {
    gap: spacing.m,
    marginTop: spacing.s,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET + 8,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
  },
  optionPressed: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: palette.laitonFilet,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
});
