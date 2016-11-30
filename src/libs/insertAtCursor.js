const insertAtCursor = (text, toInsertText, selectionStart, selectionEnd) => {
  const startPos = selectionStart || text.length;
  const endPos = selectionEnd || text.length;

  return {
    text: text.substring(0, startPos)
        + toInsertText
        + text.substring(endPos, text.length),
    selectionStart: startPos + toInsertText.length,
    selectionEnd: startPos + toInsertText.length,
  };
};

export default insertAtCursor;
