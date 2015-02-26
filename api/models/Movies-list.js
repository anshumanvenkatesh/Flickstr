/**
* Movies-list.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    title: {
      type: "string",
      required: 'true'
    },
    desc: {
      type: "string",
      required: 'false'
    },
    comments: {
      type: 'string',
      required: 'false'
    },
    poster: {
      type: 'url',
      required: 'false'
    },
    genre: {
      type: 'string',
      required: 'false'
    }

  }
};

