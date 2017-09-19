const express = require('express');
const server = require('./application.js');


server.listen(3000, function () {
    console.log('It Works, good job!');
});