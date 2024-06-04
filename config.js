import dotenv from 'dotenv';
dotenv.config();

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value === null || value === undefined) {
    throw new Error(`dotenv error : Key ${key} 가 정의되지 않았거나 defaultValue를 설정하지 않음`);
  }
  
  return value;
}

export const config = {
  host: {
    port: parseInt(required('HOST_PORT', 8080)),
  },
  db : {
    host: required('DB_HOST'),
  }
}