import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { useState } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, spacing, type } from '@/lib/theme';

import { ChoiceButton } from './choice-button';
import { ProgressBar } from './progress-bar';
import type { ParcoursQuestion } from './types';

interface ParcoursQuestionViewProps {
  readonly question: ParcoursQuestion;
  readonly index: number;
  readonly total: number;
  readonly onAnswer: (optionId: string) => void;
  /** Revenir à la question précédente. Absent sur la première question. */
  readonly onBack?: (() => void) | undefined;
  /** Mode senior : typographie et cibles agrandies. */
  readonly large?: boolean;
}

/**
 * Une question du parcours : une seule question à l'écran, une barre de
 * progression, un retour possible, et de grandes réponses faciles à toucher.
 * Pensé pour donner l'impression d'être accompagné, pas interrogé.
 */
export function ParcoursQuestionView({
  question,
  index,
  total,
  onAnswer,
  onBack,
  large = false,
}: ParcoursQuestionViewProps): ReactElement {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [atBottom, setAtBottom] = useState(false);

  // Repère « faire défiler » : uniquement si les réponses dépassent l'écran et
  // qu'on n'est pas encore en bas de liste.
  const overflows = contentHeight > viewportHeight + 8;
  const showScrollHint = overflows && !atBottom;

  const onLayout = (event: LayoutChangeEvent): void => {
    setViewportHeight(event.nativeEvent.layout.height);
  };
  const onContentSizeChange = (_width: number, height: number): void => {
    setContentHeight(height);
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    setAtBottom(contentOffset.y + layoutMeasurement.height >= contentSize.height - 24);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        testID="parcours-scroll"
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        onLayout={onLayout}
        onContentSizeChange={onContentSizeChange}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {onBack !== undefined ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Revenir à la question précédente"
            onPress={onBack}
            hitSlop={8}
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={20} color={palette.texteDoux} />
            <Text style={styles.backLabel}>Précédent</Text>
          </Pressable>
        ) : null}

        <ProgressBar current={index + 1} total={total} />
        <Text style={styles.progress}>{`Question ${String(index + 1)} sur ${String(total)}`}</Text>

        <Text style={[styles.title, large && styles.titleLarge]}>{question.title}</Text>
        {question.help !== undefined ? <Text style={styles.help}>{question.help}</Text> : null}

        <View style={styles.options}>
          {question.options.map((option) => (
            <ChoiceButton
              key={option.id}
              label={option.label}
              icon={option.icon}
              large={large}
              onPress={() => {
                onAnswer(option.id);
              }}
            />
          ))}
        </View>
      </ScrollView>

      {showScrollHint ? (
        <View style={styles.scrollHint} pointerEvents="none">
          <Ionicons name="chevron-down" size={16} color={palette.surFeuSombre} />
          <Text style={styles.scrollHintText}>Faites défiler pour voir les autres réponses</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  body: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xxl,
  },
  scrollHint: {
    position: 'absolute',
    bottom: spacing.m,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.l,
    borderRadius: radius.pill,
    backgroundColor: palette.laiton,
  },
  scrollHintText: {
    ...type.label,
    color: palette.surFeuSombre,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 40,
  },
  backLabel: {
    ...type.bodySecondary,
    fontFamily: fonts.textSemiBold,
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
  titleLarge: {
    fontSize: 30,
    lineHeight: 40,
  },
  help: {
    ...type.bodySecondary,
  },
  options: {
    gap: spacing.m,
    marginTop: spacing.s,
  },
});
