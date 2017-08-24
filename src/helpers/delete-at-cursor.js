const deleteAtCursor = (text, textLength, selectionStart, selectionEnd) => {
  if (textLength < 1 || selectionStart === 0) {
    return {
      text,
      selectionStart,
      selectionEnd,
    };
  }


  const startPos = selectionStart || text.length;
  const endPos = selectionEnd || text.length;

  const newPos = (startPos - textLength) > 0 ? (startPos - textLength) : 0;
  let newText = text.substring(0, startPos - textLength);
  if (endPos < text.length) {
    newText += text.substring(endPos, text.length);
  }
  return {
    text: newText,
    selectionStart: newPos,
    selectionEnd: newPos,
  };
};

export default deleteAtCursor;
