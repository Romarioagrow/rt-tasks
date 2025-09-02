import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { colors, radius, spacing } from '../theme';
import CategoryPill from './CategoryPill';
import type { Task, CategoryKey } from '../types';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  customCategories?: string[];
  onPress?: () => void;
}

export default function CompactTaskItem({ task, onToggle, onDelete, customCategories = [], onPress }: Props) {
  const translateX = React.useRef(new Animated.Value(0)).current;
  
  const pan = React.useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dy) < 10,
    onPanResponderMove: (_, g) => { if (g.dx < 0) translateX.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -100) {
        Animated.timing(translateX, { toValue: -600, duration: 180, useNativeDriver: true }).start(() => onDelete(task.id));
      } else {
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
      }
    }
  })).current;

  const progress = task.subtasks && task.subtasks.length > 0 
    ? task.subtasks.filter(s => s.done).length / task.subtasks.length 
    : 0;

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.deleteBg}>
        <Text style={styles.deleteText}>Удалить</Text>
      </View>
      
      <Animated.View style={[styles.compactCard, { transform: [{ translateX }] }]} {...pan.panHandlers}>
        <TouchableOpacity 
          onPress={() => {
            if (onPress) onPress();
          }} 
          style={{ flex: 1 }} 
          activeOpacity={0.7} 
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={styles.content}>
            {/* Чекбокс и заголовок */}
            <View style={styles.mainRow}>
              <TouchableOpacity 
                onPress={() => onToggle(task.id)} 
                style={{ zIndex: 10, padding: 4 }}
                activeOpacity={0.6}
              >
                <View style={[styles.checkbox, task.done && styles.checkboxOn]} />
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <Text style={[styles.title, task.done && styles.done]}>
                  {task.title || '(без названия)'}
                </Text>
                
                {/* Категории в одну строку */}
                {task.categories.length > 0 && (
                  <View style={styles.categoriesRow}>
                    {task.categories.slice(0, 2).map((c: CategoryKey) => (
                      <CategoryPill key={c} category={c} customCategories={customCategories} />
                    ))}
                    {task.categories.length > 2 && (
                      <Text style={styles.moreCategories}>+{task.categories.length - 2}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* Дополнительная информация */}
            <View style={styles.infoRow}>
              {/* Прогресс подзадач */}
              {task.subtasks && task.subtasks.length > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressWrap}>
                    <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
                  </Text>
                </View>
              )}

              {/* Приоритет */}
              {task.priority && (
                <View style={[styles.priorityBadge, styles[`priority${task.priority}`]]}>
                  <Text style={styles.priorityText}>
                    {task.priority === 'high' ? '!' : task.priority === 'medium' ? '•' : '○'}
                  </Text>
                </View>
              )}

              {/* Дата */}
              {task.dueAt && (
                <Text style={styles.dateText}>
                  {new Date(task.dueAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: spacing(1),
    position: 'relative',
    borderRadius: radius.md,
    overflow: 'hidden'
  },
  
  deleteBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#7f1d1d',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: spacing(2)
  },
  
  deleteText: {
    color: '#fff',
    fontFamily: 'Inter-Bold'
  },
  
  compactCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border
  },
  
  content: {
    gap: spacing(1)
  },
  
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(1)
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    marginTop: 2
  },
  
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  
  titleContainer: {
    flex: 1,
    gap: spacing(0.5)
  },
  
  title: {
    color: colors.text,
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    lineHeight: 20
  },
  
  done: {
    color: colors.subtext,
    textDecorationLine: 'line-through'
  },
  
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  
  moreCategories: {
    color: colors.subtext,
    fontSize: 12,
    fontFamily: 'Inter-Regular'
  },
  
  infoRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing(0.5),
    marginLeft: 28 // Отступ под чекбоксом
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(0.5)
  },
  
  progressWrap: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a2e',
    borderRadius: 2,
    overflow: 'hidden'
  },
  
  progressFill: {
    height: 4,
    backgroundColor: colors.accent
  },
  
  progressText: {
    color: colors.subtext,
    fontSize: 11,
    fontFamily: 'Inter-Regular'
  },
  
  priorityBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  priorityhigh: {
    backgroundColor: '#dc2626'
  },
  
  prioritymedium: {
    backgroundColor: '#f59e0b'
  },
  
  prioritylow: {
    backgroundColor: '#10b981'
  },
  
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Inter-Bold'
  },
  
  dateText: {
    color: colors.subtext,
    fontSize: 11,
    fontFamily: 'Inter-Regular'
  }
});
