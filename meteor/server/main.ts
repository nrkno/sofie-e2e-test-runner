/**
 * This file is the entry-point for Meteor's server side
 */

import '../lib/main'
// Set up environment
import './lib/jobs'
import './logging'

// Import all files that register Meteor methods:
import './api/various'
import './api/sources'
import './api/vessels'
import './api/logger'
import './api/documents'
import './api/workOrders'
import './api/workArtifacts'

// import all files that calls Meteor.startup:

// Setup publications and security:
import './publications/_publications'
import './security/_security'
