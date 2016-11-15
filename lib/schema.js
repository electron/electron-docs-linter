module.exports = {
  properties: {
    name: {
      type: 'string',
      required: true,
      minlength: 2
    },
    description: {
      type: 'string',
      required: true,
      minlength: 10
    },
    type: {
      type: 'string',
      required: true,
      enum: ['Class', 'Module', 'Structure']
    },
    process: {
      type: 'object'
    },
    websiteUrl: {
      format: 'url'
    },
    repoUrl: {
      format: 'url'
    },
    events: {
      type: 'array',
      allowEmpty: false
    },
    instanceEvents: {
      type: 'array',
      allowEmpty: false
    },
    methods: {
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
    }
  }
}
