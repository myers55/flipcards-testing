const express = require('express');
const fs = require('file-system');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session');
const file = './data.json';
const salt = 'updatelater';
const server = express();
server.use(bodyParser.json())

server.get('/api/users', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    response.json(data);
})
server.post('/api/users/register', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    var password = request.body.password;
    var email = request.body.email;
    if (request.body.userName) {
        userName = request.body.userName;
    } else {
        userName = request.body.email;
    }
    if (email && password) {
        var hashed = crypto.pbkdf2Sync(password, salt, 10, 256, 'sha256').toString('base64');
        var newUser = {
            userName: userName,
            email: email,
            password: hashed,
            userId: data.length + 1,
            decks: []
        }
        data.push(newUser);
        var dataJSON = JSON.stringify(data);
        fs.writeFile(file, dataJSON, function (err) { });
    }
    delete newUser.password;
    response.json(newUser);
})
server.post('/api/users/login', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    var hashed = crypto.pbkdf2Sync(request.body.password, salt, 10, 256, 'sha256').toString('base64');
    var user = data.find(user => { return user.email === request.body.email && user.password === hashed });
    if (user) {
        request.session = {
            "user": {
                isAuthenticated: true,
                name: user.userName,
                email: user.email,
                userId: user.userId,
            }
        }
        response.json(request.session.user);
    } else if (data.find(user => { return user.email === request.body.email })) {
        response.json("Wrong password ")
    } else {
        response.json("Username not valid" )
    }
})
server.get('/api/session', (request, response) => {
    response.json(request.session);
})
server.get('/api/users/logout', (request, response) => {
    request.session.destroy(function (err) {
    });
    response.json({ message: "you have been logged out" });
});
server.get('/api/:userId/decks', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let userId = request.params.userId;
    let user = data.find(user => userId === userId);
    response.json(user.decks);
});
server.post('/api/:userId/decks', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let userId = request.params.userId;
    let user = data.find(user => userId === userId);
    var userIndex = data.findIndex(user => userId === userId);
    var newDeck = {
        deckName: request.body.name,
        deckId: user.decks.length + 1,
        cards: []
    }
    data[userIndex].decks.push(newDeck);
    var dataJSON = JSON.stringify(data);
    fs.writeFile(file, dataJSON, function (err) { });
    response.json(newDeck);
})
server.post('/api/:userId/:deckId/cards', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let userId = request.params.userId;
    let deckId = request.params.deckId;
    let userIndex = data.findIndex(user => userId === userId);
    let deckIndex = data[userIndex].decks.findIndex(deck => deckId);
    var newCard = {
        cardId: data[userIndex].decks[deckIndex].cards.length + 1,
        cardQuestion: request.body.question,
        cardAnswer: request.body.answer
    }
    data[userIndex].decks[deckIndex].cards.push(newCard);
    var dataJSON = JSON.stringify(data);
    fs.writeFile(file, dataJSON, function (err) { });
    response.json(newCard);
})
server.get('/api/:userId/decks/:deckId/cards/:cardId', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let currentUserId = request.params.userId;
    let currentDeckId = request.params.deckId;
    let currentCardId = request.params.cardId;
    let userIndex = data.findIndex(user => userId === userId);
    let deckIndex = data[userIndex].decks.findIndex(deck => deckId === deckId);
    let cardIndex = data[userIndex].decks[deckIndex].findIndex(card => cardId === cardId);
    let cardInfo = {
        cardUser: {
            userId: currentUserId,
            userIndex: userIndex
        },
        cardDeck: {
            deckId: currentDeckId,
            deckIndex: deckIndex
        },
        cardData: {
            cardId: data[userIndex].decks[deckIndex].cards[cardIndex].cardId,
            cardQuestion: data[userIndex].decks[deckIndex].cards[cardIndex].cardQuestion,
            cardAnswer: data[userIndex].decks[deckIndex].cards[cardIndex].cardAnswer,
        }
    }
    response.json(cardInfo);
})
server.put('/api/:userId/:deckId/:cardId', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let newCardQuestion = request.body.question;
    let newCardAnswer = request.body.answer;
    let userId = request.params.userId;
    let deckId = request.params.deckId;
    let cardId = request.params.cardId;
    let userIndex = data.findIndex(user => userId === userId);
    let deckIndex = data[userIndex].decks.findIndex(deck => deckId === deckId);
    let cardIndex = data[userIndex].decks[deckIndex].cards.findIndex(card => cardId === cardId);
    data[userIndex].decks[deckIndex].cards[cardIndex].cardQuestion = newCardQuestion;
    data[userIndex].decks[deckIndex].cards[cardIndex].cardAnswer = newCardAnswer;
    var dataJSON = JSON.stringify(data);
    fs.writeFile(file, dataJSON, function (err) { });
    response.json(data[userIndex].decks[deckIndex].cards[cardIndex]);
})
server.get('/api/:userId/:deckId/quiz', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let userId = request.params.userId;
    let deckId = request.params.deckId;
    let cardId = request.params.cardId;
    let userIndex = data.findIndex(user => userId === userId);
    let deckIndex = data[userIndex].decks.findIndex(deck => deckId === deckId);
    let randomCardIndex = Math.floor(Math.random) * data[userIndex].decks[deckIndex].cards.length;
    let card = data[userIndex].decks[deckIndex].cards[randomCardIndex];
    response.json(card);
})
server.delete('/api/:userId/:deckId/:cardId', (request, response) => {
    let data = JSON.parse(fs.readFileSync(file));
    let userId = request.params.userId;
    let deckId = request.params.deckId;
    let cardId = request.params.cardId;
    let userIndex = data.findIndex(user => userId === userId);
    let deckIndex = data[userIndex].decks.findIndex(deck => deckId === deckId);
    let cardIndex = data[userIndex].decks[deckIndex].cards.findIndex(card => cardId === cardId);
    data[userIndex].decks[deckIndex].cards = data[userIndex].decks[deckIndex].cards.splice[cardIndex,1];
    var dataJSON = JSON.stringify(data);
    fs.writeFile(file, dataJSON, function (err) { });
    response.json(data[userIndex].decks[deckIndex].cards);
})
module.exports = server;