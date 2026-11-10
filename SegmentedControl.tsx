import { Divider, Tooltip, Typography } from '@mui/material';
import styled from '@mui/styled-engine';
import { observer } from 'mobx-react-lite';
import React, { Key, useMemo } from 'react';

type Size = 'small' | 'normal';

export interface ControlItem<T extends Key> {
  key: T;
  label?: string;
  counter?: number;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends Key> {
  name: string;
  value: T;
  options: Array<ControlItem<T>>;
  onChange: (value: T) => void;
  size?: Size;
  disabled?: boolean;
  uppercase?: boolean;
}

const TOOLTIP_POPPER_PROPS = {
  modifiers: [{ name: 'offset', options: { offset: [0, -7] } }],
};

const isDividerHidden = <T extends Key>(
  options: Array<ControlItem<T>>,
  index: number,
  value: T,
) => {
  const isLast = index === options.length - 1;
  const isActive = options[index].key === value;
  const isBeforeActive = options[index + 1]?.key === value;

  return isLast || isActive || isBeforeActive;
};

function SegmentedControlComponent<T extends Key>({
  name,
  value,
  options,
  onChange,
  size = 'normal',
  disabled,
  uppercase = true,
}: SegmentedControlProps<T>) {
  const activeIndex = useMemo(
    () => options.findIndex((option) => option.key === value),
    [options, value],
  );

  return (
    <Root
      data-size={size}
      aria-disabled={disabled || undefined}
      style={
        {
          '--segments': options.length,
          '--active-index': Math.max(activeIndex, 0),
        } as React.CSSProperties
      }
    >
      <div className="inner" role="radiogroup">
        {options.map((option, index) => (
          <React.Fragment key={`${name}-${option.key}`}>
            <Tooltip
              title={option.description}
              arrow
              placement="top"
              PopperProps={TOOLTIP_POPPER_PROPS}
            >
              <Segment>
                {option.icon && <span className="icon">{option.icon}</span>}

                {option.label && (
                  <span className="text">
                    <Typography
                      variant={uppercase ? 'c1Bold' : 'c1Regular'}
                      fontWeight={uppercase ? 'bold' : undefined}
                      title={option.label}
                    >
                      {option.label}
                    </Typography>
                  </span>
                )}

                {option.counter != null && (
                  <span className="counter">
                    <Typography variant="c1Medium">{option.counter}</Typography>
                  </span>
                )}

                <input
                  type="radio"
                  name={name}
                  checked={value === option.key}
                  disabled={disabled || option.disabled}
                  onChange={() => onChange(option.key)}
                />
              </Segment>
            </Tooltip>

            <Divider
              data-testid={`divider-${name}-${index}`}
              variant="middle"
              orientation="vertical"
              sx={{
                height: 16,
                borderRadius: 4,
                visibility: isDividerHidden(options, index, value) ? 'hidden' : 'visible',
              }}
            />
          </React.Fragment>
        ))}

        {activeIndex !== -1 && <Slider aria-hidden />}
      </div>
    </Root>
  );
}

const Segment = styled('label')(({ theme }) => `
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 ${theme.spacing(1)};
  overflow: hidden;
  color: ${theme.palette.text.primary};
  text-align: center;
  border-radius: 12px;
  cursor: pointer;

  .icon {
    display: flex;
    align-items: center;

    & ~ .text {
      margin-left: 2px;
    }
  }

  .text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .counter {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    max-width: 20px;
    height: 20px;
    margin-left: 4px;
    color: #fff;
    background-color: ${theme.palette.primary.main};
    border-radius: 100px;
  }

  input[type='radio'] {
    position: absolute;
    inset: 0;
    margin: 0;
    opacity: 0;
    pointer-events: none;
  }

  &:hover:has(input:not(:checked)) {
    color: ${theme.palette.text.secondary};
  }

  &:has(input:focus-visible) {
    outline: 2px solid ${theme.palette.info.main};
    outline-offset: -2px;
  }

  &:has(input:disabled) {
    color: ${theme.palette.divider};
    cursor: not-allowed;
  }
`);

const Slider = styled('div')`
  position: absolute;
  z-index: 1;
  height: 100%;
  width: calc(100% / var(--segments));
  translate: calc(var(--active-index) * 100%) 0;
  background: #fff;
  border-radius: var(--slider-radius);
  pointer-events: none;
  transition: translate 200ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Root = styled('div')(({ theme }) => `
  --radius: ${theme.shape.borderRadius}px;
  --slider-radius: 12px;
  --height: 44px;

  display: flex;
  width: 100%;
  height: var(--height);
  padding: ${theme.spacing(0.5)};
  background-color: ${theme.palette.background.default};
  border-radius: var(--radius);

  &[data-size='small'] {
    --radius: ${theme.shape.borderRadius * 0.75}px;
    --slider-radius: 8px;
    --height: 32px;
  }

  .inner {
    position: relative;
    display: flex;
    flex: 1;
    flex-flow: row nowrap;
    align-items: center;
    overflow: hidden;
  }

  &[aria-disabled] {
    background-color: #f8f8fb;

    ${Slider} {
      background-color: #e6e8ee;
    }

    ${Segment} .counter {
      background-color: ${theme.palette.divider};
    }
  }
`);

export const SegmentedControl = observer(
  SegmentedControlComponent,
) as typeof SegmentedControlComponent;
