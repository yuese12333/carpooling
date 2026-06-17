/**
 * @file badge.test.tsx
 * @description Badge 组件单元测试
 */

import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../badge';

// Mock cn 工具函数
jest.mock('../../src/utils', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

describe('Badge 组件', () => {
  test('使用 label 属性渲染文本', () => {
    render(<Badge label="测试徽章" />);
    expect(screen.getByText('测试徽章')).toBeTruthy();
  });

  test('使用 children 渲染文本', () => {
    render(<Badge>子元素徽章</Badge>);
    expect(screen.getByText('子元素徽章')).toBeTruthy();
  });

  test('label 优先于 children', () => {
    render(<Badge label="优先标签">子元素</Badge>);
    expect(screen.getByText('优先标签')).toBeTruthy();
    expect(screen.queryByText('子元素')).toBeNull();
  });

  test('渲染 React 节点作为 children', () => {
    render(
      <Badge>
        <Text testID="custom-badge-child">自定义</Text>
      </Badge>
    );
    expect(screen.getByTestId('custom-badge-child')).toBeTruthy();
  });

  test('不同 variant 渲染 - default', () => {
    render(<Badge variant="default">default</Badge>);
    expect(screen.getByText('default')).toBeTruthy();
  });

  test('不同 variant 渲染 - success', () => {
    render(<Badge variant="success">success</Badge>);
    expect(screen.getByText('success')).toBeTruthy();
  });

  test('不同 variant 渲染 - destructive', () => {
    render(<Badge variant="destructive">destructive</Badge>);
    expect(screen.getByText('destructive')).toBeTruthy();
  });

  test('应用自定义 className', () => {
    render(<Badge className="custom-class" testID="custom-badge">测试</Badge>);
    const badge = screen.getByTestId('custom-badge');
    expect(badge).toBeTruthy();
  });

  test('应用自定义 style', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<Badge style={customStyle} testID="styled-badge">样式</Badge>);
    const badge = screen.getByTestId('styled-badge');
    expect(badge).toBeTruthy();
  });

  test('应用 textClassName', () => {
    render(<Badge label="文本" textClassName="custom-text-class" />);
    expect(screen.getByText('文本')).toBeTruthy();
  });

  test('快照测试 - 默认变体', () => {
    const tree = render(<Badge label="快照测试" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('快照测试 - success 变体', () => {
    const tree = render(<Badge variant="success" label="成功" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('快照测试 - destructive 变体', () => {
    const tree = render(<Badge variant="destructive" label="危险" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
