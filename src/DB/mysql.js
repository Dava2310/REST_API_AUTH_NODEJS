import { createPool } from 'mysql2/promise';
import config from '../config.js';

const pool = createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
})

const createRecord = async (table, data) => {
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

    try {
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        throw error;
    }
};

const updateRecord = async (table, data, conditions = {}) => {
    // Construir la parte de SET con los datos a actualizar
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const setValues = Object.values(data);

    // Construir la parte de WHERE con las condiciones
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(conditions);

    // Combinar los valores de SET y WHERE
    const values = [...setValues, ...whereValues];

    // Construir la consulta SQL
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    try {
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        throw error;
    }
};

const findRecords = async (table, conditions = {}, limit = null) => {
    const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const values = Object.values(conditions);

    let sql = `SELECT * FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (limit) sql += ` LIMIT ${limit}`;

    try {
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        throw error;
    }
};

const findOneRecord = async (table, conditions = {}) => {
    const result = await findRecords(table, conditions, 1);
    return result[0] || null;
};

const deleteRecord = async (table, conditions = {}) => {
    const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const values = Object.values(conditions);

    let sql = `DELETE FROM ${table}`;
    if (whereClause) {
        sql += ` WHERE ${whereClause}`;
    }

    try {
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        throw error;
    }
};

export default { pool, createRecord, updateRecord, findRecords, findOneRecord, deleteRecord };