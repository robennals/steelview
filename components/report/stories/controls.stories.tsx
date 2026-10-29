import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChoiceGroup, FilterChips } from '../controls';
import { seriesColor } from '../scale';

const meta = {
  title: 'Foundations/Controls',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The two reader controls every interactive component shares. `ChoiceGroup` picks exactly one option (break down by, measure, year); `FilterChips` picks any number, and an empty selection means everything is shown.',
      },
    },
  },
} satisfies Meta;

export default meta;

function ChoiceDemo() {
  const [value, setValue] = useState<'route' | 'nationality' | 'year'>('route');
  return (
    <ChoiceGroup
      label="Break down by"
      value={value}
      onChange={setValue}
      choices={[{ value: 'route', label: 'Route' }, { value: 'nationality', label: 'Nationality' }, { value: 'year', label: 'Year' }]}
    />
  );
}

function ChipsDemo() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['asylum']));
  const choices = ['Work', 'Study', 'Family', 'Asylum', 'Other'].map((label, i) => ({ value: label.toLowerCase(), label, color: seriesColor(i + 1), count: [12, 8, 5, 9, 3][i] }));
  return <FilterChips label="Category" choices={choices} selected={selected} onChange={setSelected} />;
}

export const SingleChoice: StoryObj = { render: () => <ChoiceDemo /> };
export const MultipleFilter: StoryObj = { render: () => <ChipsDemo /> };
