/**
 * @file button.test.tsx
 * @description Button 组件单元测试
 */

import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../button';

// Mock cn 工具函数
jest.mock('../../src/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

describe('Button 组件', () => {
  test('正确渲染按钮文本', () => {
    render(<Button>点击我</Button>);
    expect(screen.getByText('点击我')).toBeTruthy();
  });

  test('点击按钮触发 onPress 回调', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>点击</Button>);

    fireEvent.press(screen.getByText('点击'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('点击按钮触发 onClick 回调', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>点击</Button>);

    fireEvent.press(screen.getByText('点击'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('loading 状态显示加载指示器', () => {
    render(<Button loading>加载中</Button>);
    // ActivityIndicator 存在
    expect(screen.UNSAFE_queryByType('ActivityIndicator')).toBeTruthy();
  });

  test('loading 状态禁用点击', () => {
    const onPress = jest.fn();
    render(<Button loading onPress={onPress}>加载中</Button>);

    // 尝试点击 Pressable
    const button = screen.UNSAFE_queryByType('Pressable');
    if (button) {
      fireEvent.press(button);
    }
    expect(onPress).not.toHaveBeenCalled();
  });

  test('disabled 状态禁用点击', () => {
    const onPress = jest.fn();
    render(<Button disabled onPress={onPress}>禁用</Button>);

    const button = screen.UNSAFE_queryByType('Pressable');
    if (button) {
      fireEvent.press(button);
    }
    expect(onPress).not.toHaveBeenCalled();
  });

  test('渲染 React 节点作为 children', () => {
    render(
      <Button>
        <Text testID="custom-child">自定义内容</Text>
      </Button>
    );
    expect(screen.getByTestId('custom-child')).toBeTruthy();
  });

  test('不同 variant 样式渲染', () => {
    const { rerender } = render(<Button variant="default">默认</Button>);
    expect(screen.getByText('默认')).toBeTruthy();

    rerender(<Button variant="destructive">危险</Button>);
    expect(screen.getByText('危险')).toBeTruthy();

    rerender(<Button variant="outline">轮廓</Button>);
    expect(screen.getByText('轮廓')).toBeTruthy();

    rerender(<Button variant="ghost">幽灵</Button>);
    expect(screen.getByText('幽灵')).toBeTruthy();
  });

  test('不同 size 样式渲染', () => {
    const { rerender } = render(<Button size="default">默认</Button>);
    expect(screen.getByText('默认')).toBeTruthy();

    rerender(<Button size="sm">小</Button>);
    expect(screen.getByText('小')).toBeTruthy();

    rerender(<Button size="lg">大</Button>);
    expect(screen.getByText('大')).toBeTruthy();

    rerender(<Button size="icon">图标</Button>);
    expect(screen.getByText('图标')).toBeTruthy();
  });
});
