const expressMocker = require('supertest');
const assert = require('assert');
const application = require('./application.js');
const crypto = require('crypto');
const fs = require('file-system');
var data = require('./data.json');
const file = './data.json';
const session = require('express-session');

describe('FlipCards', () => {
    before((done) => {
        data = [];
        var dataJSON = JSON.stringify([]);
        fs.writeFile(file, dataJSON, function (err) {
            done();
        });
    });
    it('should allow you to register', (done) => {
        expressMocker(application)
            .post('/api/users/register')
            .expect(200)
            .send({
                "userName": "Dylan",
                "email": "example@cards.com",
                "password": "qwer1234"
            })
            .expect(response => {
                assert.deepEqual(response.body,
                    {
                        "userName": "Dylan",
                        "email": "example@cards.com",
                        "userId": 1,
                        "decks": []
                    })
            })
            .end(done);
    })
    it('should display error for incorrect email login', (done) => {
        expressMocker(application)
            .post('/api/users/login')
            .expect(200)
            .send({
                "email": "exampl@cards.comm",
                "password": "qwer1234"
            })
            .expect(response => {
                assert.equal(response.body, "Username not valid")
            })
            .end(done)
    });
    it('should display error for incorrect password', (done) => {
        expressMocker(application)
            .post('/api/users/login')
            .expect(200)
            .send({
                "email": "example@cards.com",
                "password": "wer12345"
            })
            .expect(response => {
                assert.equal(response.body, "Wrong password ")
            })
            .end(done)
    })
    it('should allow a user to log in', (done) => {
        expressMocker(application)
            .post('/api/users/login')
            .expect(200)
            .send({
                "email": "example@cards.com",
                "password": "qwer1234"
            })
            .expect(response => {
                assert.deepEqual(response.body,
                    {
                        "isAuthenticated": true,
                        "name": "Dylan",
                        "email": "example@cards.com",
                        "userId": 1,
                    })
            })
            .end(done);
    })
    it('should allow a user to create a new deck', (done) => {
        expressMocker(application)
            .post('/api/1/decks')
            .expect(200)
            .send({
                "name": "Mathmatics"
            })
            .expect(response => {
                assert.deepEqual(response.body, 
                    {
                        "deckName": "Mathmatics",
                        "deckId": 1,
                        "cards": []
                    });
            })
            .end(done);
    })
    it('should allow a user to view all their decks', (done) => {
        expressMocker(application)
            .get('/api/1/decks')
            .expect(200)
            .expect(response => {
                assert.deepEqual(response.body, [
                    {
                        "deckName": "Mathmatics",
                        "deckId": 1,
                        "cards": []
                    }]);
            })
            .end(done);
    })
    it('should allow a user to create a card in a deck', (done) => {
        expressMocker(application)
            .post('/api/1/1/cards')
            .expect(200)
            .send({
                "question": "5+5",
                "answer": "55"
            })
            .expect(response => {
                assert.deepEqual(response.body, 
                    {
                        "cardId": 1,
                        "cardQuestion": "5+5",
                        "cardAnswer": "55"
                    });
            })
            .end(done)
    })
    it('should allow a user to edit a card in a deck', (done) => {
        expressMocker(application)
            .put('/api/1/1/1')
            .expect(200)
            .send({
                "question": "5+5",
                "answer": "10"
            })
            .expect(response => {
                assert.deepEqual(response.body,
                {
                    "cardId": 1,
                    "cardQuestion": "5+5",
                    "cardAnswer": "10"              
                });
            })
            .end(done);
    })
    it('should allow a user to view a random card in a deck', (done) => {
        expressMocker(application)
            .get('/api/1/1/quiz')
            .expect(200)
            .expect(response => {
                assert.notEqual(response.body, null);
            })
            .end(done);
    })
     it('should allow a user to delete a card in a deck', (done) => {
        expressMocker(application)
            .delete('/api/1/1/1')
            .expect(200)
            .expect(response => {
                assert.equal(response.body, []);
            })
            .end(done);
    })
})