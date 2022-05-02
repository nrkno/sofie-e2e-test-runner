/**
 * This file is the entry-point for Meteor's server side
 */

import '../lib/main'
// Set up environment
import './logging'

// Import all files that register Meteor methods:
import './api/various'
import './api/sources'
import './api/logger'

// import all files that calls Meteor.startup:

// Setup publications and security:
import './publications/_publications'
import './security/_security'
