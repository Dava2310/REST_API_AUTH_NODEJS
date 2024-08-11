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

const updateRecord = async (table, data, id) => {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;

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

const deleteRecord = async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE id = ?`;

    try {
        const [result] = await pool.execute(sql, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

const deleteRecord_jwt = async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE userId = ?`;

    try {
        const [result] = await pool.execute(sql, [id]);
        return result;
    } catch (error) {
        throw error;
    }
};

export default { pool, createRecord, updateRecord, findRecords, findOneRecord, deleteRecord, deleteRecord_jwt };