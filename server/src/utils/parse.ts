interface ParsedObject {
  [key: string]: any;
}

const parse = (array: ParsedObject[]): ParsedObject[] => {
  array.map(object => {
    for (let item in object) {
      try {
        object[item] = JSON.parse(object[item]);
      } catch {
        object[item] = JSON.parse(JSON.stringify(object[item]));
      }
    }
  });
  return array;
};

export { parse }; 