export const merge = (first, second) => {
    for (let i = 0; i < second.length; i++) {
      for (let j = 0; j < second[i].data.length; j++) {
        first.push(second[i].data[j]);
      }
    }
    return first;
  };