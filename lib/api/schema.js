module.exports = {
  properties: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string',
      required: true
    },
    type: {
      type: 'string',
      required: true,
      enum: ['Class', 'Object']
    },
    rendererProcess: {
      type: 'boolean'
    },
    mainProcess: {
      type: 'boolean'
    },
    websiteUrl: {
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
    }
  }
}
