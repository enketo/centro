centro [![Build Status](https://travis-ci.org/enketo/centro.png)](https://travis-ci.org/enketo/centro)
=============

A basic scaffolding of an ODK-compliant server for use with Enketo and ODK Collect. 

**No database - forms and submissions are stored as files.**

implements:

* [formList API](https://bitbucket.org/javarosa/javarosa/wiki/FormListAPI)

future:

* [submission API](https://bitbucket.org/javarosa/javarosa/wiki/FormSubmissionAPI)
* [authentication API](https://bitbucket.org/javarosa/javarosa/wiki/AuthenticationAPI)

### Pre-requisites
* NodeJS and npm

### Install
* install dependencies with `npm install`
* build with `grunt`

### Use
* place XForm in /storage/forms
* configure Enketo or ODK Collect to use this server

### Run
* run with `node .` or `npm start`

### Develop
* install [nodemon](https://github.com/remy/nodemon)
* run with `grunt develop` or `NODE_ENV=development node app.js`
* test with `grunt test`
