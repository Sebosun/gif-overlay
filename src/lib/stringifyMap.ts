function replacer(_key: string, value: Map<unknown, unknown>) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

// JSON doesn't parse maps correctly by default
export function stringifyMap(v: Map<unknown, unknown>): string {
  return JSON.stringify(v, replacer)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reviver(key: unknown, value: any) {
  if (typeof value === 'object' && value !== null && value.dataType === 'Map') {
    return new Map(value.value);
  }
  return value;
}


export function restoreStringifiedMap(j: string): Map<unknown, unknown> {
  return JSON.parse(j, reviver)
}

