interface LimitCondition {
  [index: number]: string;
}

interface PrimaryKeyCondition {
  primaryKey: string;
  primaryValue: string | number;
}

interface UpdateParams {
  [key: string]: any;
}

const QUERY_TABLE = (tableName: string, limit?: LimitCondition, query?: string[]): string => {
  const limitSql = limit ? `WHERE ${limit[0]} = '${limit[1]}'` : '';
  const querySql = query ? query.join(',') : '*';
  return `SELECT ${querySql} FROM ${tableName} ${limitSql}`;
};

const INSERT_TABLE = (tableName: string): string => `INSERT INTO ${tableName} SET ?`;

const REPLACE_TABLE = (tableName: string): string => `REPLACE INTO ${tableName} SET ?`;

const UPDATE_TABLE = (
  tableName: string,
  { primaryKey, primaryValue }: PrimaryKeyCondition,
  { key, value }: { key: string; value: string | number }
): string => `UPDATE ${tableName} SET ${key} = '${value}' WHERE(${primaryKey}=${primaryValue});`;

const DELETE_TABLE = (
  tableName: string,
  { primaryKey, primaryValue }: PrimaryKeyCondition
): string => `DELETE FROM ${tableName} WHERE(${primaryKey}=${primaryValue});`;

const UPDATE_TABLE_MULTI = (
  tableName: string,
  { primaryKey, primaryValue }: PrimaryKeyCondition,
  params: UpdateParams
): string => {
  const sqlList: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    sqlList.push(`${key}='${value}'`);
  }
  return `UPDATE ${tableName} SET ${sqlList.join(',')} WHERE ${primaryKey}=${primaryValue}`;
};

export {
  QUERY_TABLE,
  INSERT_TABLE,
  UPDATE_TABLE,
  DELETE_TABLE,
  REPLACE_TABLE,
  UPDATE_TABLE_MULTI
}; 