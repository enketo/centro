# hi 👋

## get this thing going

1. Use node v20.9.0 (npm v10.1.0)
1. `npm i`
1. `npm start`
1. Go to http://localhost:3000/formList and make sure you can see `<formID>submitmessage</formID>` in the list.
   This comes from [storage/forms/submitmessage.xml](storage/forms/submitmessage.xml), and you can add your own XForms in that directory as well.

## get enketo going

1. Get a Redis running on ports 6379 and 6380. For example,
   ```
   docker run --rm -it --publish 6379:6379 --publish 6380:6379 redis
   ```
1. Get the Yarn stuff sorted
1. Start Enketo; do not create `config.json`, but set this one thing to an empty string using an environment variable:
   ```
   ENKETO_LINKED_FORM_AND_DATA_SERVER_SERVER_URL= yarn workspace enketo-express start
   ```
   You should see Enketo emit `No local config.json found. Will check environment variables instead.` when starting up.

   ⚠️ These instructions assume you do not have a `config.json`. If you do, please remove it or modify manually (latter is an exercise for the reader).
1. Make sure http://localhost:8005/ says "Enketo Smart Paper for KoBoCAT is running!"

## launch a test form

1. Tell the Enketo API to use the `submitmessage` form from this server:
   ```
   curl --user enketorules: -d 'server_url=http://localhost:3000&form_id=submitmessage' http://localhost:8005/api/v2/survey
   ```
1. You should receive a 201 response with a `url` like
   ```json
   {
       "url": "http://localhost:8005/some-identifier",
       "code": 201
   }
   ```

## test the custom submit message

1. Open the browser's developer console; go to the network activity section
1. Go to the http://localhost:8005/some-identifier URL returned above
1. See a response from http://localhost:8005/transform/xform/some-identifier that contains `kobo:submitMessage`
1. Submit something
1. See a response from http://localhost:8005/submission/some-identifier that contains `<message># Hello!`
    * HACK: This message is hard-coded in `app/controllers/submission.js`, not read from the submission

- - -

centro [![Build Status](https://travis-ci.org/enketo/centro.png)](https://travis-ci.org/enketo/centro)
=============

> **⚠️ Warning**
>
> **DO NOT USE THIS SERVER IN A PRODUCTION SETTING.**
>
> This lightweight development server has not gone through security audits or performance tests, hence is unsuitable for production use. Centro is intended for development and testing purposes only. Making this server able to handle a production environment is outside the scope of this project.

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
