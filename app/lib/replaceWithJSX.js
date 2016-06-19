const replaceWithJSX = (str, param, jsx) => {
  const n = str.indexOf(param);
  const res = [];
  res.push(str.slice(0, n));
  res.push(jsx);
  res.push(str.slice(n + param.length, str.length - 1));
  return res;
};

export default replaceWithJSX;
