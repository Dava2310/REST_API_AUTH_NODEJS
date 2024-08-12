import { createPool } from 'mysql2/promise';
import config from '../config.js';

const pool = createPool({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
});

/**
 * Inserts a new record into the specified table.
 *
 * @param {string} table - The name of the table to insert the record into.
 * @param {object} data - An object representing the column names and their corresponding values to be inserted.
 * @returns {Promise<object>} - The result of the insert operation, including the inserted record ID.
 * @throws {Error} - Throws an error if the insert operation fails.
 */
const createRecord = async (table, data) => {
    // Create placeholders for the values in the SQL statement
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    // Extract column names from the data object
    const columns = Object.keys(data).join(', ');
    // Extract values from the data object
    const values = Object.values(data);

    // Construct the SQL query for insertion
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;

    try {
        // Execute the query with the provided values
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        // Rethrow any error encountered during execution
        throw error;
    }
};

/**
 * Updates an existing record in the specified table based on given conditions.
 *
 * @param {string} table - The name of the table to update the record in.
 * @param {object} data - An object representing the column names and their new values.
 * @param {object} [conditions={}] - An object representing the conditions to match for the update operation.
 * @returns {Promise<object>} - The result of the update operation.
 * @throws {Error} - Throws an error if the update operation fails.
 */
const updateRecord = async (table, data, conditions = {}) => {
    // Construct the SET clause with the new values
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const setValues = Object.values(data);

    // Construct the WHERE clause with the conditions
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const whereValues = Object.values(conditions);

    // Combine values for SET and WHERE clauses
    const values = [...setValues, ...whereValues];

    // Construct the SQL query for the update
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

    try {
        // Execute the query with the combined values
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        // Rethrow any error encountered during execution
        throw error;
    }
};

/**
 * Retrieves records from the specified table based on given conditions.
 *
 * @param {string} table - The name of the table to retrieve records from.
 * @param {object} [conditions={}] - An object representing the conditions to match for the retrieval operation.
 * @param {number} [limit=null] - The maximum number of records to retrieve.
 * @returns {Promise<Array>} - An array of records that match the specified conditions.
 * @throws {Error} - Throws an error if the retrieval operation fails.
 */
const findRecords = async (table, conditions = {}, limit = null) => {
    // Construct the WHERE clause with the conditions
    const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const values = Object.values(conditions);

    // Construct the SQL query for selection
    let sql = `SELECT * FROM ${table}`;
    if (whereClause) sql += ` WHERE ${whereClause}`;
    if (limit) sql += ` LIMIT ${limit}`;

    try {
        // Execute the query and return the resulting rows
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        // Rethrow any error encountered during execution
        throw error;
    }
};

/**
 * Retrieves a single record from the specified table based on given conditions.
 *
 * @param {string} table - The name of the table to retrieve the record from.
 * @param {object} [conditions={}] - An object representing the conditions to match for the retrieval operation.
 * @returns {Promise<object|null>} - The record that matches the specified conditions, or null if no match is found.
 * @throws {Error} - Throws an error if the retrieval operation fails.
 */
const findOneRecord = async (table, conditions = {}) => {
    const result = await findRecords(table, conditions, 1);
    return result[0] || null;
};

/**
 * Deletes records from the specified table based on given conditions.
 *
 * @param {string} table - The name of the table to delete records from.
 * @param {object} [conditions={}] - An object representing the conditions to match for the deletion operation.
 * @returns {Promise<object>} - The result of the delete operation.
 * @throws {Error} - Throws an error if the delete operation fails.
 */
const deleteRecord = async (table, conditions = {}) => {
    // Construct the WHERE clause with the conditions
    const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

    const values = Object.values(conditions);

    // Construct the SQL query for deletion
    let sql = `DELETE FROM ${table}`;
    if (whereClause) {
        sql += ` WHERE ${whereClause}`;
    }

    try {
        // Execute the query and return the result
        const [result] = await pool.execute(sql, values);
        return result;
    } catch (error) {
        // Rethrow any error encountered during execution
        throw error;
    }
};

export default { pool, createRecord, updateRecord, findRecords, findOneRecord, deleteRecord };