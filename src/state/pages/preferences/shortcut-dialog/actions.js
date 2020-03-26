import {
  DIALOG_SHORTCUT_CLOSE,
  DIALOG_SHORTCUT_OPEN,
  DIALOG_SHORTCUT_SET_COMBINATOR,
} from '../../../../constants/actions';

export const close = () => ({
  type: DIALOG_SHORTCUT_CLOSE,
});

export const open = (identifier, combinator) => ({
  type: DIALOG_SHORTCUT_OPEN,
  identifier,
  combinator,
});

export const setCombinator = (combinator) => ({
  type: DIALOG_SHORTCUT_SET_COMBINATOR,
  combinator,
});
