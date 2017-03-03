const merge = require('lodash.merge')

const commonSchema = {
  properties: {
    name: {
      type: 'string',
      required: true,
      allowEmpty: false
    },
    type: {
      type: 'string',
      required: true,
      enum: ['Class', 'Module', 'Structure', 'Element']
    }
  }
}

const apiSchema = {
  properties: {
    description: {
      type: 'string',
      required: true,
      allowEmpty: false
    },
    process: {
      type: 'object'
    },
    websiteUrl: {
      format: 'url',
      required: true
    },
    repoUrl: {
      format: 'url',
      required: true
    }
  }
}

const moduleSchema = {
  properties: {
    events: {
      type: 'array',
      allowEmpty: false
    },
    methods: {
      type: 'array',
      allowEmpty: false
    }
  }
}

const classSchema = {
  properties: {
    instanceEvents: {
      type: 'array',
      allowEmpty: false
    },
    instanceMethods: {
      type: 'array',
      allowEmpty: false
    },
    instanceProperties: {
      type: 'array',
      allowEmpty: false
    },
    staticMethods: {
      type: 'array',
      allowEmpty: false
    },
    instanceName: {
      type: 'string',
      required: true,
      allowEmpty: false
    }
  }
}

const elementSchema = {
  properties: {
    methods: {
      type: 'array'
    },
    attributes: {
      type: 'array',
      allowEmpty: false
    }
  }
}

module.exports = {
  Structure: merge({}, commonSchema),
  Module: merge({}, commonSchema, apiSchema, moduleSchema),
  Class: merge({}, commonSchema, apiSchema, classSchema),
  Element: merge({}, commonSchema, apiSchema, elementSchema)
}
