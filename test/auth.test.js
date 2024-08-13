import request from "supertest";
import app from '../src/app.js'

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
        const newUser = {
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'TestPassword123!',
            role: 'user'
        };

        test('registers a new user successfully', async () => {

            // Haciendo la solicitud POST a /register
            const response = await request(app)
                .post('/api/auth/register')
                .send(newUser)
                .expect(201);

            // Verificar que la respuesta sea como se espera
            expect(response.body.error).toBe(false);
            expect(response.body.status).toBe(201);
            expect(response.body.body.message).toBe('User registered successfully');
        });
    })



});

describe('POST /login', () => {

    describe('given correct credentials', () => {
        test('logs in a user successfully', async () => {
            const loginData = {
                email: 'testuser@example.com',
                password: 'TestPassword123!'
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