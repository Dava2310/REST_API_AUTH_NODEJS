import request from "supertest";
import app from '../../src/app.js'
import db from '../../src/DB/mysql.js'; // Asegúrate de que esta ruta sea correcta

describe("GET /", () => {

    test("should respond with a 200 status code", async () => {
        const response = await request(app).get('/').send();
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(200);
    })

    test("returns the message 'Hello World'", async () => {
        const response = await request(app).get('/').send();
        expect(response.body.body.message).toBe('Hello World');
    });

})

describe('POST /register', () => {

    describe('given correct data', () => {

        // Datos de prueba para el registro
        const newAdmin = {
            nombre: 'Daniel Alberto',
            apellido: 'Vetencourt Alvarez',
            email: 'dvetencourt23@gmail.com',
            password: '12345678',
            cargo: 'admin'
        };

        const newUser = {
            nombre: 'Armando Antonio',
            apellido: 'Chirivella Colmenares',
            email: 'dvetencourt231001@gmail.com',
            password: '12345678',
            cargo: 'user'
        };

        test('registers a new admin successfully', async () => {

            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newAdmin)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('User registered successfully');
        });
        
        test('registers a new user successfully', async() => {
            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('User registered successfully');
        })
    })



});

describe('POST /login', () => {

    describe('given correct credentials', () => {
        test('logs in a user successfully', async () => {
            const loginData = {
                email: 'dvetencourt23@gmail.com',
                password: '12345678'
            };

            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(200);
            expect(response.body.body.data).toHaveProperty('accessToken');
            expect(response.body.body.data).toHaveProperty('refreshToken');
        });
    })

    describe('given incorrect credentials', () => {
        test('fails to log in with incorrect credentials', async () => {
            const loginData = {
                email: 'testuser@example.com',
                password: 'WrongPassword!'
            };
    
            const response = await request(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
    
            expect(response.body.error).toBe(true);
            expect(response.body.statusCode).toBe(401);
            expect(response.body.body.message).toBe('Email or password is invalid');
        });
    })

});

afterAll(async () => {
    await db.pool.end(); // Cierra el pool al final de todas las pruebas
});