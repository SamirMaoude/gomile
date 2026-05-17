// Tests for ProgressBar — the registration step indicator.
// The inner fill View width is expressed as a percentage string derived from
// the progress prop. This must be pixel-accurate because it is the primary
// visual cue for how many registration steps are remaining.

import React from 'react';
import { render } from '@testing-library/react-native';
import ProgressBar from '../../src/components/ProgressBar';

describe('ProgressBar — rendering', () => {
  test('renders without crashing', () => {
    expect(() => render(<ProgressBar progress={50} />)).not.toThrow();
  });
});

describe('ProgressBar — fill width', () => {
  test('sets inner view width to "0%" when progress is 0', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={0} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    // The second View is the fill bar; the first is the container.
    const fillView = views[1];
    expect(fillView.props.style).toEqual(
      expect.objectContaining({ width: '0%' })
    );
  });

  test('sets inner view width to "50%" when progress is 50', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={50} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const fillView = views[1];
    expect(fillView.props.style).toEqual(
      expect.objectContaining({ width: '50%' })
    );
  });

  test('sets inner view width to "100%" when progress is 100', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={100} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const fillView = views[1];
    expect(fillView.props.style).toEqual(
      expect.objectContaining({ width: '100%' })
    );
  });

  test('sets inner view width to "25%" when progress is 25', () => {
    const { UNSAFE_getAllByType } = render(<ProgressBar progress={25} />);
    const { View } = require('react-native');
    const views = UNSAFE_getAllByType(View);
    const fillView = views[1];
    expect(fillView.props.style).toEqual(
      expect.objectContaining({ width: '25%' })
    );
  });
});
